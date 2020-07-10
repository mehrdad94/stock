import { getStockFinancialInfo } from '../scraper_fipiran.js'
import {
  liquidityRatios,
  activityRatios,
  profitabilityRatios,
  investmentRatios,
  priceAnalysis
} from './finantial.analysis.services.js'
import propEq from 'ramda/src/propEq.js'

const findInSheets = sheets => propName => {
  const result = {}

  Object.keys(sheets).forEach(key => {
    result[key] = sheets[key][0].find(propEq('عنوان', propName))
  })

  return result
}

export const getStockAnalysis = async ({ url }) => {
  const { balanceSheet, incomeIndex, stockPrices } = await getStockFinancialInfo({ url })

  const findInBalance = findInSheets(balanceSheet)
  const findInIncome = findInSheets(incomeIndex)

  // liquidityRatios
  const currentRatio = liquidityRatios.currentRatio(findInBalance('دارایی جاری'), findInBalance('بدهی جاری'))

  // activityRatios
  // TODO sales param is not right and memoize findInIncome
  const assetsTurnoverRatio = activityRatios.assetsTurnoverRatio(findInIncome('فروش'), findInBalance('دارایی'))
  const fixedAssetsTurnoverRatio = activityRatios.fixedAssetsTurnoverRatio(findInIncome('فروش'), findInBalance('دارایی ثابت'))
  const inventoryTurnoverRatio = activityRatios.inventoryTurnoverRatio(findInBalance('موجودی کالا'), findInIncome('فروش'))
  const inventoryWorkingCapitalRatio = activityRatios.inventoryWorkingCapitalRatio(findInBalance('موجودی کالا'), findInBalance('بدهی جاری'), findInBalance('دارایی جاری'))
  const currentCapitalTurnover = activityRatios.currentCapitalTurnover(findInIncome('فروش'), findInBalance('بدهی جاری'), findInBalance('دارایی جاری'))

  // profitabilityRatios
  const grossProfitRatio = profitabilityRatios.grossProfitRatio(findInIncome('سود ناخالص'), findInIncome('فروش'))
  const operatingProfitRatio = profitabilityRatios.operatingProfitRatio(findInIncome('سود عملیاتی'), findInIncome('فروش'))
  const salesReturnsRatio = profitabilityRatios.salesReturnsRatio(findInIncome('سود خالص'), findInIncome('فروش'))
  const specialValueReturnRatio = profitabilityRatios.specialValueReturnRatio(findInIncome('سود خالص'), findInBalance('حقوق صاحبان سهام'))
  const assetReturnsRatio = profitabilityRatios.assetReturnsRatio(findInIncome('سود خالص'), findInBalance('دارایی'))
  const workingCapitalReturnsRatio = profitabilityRatios.workingCapitalReturnsRatio(findInIncome('سود خالص'), findInBalance('سرمایه'))

  // investmentRatios
  const fixedAssetsSpecialValueRatio = investmentRatios.fixedAssetsSpecialValueRatio(findInBalance('دارایی ثابت'), findInBalance('حقوق صاحبان سهام'))
  const liabilitiesSpecialValueRatio = investmentRatios.liabilitiesSpecialValueRatio(findInBalance('بدهی'), findInBalance('حقوق صاحبان سهام'))
  const currentLiabilitiesSpecialValueRatio = investmentRatios.currentLiabilitiesSpecialValueRatio(findInBalance('بدهی جاری'), findInBalance('حقوق صاحبان سهام'))
  const propertyRightsRatio = investmentRatios.propertyRightsRatio(findInBalance('حقوق صاحبان سهام'), findInBalance('دارایی'))
  const leverageAssetsToEquityRatio = investmentRatios.leverageAssetsToEquityRatio(findInBalance('دارایی'), findInBalance('حقوق صاحبان سهام'))
  // price analysis
  const yearlyReturn = priceAnalysis.yearlyReturn(stockPrices)
  const expectedReturn = priceAnalysis.expectedReturn(stockPrices)
  const beta = priceAnalysis.beta(stockPrices)

  // dupont framework
  const Dupont = {
    returnOnEquity: specialValueReturnRatio,
    profitabilityReturnOnSales: salesReturnsRatio, // how much dollar is profit for 100 dollar sails
    efficiencyAssetTurnover: assetsTurnoverRatio, // how much dollar will generate with 1 dollar worth of assets
    leverageAssetsToEquityRatio: leverageAssetsToEquityRatio
  }

  // normalized balance sheet
  const normalizeBalanceSheetBySales = investmentRatios.normalizeSheet(balanceSheet, findInIncome('فروش'))
  const normalizeBalanceSheetByAssets = investmentRatios.normalizeSheet(balanceSheet, findInIncome('دارایی'))
  const normalizeIncomeStatementBySales = investmentRatios.normalizeSheet(incomeIndex, findInIncome('فروش'))
  const normalizeIncomeStatementByAssets = investmentRatios.normalizeSheet(incomeIndex, findInIncome('دارایی'))

  return {
    liquidityRatios: {
      currentRatio
    },
    activityRatios: {
      assetsTurnoverRatio,
      fixedAssetsTurnoverRatio,
      inventoryTurnoverRatio,
      inventoryWorkingCapitalRatio,
      currentCapitalTurnover
    },
    profitabilityRatios: {
      grossProfitRatio,
      operatingProfitRatio,
      salesReturnsRatio,
      specialValueReturnRatio,
      assetReturnsRatio,
      workingCapitalReturnsRatio
    },
    investmentRatios: {
      fixedAssetsSpecialValueRatio,
      liabilitiesSpecialValueRatio,
      currentLiabilitiesSpecialValueRatio,
      propertyRightsRatio
    },
    priceAnalysis: {
      yearlyReturn,
      expectedReturn,
      beta
    },
    Dupont,
    normalizedSheets: {
      normalizeBalanceSheetBySales,
      normalizeBalanceSheetByAssets,
      normalizeIncomeStatementBySales,
      normalizeIncomeStatementByAssets
    }
  }
}

(async () => {
	await getStockAnalysis({ url: 'http://www.fipiran.com/Symbol?symbolpara=%D9%83%D9%8A%D8%B3%D9%88%D9%86' })
})()
