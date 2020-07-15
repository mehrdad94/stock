import mongoose from 'mongoose'
import priceService from '../services/DBServices/priceService.js'

// in find all it will calculate new methods (in default function)
// then we save what is default

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/stock')
  // Write migration here
  const prices = await priceService.findAll({})

  console.log(prices)
  // for (let i = 0; i < prices.length; i++) {
  //   const financialStatement = prices[i]
  //
  //   await financialStatement.save()
  // }

  console.info('Completed successfully! Result: ')
  process.exit()
})()
