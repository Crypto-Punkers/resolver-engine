export async function firstResult<T, R>(things: T[], check: (thing: T) => Promise<R | null>): Promise<R | null> {
  for (const thing of things) {
    const result = await check(thing);
    if (result) {
      return result;
    }
  }
  return null;
}

export async function namedFirstResult<T, R>(
  things: T[],
  check: (thing: T) => Promise<R | null>,
): Promise<[R, string] | null> {
  for (const thing of things) {
    const result = await check(thing);
    if (result) {
      const name = typeof thing === "function" ? thing.name : thing.toString();
      return [result, name];
    }
  }
  return null;
}
