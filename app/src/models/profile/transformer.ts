export type WithUI<T, U = Record<string, unknown>> = T & U

export function hydrate<
  TStorage,
  TUI = Record<string, never>
>(storage: TStorage, ui?: Partial<TUI>): WithUI<TStorage, TUI> {
  return { ...(storage as object), ...(ui ?? {}) } as WithUI<TStorage, TUI>;
}

export function stripStorage<TStorage extends object, TCombined extends object>(
  storageTemplate: TStorage,
  combined: TCombined
): TStorage {
  const result: Partial<TStorage> = {};
  for (const key of Object.keys(storageTemplate) as Array<keyof TStorage>) {
    result[key] = (combined as any)[key];
  }
  return result as TStorage;
}

