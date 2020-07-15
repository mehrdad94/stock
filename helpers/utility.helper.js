// turn [1, 2, 3] with count 2
// to [[1, 2], [2, 3]]
export const toMultipleArrayWithNthElement = (array, count)=> {
  if (array.length <= count) return array

  const remaining = array.length - count
  const result = []

  for (let i = 0; i < remaining + 1; i++) {
    result.push(array.slice(i, count + i))
  }

  return result
}
