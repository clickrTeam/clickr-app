import { keyShortLabels, REPRESENTED_KEYS } from "@renderer/components/VisualKeyboard/Layout.const"
import { ENSURE_KEYS } from "../../../models/Keys.enum"
import log from "electron-log"

export function startup_assertions() {
  ENSURE_KEYS_ON_LAYOUT(REPRESENTED_KEYS)
  // ENSURE_KEYS_ON_LAYOUT(REPRESENTED_KEYS_80) // If we add multiple keys

  ENSURE_KEYS_ON_DISPLAY_MAP(keyShortLabels)
}

function ENSURE_KEYS_ON_LAYOUT(represented_keys: string[]) {
  for (const key of represented_keys) {
    if (!ENSURE_KEYS.includes(key)) {
      log.error(`ERROR~ Misconfigured key within layout! ${key}`);
    }
  }
}

function ENSURE_KEYS_ON_DISPLAY_MAP(keyShortLabels: Record<string, string>) {
  for (const key of Object.keys(keyShortLabels)) {
    if (!ENSURE_KEYS.includes(key)) {
      log.error(`ERROR~ Misconfigured key within display map! ${key}`);
    }
  }
}

