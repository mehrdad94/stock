import constants from '../constants/index.js'
import { goToPage, interceptRequest } from '../helpers/puppeteer.helper.js'
import { devenToPersianDate } from '../helpers/dates.helper.js'
import PriceService from '../services/DBServices/priceService.js'
import PriceErrorService from '../services/DBServices/priceError.service.js'

// scrap daily price data
export const getIndexData = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const requestFinished = async request => {
        if (request.url().includes('t=value')) {
          const response = await request.response()
          const textResponse = await response.text()

          const rows = textResponse.split(';')
          const result = rows.map(row => {
            const columns = row.split(',')
            return {
              date: columns[0],
              price: columns[1]
            }
          })

          resolve(result)
        }
      }

      await interceptRequest({ url: constants.INDEX_URL, requestFinished })

    } catch (e) {
      reject(e)
    }
  })
}

const getSymbolPriceData = async ({ symbol }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const page = await goToPage({ url: constants.TSETMC })

      await page.evaluate(() => { document.getElementById('search').click() })

      // await page.type('#SearchKey', symbol)
      await page.focus('#SearchKey')
      await page.keyboard.type(symbol, {})
      await page.keyboard.press('ArrowDown')

      await page.waitForSelector('#SearchResult table')

      const symbolUrl = await page.evaluate(() => {
        const firstElement = $('#SearchResult table tr').map((index, element) => $(element).find('td:first a').get(0)).get(0)

        if (firstElement) return firstElement.href
        else return false
      })

      if (!symbolUrl) new Error('Could not find symbol in tsetmc')

      page.close()

      const pricePage = await goToPage({ url: symbolUrl, options: { waitUntil: 'networkidle0' } })

      await pricePage.setRequestInterception(true)

      const requestFinished = async request => {
        if (request.url().includes('TradeHistory')) {
          const response = await request.response()
          const textResponse = await response.text()

          const rows = textResponse.split(';')
          const priceHistory = rows.map(string => {
            const [
              date,
              firstPrice,
              lowestPrice,
              lastPrice,
              lastDealPrice,
              highestPrice,
              previousDayPrice,
              worth,
              volume,
              count
            ] = string.split('@')

            return {
              date: devenToPersianDate(date),
              firstPrice,
              lowestPrice,
              lastPrice,
              lastDealPrice,
              highestPrice,
              previousDayPrice,
              worth,
              volume,
              count
            }
          }).reverse()

          pricePage.close()

          resolve(priceHistory)
        }
      }

      pricePage.on('request', request => { request.continue() })

      pricePage.on('requestfinished', requestFinished)

      //ii.ShowTradeHistory(999999999,1)
      await pricePage.evaluate(() => { window.ii.ShowTab(17);  })

      console.log('waiting for price data')
    } catch (e) {
      reject(e)
    }
  })
}

export const scrapPriceData = async ({ symbol }) => {
  try {
    const priceHistory = await getSymbolPriceData({ symbol })

    console.log('get price history')
    const indexData = await getIndexData()
    console.log('got price history')
    await PriceErrorService.deleteOne({ symbol })
    return await PriceService.create({ symbol, priceHistory, indexData })
  } catch (e) {
    console.error(e)

    return await PriceErrorService.create({
      symbol,
      error: e.toString()
    })
  }
}