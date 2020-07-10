import { setResultsTitle, transformGroups, transformColumns } from '../../helpers/fipiran.helper.js'
import { groupWithSameYear } from '../../helpers/dates.helper.js'
import zip from 'ramda/src/zip.js'
import head from 'ramda/src/head.js'
import last from 'ramda/src/last.js'
import mean from 'ramda/src/mean.js'
import momentJalaali from 'moment-jalaali'
import { percentIncrease } from '../../helpers/math.helper.js'
import { variance, covariance} from '../../helpers/math.helper.js'
import constants from '../../constants/index.js'

// liquidityRatios container
export const liquidityRatios = {
  currentRatio (currentAssets, currentLiability) {
    return {
      ratio: setResultsTitle(transformGroups([currentAssets, currentLiability], (first, second) => first / second), 'نسبت جاری')
      // average, has trend, ...
    }
  }
}

export const activityRatios = {
  assetsTurnoverRatio (netSales, totalAssets) {
    return {
      ratio: setResultsTitle(transformGroups([netSales, totalAssets], (first, second) => first / second), 'نسبت گردش دارایی')
    }
  },
  fixedAssetsTurnoverRatio (netSales, fixedAssets) {
    return {
      ratio: setResultsTitle(transformGroups([netSales, fixedAssets], (first, second) => first / second), 'نسبت گردش دارایی دارایی های ثابت')
    }
  },
  inventoryTurnoverRatio (inventory, inventorySales) {
    return {
      ratio: setResultsTitle(transformGroups([inventory, inventorySales], (first, second) => 360 * first / second), 'دوره گردش کالا')
    }
  },
  inventoryWorkingCapitalRatio (inventory, currentLiabilities, currentAssets) {
    return {
      ratio: setResultsTitle(transformGroups([inventory, currentLiabilities, currentAssets], (first, second, third) => first / (second - third)), 'نسبت موجودی کالا به سرمایه در گردش')
    }
  },
  currentCapitalTurnover (sales, currentLiabilities, currentAssets) {
    return {
      ratio: setResultsTitle(transformGroups([sales, currentLiabilities, currentAssets], (first, second, third) => first / (second - third)), 'گردش سرمایه جاری')
    }
  }
}

export const profitabilityRatios = {
  grossProfitRatio (grossProfit, netSales) {
    return {
      ratio: setResultsTitle(transformGroups([grossProfit, netSales], (first, second) => first / second), 'نسبت سود ناخالص')
    }
  },
  operatingProfitRatio (operatingProfit, netSales) {
    return {
      ratio: setResultsTitle(transformGroups([operatingProfit, netSales], (first, second) => first / second), 'نسبت سود عملیاتی')
    }
  },
  salesReturnsRatio (netProfit, netSales) {
    return {
      ratio: setResultsTitle(transformGroups([netProfit, netSales], (first, second) => first / second), 'نسبت بازده فروش')
    }
  },
  specialValueReturnRatio (netProfit, specialValue) {
    return {
      ratio: setResultsTitle(transformGroups([netProfit, specialValue], (first, second) => first / second), 'نسبت بازده ارزش ویژه'),
      desc: 'Return on equity, a measure of the amount of profit earned per dollar of investment. (for measuring performance)'
    }
  },
  assetReturnsRatio (netProfit, totalAssets) {
    return {
      ratio: setResultsTitle(transformGroups([netProfit, totalAssets], (first, second) => first / second), 'نسبت بازده دارایی')
    }
  },
  workingCapitalReturnsRatio (netProfit, workingCapital) {
    return {
      ratio: setResultsTitle(transformGroups([netProfit, workingCapital], (first, second) => first / second), 'نسبت بازده ی سرمایه در گردش')
    }
  }
}

export const investmentRatios = {
  fixedAssetsSpecialValueRatio (fixedAssets, specialValue) {
    return {
      ratio: setResultsTitle(transformGroups([fixedAssets, specialValue], (first, second) => first / second), 'نسبت دارایی ثابت به ارزش ویژه')
    }
  },
  liabilitiesSpecialValueRatio (totalLiabilities, specialValue) {
    return {
      ratio: setResultsTitle(transformGroups([totalLiabilities, specialValue], (first, second) => first / second), 'نسبت کل بدهی به ارزش ویژه')
    }
  },
  currentLiabilitiesSpecialValueRatio (currentLiabilities, specialValue) {
    return {
      ratio: setResultsTitle(transformGroups([currentLiabilities, specialValue], (first, second) => first / second), 'نسبت بدهی جاری به ارزش ویژه')
    }
  },
  propertyRightsRatio (specialValue, totalAssets) {
    return {
      ratio: setResultsTitle(transformGroups([specialValue, totalAssets], (first, second) => first / second), 'نسبت مالکانه')
    }
  },
  leverageAssetsToEquityRatio (totalAssets, specialValue) {
    return {
      ratio: setResultsTitle(transformGroups([totalAssets, specialValue], (first, second) => first / second), 'leverageAssetsToEquityRatio')
    }
  },
  normalizeSheet (balanceSheet, sales) {
    return {
      normalized: transformColumns(balanceSheet, sales, (first, second) => first / second)
    }
  }
}

export const priceAnalysis = {
  yearlyReturn ({ xData, yData }) {
    const groupedData = groupWithSameYear(zip(xData, yData))
    const firstAndLastInGroup = groupedData.map(groupedData => [head(groupedData), last(groupedData)])
    const returns = firstAndLastInGroup.map(groupedData => [momentJalaali(groupedData[0][0]).jYear(), percentIncrease(groupedData[0][1], groupedData[1][1])] )
    const risk = Math.sqrt(variance(returns.map(item => item[1])))
    const meanFiveReturns = mean(returns.slice(returns.length - 5).map(item => item[1]))

    return {
      returns,
      meanFiveReturns,
      risk
    }
  },
  beta ({ xData, yData, totalIndexXData, totalIndexYData }) {
    const stockYearlyReturn = priceAnalysis.yearlyReturn({ xData, yData }).returns.map(item => item[1])
    const marketYearlyReturn = priceAnalysis.yearlyReturn({ xData: totalIndexXData, yData: totalIndexYData }).returns.map(item => item[1])

    return covariance(marketYearlyReturn, stockYearlyReturn) / variance(stockYearlyReturn)
  },
  expectedReturn ({ xData, yData, totalIndexXData, totalIndexYData }) {
    const marketYearlyReturn = priceAnalysis.yearlyReturn({ xData: totalIndexXData, yData: totalIndexYData })
    return constants.BONDS_PROFIT + ( priceAnalysis.beta({ xData, yData, totalIndexXData, totalIndexYData }) * (marketYearlyReturn.meanFiveReturns - constants.BONDS_PROFIT) )
  }
}
