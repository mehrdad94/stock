import express from 'express'

import asyncWrapper from '../utilities/async-wrapper.js'
// import validator from '../middleware/validator.js'
import {getCodalFinancialInfo, getCodalFinancialLinks} from '../services/scraper_codal.js'
import queue from 'async/queue.js';
import asyncify from 'async/asyncify.js';
import FinancialService from '../services/DBServices/financialService.js'

const router = express.Router()

// POST api/scrapper/statements
router.post('/statements', asyncWrapper(async ({ body }, res) => {
  const { symbol } = body

  const financialLinks = await getCodalFinancialLinks({ symbol })

  const financialLinksQueue = queue(asyncify(async function (task) {
    return await getCodalFinancialInfo({ url: task.url })
  }), 2)

  for (let i = 0; i < financialLinks.length; i++) {
    const letterSerial = new URL(financialLinks[i].link).searchParams.get('LetterSerial')
    const isItInDatabase =  await FinancialService.findOne(symbol,{ letterSerial })

    if (!isItInDatabase) financialLinksQueue.push({ url: financialLinks[i].link })
  }

  await financialLinksQueue.drain()

  res.sendStatus(200)
}))

export default router
