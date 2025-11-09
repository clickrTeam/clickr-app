use crate::{
    ast::{Bind, Config, ConfigEntry, Profile},
    utils::Spanned,
};
use miette::{miette, LabeledSpan, Severity};
use std::{
    collections::{hash_map::Entry, HashMap},
    mem::discriminant,
};

const LARGE_TIMEOUT_WARNING_THRESHOLD: usize = 5_000;

impl Profile {
    pub fn check(&self) -> Vec<miette::Report> {
        let mut result = vec![];
        self.config.check(self, &mut result);
        self.check_layers(&mut result);

        result
    }

    fn check_layers(&self, result: &mut Vec<miette::Report>) {
        if self.layers.is_empty() {
            result.push(miette!(
                severity = Severity::Error,
                "Profile must contain at least 1 layer",
            ));
            return;
        }

        let mut seen: HashMap<&str, &Spanned<_>> = HashMap::new();
        let mut name_to_index: HashMap<&str, usize> = HashMap::new();
        let mut graph: Vec<Vec<usize>> = Vec::with_capacity(self.layers.len());

        for (i, layer) in self.layers.iter().enumerate() {
            let name = layer.name.as_str();
            name_to_index.insert(name, i);

            if let Some(original) = seen.get(name) {
                let err = miette!(
                    severity = Severity::Error,
                    labels = vec![
                        LabeledSpan::new(
                            Some("original layer definition".to_string()),
                            original.span.start(),
                            original.span.len()
                        ),
                        LabeledSpan::new(
                            Some("duplicate layer definition".to_string()),
                            layer.span.start(),
                            layer.span.len()
                        ),
                    ],
                    "Duplicate layer name '{}'",
                    name
                );
                eprintln!("{:?}", err); // optional: useful for debugging
            } else {
                seen.insert(name, layer);
            }
        }

        for layer in self.layers.iter() {
            graph.push(
                layer
                    .value
                    .statements
                    .iter()
                    .flat_map(|s| &s.rhs)
                    .filter_map(|s| match &s.value {
                        Bind::ChangeLayer(s) => {
                            let name = s.as_str();
                            match name_to_index.entry(name) {
                                Entry::Occupied(entry) => Some(*entry.get()),
                                Entry::Vacant(_) => {
                                    result.push(miette!(
                                        severity = Severity::Error,
                                        labels = vec![LabeledSpan::new(
                                            Some(format!("unknown layer: {}", s.value)),
                                            s.span.start(),
                                            s.span.len()
                                        ),],
                                        "reference to undefined layer"
                                    ));
                                    None
                                }
                            }
                        }
                        _ => None,
                    })
                    .collect(),
            );
        }

        let default_layer = self.config.entries.iter().find_map(|c| match &c.value {
            ConfigEntry::DefaultLayer(default_layer) => Some(default_layer),
            _ => None,
        });

        let default_layer_idx = match default_layer {
            Some(s) if !name_to_index.contains_key(s.as_str()) => {
                result.push(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some(format!("unknown layer: {}", s.value)),
                        s.span.start(),
                        s.span.len()
                    ),],
                    "default layer not found"
                ));
                return;
            }
            Some(s) => name_to_index[s.as_str()],
            None => 0,
        };

        let unreachable_layers = Profile::find_unreachable_layers(&graph, default_layer_idx);
        for layer_idx in unreachable_layers {
            let layer = &self.layers[layer_idx];
            result.push(miette!(
                severity = Severity::Warning,
                labels = vec![LabeledSpan::new(
                    Some(format!("unreachable layer: {}", layer.name.value)),
                    layer.span.start(),
                    layer.span.len()
                ),],
                help = "Add a remapping to switch to this layer",
                "Layer can never be reached"
            ))
        }
    }

    fn find_unreachable_layers(graph: &[Vec<usize>], start: usize) -> Vec<usize> {
        let mut visited = vec![false; graph.len()];
        let mut stack = vec![start];
        visited[start] = true;

        while let Some(node) = stack.pop() {
            for &neighbor in &graph[node] {
                if !visited[neighbor] {
                    visited[neighbor] = true;
                    stack.push(neighbor);
                }
            }
        }

        visited
            .iter()
            .enumerate()
            .filter_map(|(i, &v)| if !v { Some(i) } else { None })
            .collect()
    }
}

impl Config {
    pub fn check(&self, profile: &Profile, result: &mut Vec<miette::Report>) {
        let mut seen: HashMap<_, &Spanned<ConfigEntry>> = HashMap::new();
        let mut default_layer_name = None;

        for entry in self.entries.iter() {
            let disc = discriminant(&entry.value);

            if let Some(original) = seen.get(&disc) {
                // Duplicate found: report both original and repeated
                result.push(miette!(
                    severity = Severity::Warning,
                    labels = vec![
                        LabeledSpan::new(
                            Some("original configuration entry".to_string()),
                            original.span.start(),
                            original.span.len()
                        ),
                        LabeledSpan::new(
                            Some("duplicate configuration entry".to_string()),
                            entry.span.start(),
                            entry.span.len()
                        ),
                    ],
                    "Duplicate configuration entry ignored"
                ));
            } else {
                seen.insert(disc, entry);
            }

            // Track default layer
            if let ConfigEntry::DefaultLayer(name) = &entry.value && default_layer_name.is_none() {
                default_layer_name = Some(name);
            }

            // Large timeout warning
            if let Some(timeout) = entry.get_timeout() && timeout >= LARGE_TIMEOUT_WARNING_THRESHOLD {
                result.push(miette!(
                    severity = Severity::Warning,
                    labels = vec![LabeledSpan::new(
                        Some("timeout exceeds recommended threshold".to_string()),
                        entry.span.start(),
                        entry.span.len()
                    )],
                    "Timeout value {} exceeds threshold of {}",
                    timeout,
                    LARGE_TIMEOUT_WARNING_THRESHOLD
                ));
            }
        }

        // Default layer existence check
        if let Some(layer_name) = default_layer_name {
            let exists = profile
                .layers
                .iter()
                .any(|layer| layer.name.value == layer_name.value);

            if !exists {
                result.push(miette!(
                    severity = Severity::Error,
                    labels = vec![LabeledSpan::new(
                        Some("default_layer not found in profile".to_string()),
                        layer_name.span.start(),
                        layer_name.span.len()
                    )],
                    "default_layer '{}' does not exist in profile layers",
                    layer_name.value
                ));
            }
        }
    }
}

impl ConfigEntry {
    fn get_timeout(&self) -> Option<usize> {
        match self {
            ConfigEntry::TapTimeout(t)
            | ConfigEntry::HoldTime(t)
            | ConfigEntry::ChordTimeout(t)
            | ConfigEntry::SequenceTimeout(t)
            | ConfigEntry::ComboTimeout(t) => Some(t.value),
            _ => None,
        }
    }
}
