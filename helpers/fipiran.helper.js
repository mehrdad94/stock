// turn string to number
export const toNumber = s => {
  let result = s.replace(',', '')
  const isNegative = result.includes('(') ? -1 : 1

  result = result.replace('(', '').replace(')', '')

  result = parseInt(result)

  return isNegative * result
}

// set results title from NaN to something meaningful
export const setResultsTitle = (results, title) => {
  Object.keys(results).forEach(key => {
    Object.keys(results[key]).forEach(key2 => {
      if (key2 === 'عنوان') results[key][key2] = title
    })
  })

  return results
}

export const transformGroups = (groups, operation) => {
  const result = {}

  Object.keys(groups[0]).forEach(key => {
    result[key] = {}

    Object.keys(groups[0][key]).forEach(key2 => {
      result[key][key2] = operation(...groups.map(group => toNumber(group[key][key2])))
    })
  })

  return result
}
