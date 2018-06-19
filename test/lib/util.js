export function expectA (...args) {
  if (args.length === 2) {
    const [ actual, expected ] = args;

    expect(actual).toBeInstanceOf(expected);
    return actual;
  }

  const [ expected ] = args;

  return actual => expectA(actual, expected);
}

export function expectEqual (...args) {
  if (args.length === 2) {
    const [ actual, expected ] = args;

    expect(actual).toEqual(expected);

    return actual;
  }

  const [ expected ] = args;

  return actual => expectEqual(actual, expected);
}
