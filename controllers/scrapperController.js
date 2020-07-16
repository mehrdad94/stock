import express from 'express'

import asyncWrapper from '../utilities/async-wrapper.js'
// import validator from '../middleware/validator.js'
import {getCodalFinancialInfo, getCodalFinancialLinks} from '../services/scraper_codal.js'
import queue from 'async/queue.js'
import asyncify from 'async/asyncify.js'
import FinancialService from '../services/DBServices/financialService.js'
import FinanceErrorService from '../services/DBServices/financialError.service.js'
import PriceService from '../services/DBServices/priceService.js'
import PriceErrorService from '../services/DBServices/priceError.service.js'

import { scrapPriceData } from '../services/scraper_tsetmc.js'

const router = express.Router()

// POST api/scrapper/statements
router.post('/statements', asyncWrapper(async ({ body }, res) => {
  const { symbol, searchInErrors } = body

  let financialLinks

  if (searchInErrors) {
    // TODO CAN not pass symbol as query
    const getFinancialLinksThatHasError = await FinanceErrorService.findAll({})
    financialLinks = getFinancialLinksThatHasError.map(financial => financial.baseURL)
  } else {
    financialLinks = await getCodalFinancialLinks({ symbol })
  }

  const financialLinksQueue = queue(asyncify(async function (task) {
    return await getCodalFinancialInfo({ url: task.url })
  }), 2)

  for (let i = 0; i < financialLinks.length; i++) {
    const letterSerial = new URL(financialLinks[i]).searchParams.get('LetterSerial')
    const isItInDatabase =  await FinancialService.findOne({ letterSerial })

    if (!isItInDatabase) financialLinksQueue.push({ url: financialLinks[i] })
  }

  if (financialLinksQueue.length()) await financialLinksQueue.drain()

  res.sendStatus(200)
}))

router.post('/prices', asyncWrapper(async ({ body }, res) => {
  const { symbol, searchInErrors } = body

  let symbols = []
  if (searchInErrors) {
    const getFinancialLinksThatHasError = await PriceErrorService.findAll({})

    symbols = getFinancialLinksThatHasError.map(financial => financial.symbol)
  } else {
    symbols.push(symbol)
  }

  const priceQueue = queue(asyncify(async function (task) {
    return await scrapPriceData({ symbol: task.symbol })
  }), 2)


  for (let i = 0; i < symbols.length; i++) {
    const isItInDatabase =  await PriceService.findOne({ symbol: symbols[i] })

    if (!isItInDatabase) priceQueue.push({ symbol: symbols[i] })
  }

  if (priceQueue.length()) await priceQueue.drain()

  res.sendStatus(200)
}))

export default router
