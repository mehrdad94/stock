// turn string to number
export const toNumber = s => {
  let result = s.replace(/,/g, '')
  const isNegative = result.includes('(') ? -1 : 1

  result = result.replace(/\(/g, '').replace(/\)/g, '')

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

export const transformColumns = (base, target, operation) => {
  const result = {}

  Object.keys(base).forEach(key => {
    const targetMap = target[key]

    const group = base[key][0]

    result[key] = [group.map(row => {
      if (row['عنوان'] === 'عنوان') return row

      const result2 = {}

      Object.keys(row).forEach(year => {
        if (isNaN(toNumber(targetMap[year]))) result2[year] = row[year]
        else result2[year] = operation(toNumber(row[year]), toNumber(targetMap[year]))
      })

      return result2
    })]

  })

  return result
}