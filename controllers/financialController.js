import express from 'express'

import asyncWrapper from '../utilities/async-wrapper.js'
// import validator from '../middleware/validator.js'
import FinanceService from '../services/DBServices/financialService.js'
import PriceService from '../services/DBServices/priceService.js'
import CompanyService from '../services/DBServices/companyService.js'

const router = express.Router()

// POST api/finance/statements
router.post('/statements', asyncWrapper(async ({ body }, res) => {
  res.json(await FinanceService.findAll(body))
}))

router.post('/prices', asyncWrapper(async ({ body }, res) => {
  res.json(await PriceService.findAll(body))
}))

// GET api/finance/companies
router.get('/companies', asyncWrapper(async (req, res) => {
  res.json(await CompanyService.getAll())
}))

export default router
