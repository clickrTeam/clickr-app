# CLI Keyboard Profile Grammar

```
<profile> = profile STRING <config_block> <layer_blocks> ...

<config_block> = config { <config_entry> ... }
<config_entry> = default_layer = STRING
               | default_behavior = <behavior>
               | tap_timeout = NUMBER
               | hold_time = NUMBER
               | chord_timeout = NUMBER
               | sequence_timeout = NUMBER
               | combo_timeout = NUMBER
               | advanced = BOOLEAN

<behavior> = capture
           | release
           | wait

<layer_block> = layer STRING { <statement> ... }

<statement> = <lhs> = <rhs>

<lhs> = <advanced_key>
      | chord( [<key>, ...], <behavior>, <timeout> )
      | sequence( [<key>, ...], <behavior>, <timeout> )
      | tap( <key> )
      | hold( <key> )
      | combo( [<advanced_key>, ...], <behavior>, <timeout> )

<advanced_key> = <key>
               | ^<key>
               | _<key>

<key> = a
      | b
      | esc
      | space
      | ...

<rhs> = <action> | [ <action>, ... ]

<action> = <advanced_key>
         | none
         | layer( STRING )
         | run( STRING, STRING )
         | open_app( STRING )
```

---

## Profile

The `profile` defines the top-level configuration for a keyboard layout. It includes a name, a config block for global settings, and one or more layers.

---

## Config Block

The `config` block sets global parameters for the profile:

- **default_layer**: the layer that is active when the profile starts.  
- **default_behavior**: default behavior for triggers (capture, release, or wait).  
- **tap_timeout**: maximum duration in milliseconds to recognize a tap.  
- **hold_time**: minimum duration in milliseconds to recognize a hold.  
- **chord_timeout**: maximum time in milliseconds between keys in a chord.  
- **sequence_timeout**: maximum time in milliseconds between keys in a sequence.  
- **combo_timeout**: maximum time in milliseconds for complex combos.  
- **advanced**: a boolean flag to enable advanced features.

---

## Behavior

Behavior controls how key events are handled in chords, sequences, and combos:

- **capture**: key events are kept even if the chord/combo fails.  
- **release**: key events are discarded if the chord/combo fails.  
- **wait**: keys are captured and released if the chord/combo fails.

---

## Layer Block

A `layer` groups key mappings under a named context. Layers can be switched dynamically and contain multiple statements that map triggers to actions.

---

## Statement

A `statement` maps a left-hand side trigger to a right-hand side action or list of actions. Each statement defines how a key or combination of keys should behave.

---

## Left-Hand Side (LHS)

The LHS defines triggers for actions:

- **advanced_key**: a single key, optionally prefixed with `^` (press) or `_` (release).
- **chord([keys], behavior, timeout)**: multiple keys pressed and held simultaneously with specified behavior and timeout.
- **sequence([keys], behavior, timeout)**: a series of keys tapped in order (tap sequence) with specified behavior and timeout.
- **tap(key)**: a single key tap.
- **hold(key)**: a single key hold.
- **combo([advanced_keys], behavior, timeout)**: complex triggers allowing per-key press/release control with behavior and timeout.

---

## Advanced Key

An advanced key can be:

- **key**: standard key behavior (press and release).  
- **^key**: triggers on press only.  
- **_key**: triggers on release only.

---

## Keys

Keys represent all valid inputs, including letters, numbers, function keys, arrows, and modifiers. This is the fundamental unit used in triggers.

---

## Right-Hand Side (RHS)

The RHS defines actions triggered by LHS keys. It can be a single action or an array of actions.

---

## Actions

Actions specify what happens when a trigger is activated:

- **advanced_key**: triggers a key with optional press/release behavior.
- **none**: no action.
- **layer("new layer name")**: switch to a different layer.
- **run("interpreter", "script")**: execute a script with an interpreter.
- **open_app("app name")**: launch an application.

---

## Other

- Comments: `#` can be used to turn the remainder of a line into a comment.  
- Newlines are significant. Blocks (like `config` and `layer`) must be properly structured across lines. You cannot freely add newlines; they define statement boundaries.  
- Indentation within a block matters and must be consistent for readability and correct parsing.  
- Spaces and tabs within a single line are mostly fine.  
- Consistent use of newlines and indentation is required to avoid syntax errors.

---

This structure provides a flexible, human-readable DSL for defining advanced keyboard layouts, including layers, chords, sequences, combos, and complex behaviors.
