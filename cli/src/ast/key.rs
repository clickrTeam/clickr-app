use std::str::FromStr;

#[rustfmt::skip]
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum KeyIdent {
    // Letters
    A, B, C, D, E, F, G, H, I, J, K, L, M,
    N, O, P, Q, R, S, T, U, V, W, X, Y, Z,

    // Digits
    Num0, Num1, Num2, Num3, Num4,
    Num5, Num6, Num7, Num8, Num9,

    // Function keys
    F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,

    // Modifiers (left/right)
    ShiftLeft,
    ShiftRight,
    CtrlLeft,
    CtrlRight,
    AltLeft,
    AltRight,
    MetaLeft,
    MetaRight,

    // Navigation and editing
    Esc,
    Tab,
    CapsLock,
    Enter,
    Backspace,
    Space,
    Insert,
    Delete,
    Home,
    End,
    PageUp,
    PageDown,

    // Arrows
    Up,
    Down,
    Left,
    Right,

    // Symbols
    Minus,
    Equals,
    LeftBracket,
    RightBracket,
    Backslash,
    Semicolon,
    Quote,
    Comma,
    Period,
    Slash,
    Grave, // `
}

#[rustfmt::skip]
impl FromStr for KeyIdent {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        use KeyIdent::*;
        Ok(match s.to_lowercase().as_str() {
            // Letters
            "a" => A, "b" => B, "c" => C, "d" => D, "e" => E, "f" => F,
            "g" => G, "h" => H, "i" => I, "j" => J, "k" => K, "l" => L,
            "m" => M, "n" => N, "o" => O, "p" => P, "q" => Q, "r" => R,
            "s" => S, "t" => T, "u" => U, "v" => V, "w" => W, "x" => X,
            "y" => Y, "z" => Z,

            // Digits
            "0" => Num0, "1" => Num1, "2" => Num2, "3" => Num3, "4" => Num4,
            "5" => Num5, "6" => Num6, "7" => Num7, "8" => Num8, "9" => Num9,

            // Function keys
            "f1" => F1, "f2" => F2, "f3" => F3, "f4" => F4, "f5" => F5,
            "f6" => F6, "f7" => F7, "f8" => F8, "f9" => F9, "f10" => F10,
            "f11" => F11, "f12" => F12,

            // Modifiers
            "shiftleft" => ShiftLeft, "shiftright" => ShiftRight,
            "ctrlleft" => CtrlLeft, "ctrlright" => CtrlRight,
            "altleft" => AltLeft, "altright" => AltRight,
            "metaleft" => MetaLeft, "metaright" => MetaRight,

            // Navigation / editing
            "esc" => Esc, "tab" => Tab, "capslock" => CapsLock, "enter" => Enter,
            "backspace" => Backspace, "space" => Space,
            "insert" => Insert, "delete" => Delete, "home" => Home, "end" => End,
            "pageup" => PageUp, "pagedown" => PageDown,

            // Arrows
            "up" => Up, "down" => Down, "left" => Left, "right" => Right,

            // Symbols
            "-" => Minus, "=" => Equals, "[" => LeftBracket, "]" => RightBracket,
            "\\" => Backslash, ";" => Semicolon, "'" => Quote, "," => Comma,
            "." => Period, "/" => Slash, "`" => Grave,

            _ => return Err(()),
        })
    }
}
