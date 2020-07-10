import dotenv from 'dotenv'
import mongoose from 'mongoose'
import queue from 'async/queue.js'
import asyncify from 'async/asyncify.js'
import { getCodalFinancialInfo, getCodalFinancialLinks } from './services/scraper_codal.js'
import FinancialService from './services/DBServices/FinancialService.js'
import FinancialErrorService from './services/DBServices/financialError.service.js'
// dotenv.config()

// connect to db
// const mongoURL = process.env.MONGO_URL
(async () => {
  // connect to db
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/stock')

    const symbol = 'کیسون'
    const financialLinks = await getCodalFinancialLinks({ symbol })

    const results = []

    const financialLinksQueue = queue(asyncify(async function (task) {
      results.push(await getCodalFinancialInfo({ url: task.url }))

      return results
    }), 2)

    for (let i = 0; i < financialLinks.length; i++) {
      const letterSerial = new URL(financialLinks[i].link).searchParams.get('LetterSerial')
      const isItInDatabase =  await FinancialService.findOne(symbol,{ letterSerial })

      if (!isItInDatabase) financialLinksQueue.push({ url: financialLinks[i].link })
    }

    console.log('before results')

    await financialLinksQueue.drain()

    for (let i = 0; i < results.length; i++) {
      try {
        await FinancialService.create(symbol, {
          symbol,
          ...results[i]
        })
      } catch (e) {
        const isItInDatabase =  await FinancialErrorService.findOne({ letterSerial: results[i].letterSerial })

        if (!isItInDatabase) {
          await FinancialErrorService.create({
            symbol,
            ...results[i],
            error: e.toString()
          })
        }
      }
    }
  } catch (e) {
    console.error('find me', e)
  }


  console.log('saved')
})()
