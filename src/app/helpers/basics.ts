export const intersection = <T>(arrA: Array<T>, arrB: Array<T>): T[] => {
  return arrA.filter(x => arrB.includes(x));
};
