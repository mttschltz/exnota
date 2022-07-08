function has<P extends PropertyKey>(
  target: unknown,
  property: P
): target is {[K in P]: unknown} {
  return typeof target === 'object' && target !== null && property in target;
}

export {has};
