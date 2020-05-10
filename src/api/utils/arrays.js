function areUndefined(x, y) {
  return x === undefined && y === undefined;
}

// arrayCompare :: (a -> a -> Bool) -> [a] -> [a] -> Bool
// eslint-disable-next-line max-len
exports.arrayCompare = (f) => ([x, ...xs]) => ([y, ...ys]) => (areUndefined(x, y) ? true : Boolean(f(x)(y)) && this.arrayCompare(f)(xs)(ys));

// strict equal :: a -> a -> Bool
exports.strictArrayEq = (x) => (y) => x === y;

// non strict equal :: [a] -> [a] -> Bool
// eslint-disable-next-line eqeqeq
exports.nonStrictArrayEq = (x) => (y) => x == y;

// arrayStrictEqual :: [a] -> [a] -> Bool
exports.arrayStrictEqual = this.arrayCompare(this.strictArrayEq);

// arrayNonStrictEqual :: [a] -> [a] -> Bool
exports.arrayNonStrictEqual = this.arrayCompare(this.nonStrictArrayEq);
