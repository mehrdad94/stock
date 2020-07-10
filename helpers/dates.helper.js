import groupWith from 'ramda/src/groupWith.js'
import momentJalaali from 'moment-jalaali'

// group chart data(X and Y, X must be jalaali dates) with same year
export const groupWithSameYear = groupWith((a, b) => momentJalaali(a[0]).jYear() === momentJalaali(b[0]).jYear())

export const toEnglishDigit = replaceString => {
  const find = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const replace = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  let regex
  for (let i = 0; i < find.length; i++) {
    regex = new RegExp(find[i], 'g')
    replaceString = replaceString.replace(regex, replace[i])
  }
  return replaceString
}

// TODO ADD warning form more than one date
export const extractFirstDateFromString = string => {
  const result = string.match(/(\d{1,4}([.\-/])\d{1,2}([.\-/])\d{1,4})/g)

  if (!result) return ''
  else return result[0]
}

// TODO ADD warning form more than one period
export const extractFirstPeriod = string => {
  const result = string.match(/دوره (\d) ماهه/g)

  if (!result) return ''
  else return result[0]
}
