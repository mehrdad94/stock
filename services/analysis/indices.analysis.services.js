import { getIndicesRevenue } from '../scraper.js'
import momentJalaali from 'moment-jalaali'
import { groupWithSameYear } from '../../helpers/dates.helper.js'
import zip from 'ramda/src/zip.js'
import last from 'ramda/src/last.js'
import head from 'ramda/src/head.js'
import mean from 'ramda/src/mean.js'
import sortWith from 'ramda/src/sortWith.js'
import prop from 'ramda/src/prop.js'
import descend from 'ramda/src/descend.js'
import { toJSONFile } from '../../helpers/fs.helper.js'
import { percentIncrease } from '../../helpers/math.helper.js'
const sortByAverage = sortWith([descend(prop('averageOfFullYears'))])
const INDICES_ANALYSIS_PATH = '../../data/indicesAnalysis.json'

export const getIndicesAnalysis = async () => {
  // in [{xData, yData}, ...] format
  console.log('Got All Indices')

  const indicesChartData = await getIndicesRevenue()

  // indices return in [[[ time, return ]]] format
  const indicesReturns = indicesChartData
    .map(chartData => groupWithSameYear(zip(chartData.xData, chartData.yData)))
    .map(chartData => chartData.map(groupedData => [head(groupedData), last(groupedData)]))
    .map(chartData => chartData.map(groupedData => [momentJalaali(groupedData[0][0]).jYear(), percentIncrease(groupedData[0][1], groupedData[1][1])] ))

  const analytics = indicesReturns.map((indexReturns, index) => {
    return {
      label: indicesChartData[index].label,
      url: indicesChartData[index].url,
      returns: indexReturns,
      stocksInIndex: indicesChartData[index].stocksInIndex,
      stocksInIndexCount: indicesChartData[index].stocksInIndex.length,
      average: mean(indexReturns.map(item => item[1])),
      averageOfFullYears: mean(indexReturns.slice(1, indexReturns.length - 1).map(item => item[1])),
      FullYears: indexReturns.slice(1, indexReturns.length - 1).map(item => item[0])
    }
  }).filter(analysis => analysis.stocksInIndexCount)

  console.log('Write INDICES_ANALYSIS to a JSON File')
  await toJSONFile(INDICES_ANALYSIS_PATH, JSON.stringify(sortByAverage(analytics), null, '\t'))
}

(async () => {
  await getIndicesAnalysis()
})()
