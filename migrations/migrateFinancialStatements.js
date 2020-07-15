import mongoose from 'mongoose'
import financialService from '../services/DBServices/financialService.js'
import companyService from '../services/DBServices/companyService.js'

// in find all it will calculate new methods (in default function)
// then we save what is default

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/stock')
  // Write migration here
  const companies = await companyService.getAll()

  for (let i = 0; i < companies.length; i++) {
    const financialStatements = await financialService.findAll(companies[i].symbol, {})

    for (let i = 0; i < financialStatements.length; i++) {
      const financialStatement = financialStatements[i]

      await financialStatement.save()
    }
  }

  console.info('Completed successfully! Result: ')
  process.exit()
})()
