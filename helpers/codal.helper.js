import { parseHTML, stripHTML } from '../helpers/dom.helper.js'
import tableToJson from 'tabletojson'
import { toEnglishDigit } from './dates.helper.js'
import { toNumber } from './fipiran.helper.js'
import fromPairs from 'ramda/src/fromPairs.js'

const convertCodalTable = (html, ignoreColumns) => {
  return tableToJson.Tabletojson.convert(html, {
    useFirstRowForHeadings: true,
    ignoreColumns
  })
}

const isValidHeading = (headerContent, date) => {
  const content = toEnglishDigit(stripHTML(headerContent || ''))

  return (content.includes('شرح') || content.includes(date))
}

// add another row for duplicate columns
const splitDuplicateColumns = json => {
  const table = json[0]
  const result = []

  table.forEach(item => {
    const firstColumn = {}
    const secondColumn = {}
    Object.keys(item).forEach(key => {
      if (key.endsWith('_3')) throw new Error('more than three column detected')
      else if (key.endsWith('_2')) secondColumn[key.replace('_2', '')] = item[key]
      else firstColumn[key] = item[key]
    })

    result.push(firstColumn)

    if (Object.keys(secondColumn).length) result.push(secondColumn)
  })

  return result
}

export const normalizeNumbers = json => {
  json.forEach((item) => {
    Object.keys(item).forEach(key => {
      if (item[key] && key !== 'شرح') {
        item[key] = toNumber(toEnglishDigit(item[key]))
      }
    })
  })
}

export const convertCodalHTMLTableToJson = ({ html, date }) => {
  const $ = parseHTML(html)
  // get headings
  const headings = $.find('th').toArray().map(item => item.innerHTML)

  // find useless headings
  const uselessHeadings = []
  headings.forEach((header, index) => { if (!isValidHeading(header, date)) uselessHeadings.push(index)} )

  // parse table
  const parsedTable = convertCodalTable(html, uselessHeadings)

  // normalize table
  const splittedJson = splitDuplicateColumns(parsedTable)

  normalizeNumbers(splittedJson)

  return splittedJson
}

export function extractTableFromCodal () {
  const table = window.$('th:contains(شرح)').closest('table')
  const rowsLength = table.find('tr').length

  if (rowsLength === 1) {
    const nextTableRows = window.$('th:contains(شرح)').closest('table').next().find('table tr')

    nextTableRows.each((index, row) => {
      if ($(row).hasClass('HiddenRow')) return

      $(row).find('td.Hidden').remove()

      table.find('tbody').append(row)
    })
  } else if (table.find('thead tr').length > 1) { // multiple header we should make it one
    const secondHeaderText = table.find('thead tr').eq(1).find('th').toArray().map(item => item.innerText)
    const headersThatNeedADate = table.find('thead tr').first().find('th:contains(پایان)')

    headersThatNeedADate.each((index, element) => {
      element = $(element)

      element.text(element.text() + ' ' + secondHeaderText[index])
    })

    table.find('thead tr').eq(1).remove()
  }

  return window.$('th:contains(شرح)').closest('table').get(0).outerHTML
}

export const prettifyCodalJson = json => json.filter(item => (item['شرح'] && item['شرح'] !== 'شرح'))
                                              .map(item => fromPairs([Object.values(item)]))
                                              .filter(item => Object.values(item)[0] !== '')
                                              .reduce((a, b) => {
                                                a[Object.keys(b)[0]] = Object.values(b)[0]
                                                return a
                                              }, {})
