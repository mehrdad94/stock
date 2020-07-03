import groupWith from 'ramda/src/groupWith.js'
import momentJalaali from 'moment-jalaali'

// group chart data(X and Y, X must be jalaali dates) with same year
export const groupWithSameYear = groupWith((a, b) => momentJalaali(a[0]).jYear() === momentJalaali(b[0]).jYear())
