import constants from '../constants/index.js'
import {
	getPageContent,
	getPageBody,
	interceptRequest
} from '../helpers/puppeteer.helper.js'
import { parseHTML, convertTableToJSON } from '../helpers/dom.helper.js'
import queue from 'async/queue.js'
import asyncify from 'async/asyncify.js'

// fetch Indices Revenue
export const getIndicesRevenue = async () => {
	const url = new URL(`${constants.INDICES_URL}`)

	const body = await getPageBody({ url })

	const bodyJquery = parseHTML(body)

	const indicesLink = bodyJquery.find('#commf a').toArray().map(e => new URL(url.origin + e.href))

	function getter ({window, document, sharedVariable}) {
		const stocksInIndex = window.$('#II').find('a').toArray().map(element => ({ content: element.innerText, link: element.href}))

		return {
			label: document.title,
			url: sharedVariable.url,
			stocksInIndex,
			xData: window['chartsIndex']['series'][0]['xData'],
			yData: window['chartsIndex']['series'][0]['yData']
		}
	}

	const result = []

	const indicesReturnsQueue = queue(asyncify(async function (task) {
		result.push(await getPageContent({ url: task.url, getter, sharedVariable: { url: task.url } }))

		return result
	}), 2)

	for (let i = 0; i < indicesLink.length; i++) {
		indicesReturnsQueue.push({ url: indicesLink[i], index: i })
	}

	await indicesReturnsQueue.drain()

	return result
}

// get balance sheet and income sheet
const getStockFinancialLinks = ({ url }) => {
	return new Promise((resolve, reject) => {
		url = new URL(url)
		console.log('Request financial links')
		interceptRequest({
			url,
			async requestFinished (request) {
				if (request.url().includes('menubar')) {
					console.log('Got financial links')

					const response = await request.response()
					const textResponse = await response.text()
					const parsedContent = parseHTML(textResponse)

					const balanceSheetLink = new URL(url.origin + parsedContent.find('a:contains(اقلام ترازنامه)').attr('href'))
					const incomeIndexLink = new URL(url.origin + parsedContent.find('a:contains(اقلام سود و زیان)').attr('href'))
					const priceLink = new URL(url.origin + parsedContent.find('a:contains(نمودار ها)').attr('href'))

					resolve({
						balanceSheetLink,
						incomeIndexLink,
						priceLink
					})
				}
			}
		}).catch(reject)
	})
}

const getStockBalanceSheet = ({ url }) => {
	return new Promise(async (resolve, reject) => {
		url = new URL(url)
		console.log('Request balance sheets')

		try {
			const result = {}
			await interceptRequest({
				url,
				async requestFinished (request) {
					if (request.url().includes('BalanceType')) {
						const response = await request.response()
						const textResponse = await response.text()

						result[new URL(request.url()).pathname.replace('/Symbol/BalanceType', '')] = convertTableToJSON(textResponse)
					}
				}
			})

			console.log('Got balance sheets')
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

const getIncomeIndexSheet = ({ url }) => {
	return new Promise(async (resolve, reject) => {
		url = new URL(url)
		console.log('Request income sheets')

		try {
			const result = {}
			await interceptRequest({
				url,
				async requestFinished (request) {
					if (request.url().includes('IncomeType')) {
						const response = await request.response()
						const textResponse = await response.text()

						result[new URL(request.url()).pathname.replace('/Symbol/IncomeType', '')] = convertTableToJSON(textResponse)
					}
				}
			})

			console.log('Got income sheets')
			resolve(result)
		} catch (e) {
			reject(e)
		}
	})
}

export const getStockPriceInfo = async ({ url }) => {
	function getter ({window, document, sharedVariable}) {
		return {
			label: document.title,
			url: sharedVariable.url,
			xData: window['chartFund']['series'][0]['xData'],
			yData: window['chartFund']['series'][0]['yData'],
			totalIndexXData: window['chartFund']['series'][1]['xData'],
			totalIndexYData: window['chartFund']['series'][1]['yData']
		}
	}

	console.log('Request stock price')
	return await getPageContent({ url: url, getter, sharedVariable: { url } })
}

export const getStockFinancialInfo = async ({ url }) => {
	const financialLinks = await getStockFinancialLinks({ url })

	const balanceSheet = await getStockBalanceSheet({ url: financialLinks.balanceSheetLink })

	const incomeIndex = await getIncomeIndexSheet({ url: financialLinks.incomeIndexLink })

	const stockPrices = await getStockPriceInfo({ url: financialLinks.priceLink })

	return {
		balanceSheet,
		incomeIndex,
		stockPrices
	}
}
