use crate::{
    ast::{Config, ConfigEntry, Profile},
    utils::Spanned,
};
use miette::{miette, LabeledSpan, Severity};
use std::{collections::HashMap, mem::discriminant};

#[derive(Debug, Default)]
pub struct CheckResult {
    pub warnings: Vec<miette::Report>,
    pub errors: Vec<miette::Report>,
}

const LARGE_TIMEOUT_WARNING_THRESHOLD: usize = 5_000;

impl Profile {
    pub fn check(&self) -> CheckResult {
        let mut check_results = CheckResult::default();
        self.config.check(self, &mut check_results);

        check_results
    }
}

impl Config {
    pub fn check(&self, profile: &Profile, results: &mut CheckResult) {
        let mut seen: HashMap<_, &Spanned<ConfigEntry>> = HashMap::new();
        let mut default_layer_name = None;

        for entry in self.entries.iter() {
            let disc = discriminant(&entry.value);

            if let Some(original) = seen.get(&disc) {
                // Duplicate found: report both original and repeated
                results.warnings.push(miette!(
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
                results.warnings.push(miette!(
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
                .any(|layer| layer.value.name.value == layer_name.value);

            if !exists {
                results.errors.push(miette!(
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
