import mongoose from 'mongoose'
import {groupWithSameYear} from '../helpers/dates.helper.js'
import { toMultipleArrayWithNthElement } from '../helpers/utility.helper.js'
import zip from 'ramda/src/zip.js'
import head from 'ramda/src/head.js'
import last from 'ramda/src/last.js'
import intersection from 'ramda/src/intersection.js'
import momentJalaali from 'moment-jalaali'
import {percentIncrease, variance, covariance} from '../helpers/math.helper.js'
import mean from 'ramda/src/mean.js'

import constants from '../constants/index.js'
const Schema = mongoose.Schema

const getYearlyReturns = (xData, yData) => {
  const groupedData = groupWithSameYear(zip(xData, yData))
  const firstAndLastInGroup = groupedData.map(groupedData => [head(groupedData), last(groupedData)])

  const returns = firstAndLastInGroup.map(groupedData => [momentJalaali(groupedData[0][0], 'jYYYY/jMM/jDD').jYear(), percentIncrease(groupedData[0][1], groupedData[1][1])]).filter(item => !isNaN(item[1]))

  return toMultipleArrayWithNthElement(returns, 5)
}

export const priceSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  priceHistory: {
    type: Schema.Types.Mixed,
    required: true
  },
  indexData: {
    type: Schema.Types.Mixed,
    required: true
  },
  yearlyReturn: {
    type: Schema.Types.Mixed,
    default: function () {
      const xData = this.priceHistory.map(item => item.date)
      const yData = this.priceHistory.map(item => parseInt(item.lastPrice))

      return getYearlyReturns(xData, yData)
    }
  },
  risk: {
    type: Schema.Types.Mixed,
    default: function () {
      return this.yearlyReturn.map(returns => {
        const date = head(last(returns))

        return [date, Math.sqrt(variance(returns.map(item => item[1])))]
      })
    }
  },
  meanFiveReturns: {
    type: Schema.Types.Mixed,
    default: function () {
      return this.yearlyReturn.map(returns => {
        const date = head(last(returns))

        return [date, mean(returns.map(item => item[1]))]
      })
    }
  },
  returnOnRisk: {
    type: Schema.Types.Mixed,
    default: function () {
      return this.meanFiveReturns.map(returns => {
        const risk = this.risk.find(item => item[0] === returns[0])[1]
        return [returns[0], returns[1] / risk]
      })
    }
  },
  beta: {
    type: Schema.Types.Mixed,
    default: function () {
      const xData = this.priceHistory.map(item => item.date)
      const indexXData = this.indexData.map(item => item.date)

      const similarDates = intersection(xData, indexXData)
      const similarDatesKeyValue = similarDates.reduce((a, b) => { a[b] = b; return a}, {})

      // get filtered history and index data
      const filteredPriceHistory = this.priceHistory.filter(item => similarDatesKeyValue[item.date] )
      const filteredIndexData = this.indexData.filter(item => similarDatesKeyValue[item.date] )

      const filteredXData = filteredPriceHistory.map(item => item.date)
      const filteredYData = filteredPriceHistory.map(item => parseInt(item.lastPrice))

      const filteredIndexXData = filteredIndexData.map(item => item.date)
      const filteredIndexYData = filteredIndexData.map(item => parseInt(item.price))

      const stockYearlyReturns = getYearlyReturns(filteredXData, filteredYData)
      const marketYearlyReturns = getYearlyReturns(filteredIndexXData, filteredIndexYData)

      return stockYearlyReturns.map((returns, index) => {
        const date = head(last(returns))

        const covarianceFirstItem = marketYearlyReturns[index].map(item => item[1])
        const covarianceSecondItem = returns.map(item => item[1])

        return [date, covariance(covarianceFirstItem, covarianceSecondItem) / variance(covarianceSecondItem)]
      })
    }
  },
  expectedReturn: {
    type: Schema.Types.Mixed,
    default: function () {
      return this.meanFiveReturns.map((returns) => {
        const beta = this.beta.find(item => item[0] === returns[0])

        if (!beta) return null
        else return [returns[0], constants.BONDS_PROFIT + ( beta[1] * (returns[1] - constants.BONDS_PROFIT) )]
      }).filter(item => item)
    }
  }
})

export default mongoose.model('price', priceSchema, 'pricesHistory')
