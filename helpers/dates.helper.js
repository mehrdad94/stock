import groupWith from 'ramda/src/groupWith.js'
import momentJalaali from 'moment-jalaali'

// group chart data(X and Y, X must be jalaali dates) with same year
export const groupWithSameYear = groupWith((a, b) => momentJalaali(a[0], 'jYYYY/jMM/jDD').jYear() === momentJalaali(b[0], 'jYYYY/jMM/jDD').jYear())

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


export const devenToPersianDate = (a) => {
  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]
  function div(c,d){return Math.floor(c/d)}
  function gregorian_to_jalali(a){var e,d,c;var n,m,l;var b,h;var k;var f;e=a[0]-1600;d=a[1]-1;c=a[2]-1;b=365*e+div((e+3),4)-div((e+99),100)+div((e+399),400);for(f=0;f<d;++f){b+=g_days_in_month[f]}if(d>1&&((e%4==0&&e%100!=0)||(e%400==0))){++b}b+=c;h=b-79;k=div(h,12053);h%=12053;n=979+33*k+4*div(h,1461);h%=1461;if(h>=366){n+=div((h-1),365);h=(h-1)%365}for(f=0;f<11&&h>=j_days_in_month[f];++f){h-=j_days_in_month[f]}m=f+1;l=h+1;return new Array(n,m,l)}

  const j=gregorian_to_jalali(new Array(a.substring(0,4),a.substring(4,6),a.substring(6)));
  return j[0]+"/"+j[1]+"/"+j[2]
}
