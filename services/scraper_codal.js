import constants from '../constants/index.js'
import { goToPage } from '../helpers/puppeteer.helper.js'
import {
  convertCodalHTMLTableToJson,
  extractTableFromCodal,
  prettifyCodalJson
} from '../helpers/codal.helper.js'
import FinancialService from '../services/DBServices/financialService.js'
import FinancialErrorService from '../services/DBServices/financialError.service.js'
import CompanyService from '../services/DBServices/companyService.js'
import { toNumber } from '../helpers/fipiran.helper.js'

// get all financial links for a symbol (in that page we can access income statement and ...)
export const getCodalFinancialLinks = async ({ symbol }) => {
  const page = await goToPage({ url: constants.CODAL_URL })

  // click on symbol input
  await page.evaluate(() => { $("[input-id=txtSymbol]").children().first().click() })

  // type symbol name
  await page.type('#txtSymbol', symbol)

  // search
  await page.waitForSelector('#ui-select-choices-0 li')
  await page.click('#ui-select-choices-0 li')
  await page.waitForNavigation({ waitUntil: "networkidle0" })

  // fill type of report
  await page.select('#reportType', '1')
  await page.click('input[value=جستجو]')
  await page.waitForNavigation({ waitUntil: "networkidle0" })

  // get all financial links
  const results = []
  while (true) {
    // get links
    results.push(...await page.evaluate(() => { return $('.letter-title:contains(صورت‌های مالی), .letter-title:contains(صورتهای مالی)').toArray().map(item => ({link: item.href, text: item.innerText})) }))

    const disabledNextButton = await page.$$('li.disabled[title="صفحه بعدی"]')
    if (disabledNextButton.length !== 0) break

    await page.click('li[title="صفحه بعدی"]')
    await page.waitForNavigation({ waitUntil: "networkidle0" })
  }

  await page.close()

  return results
}

// get income statement and financial statement and other useful data
export const getCodalFinancialInfo = async ({ url }) => {
  const page = await goToPage({ url })

  // get page data
  const {
    companySymbol,
    companyName,
    ISIC,
    date,
    period,
    audited,
    corrected,
    letterSerial,
    listedCapital,
    unauthorizedCapital,
    selectValue
  } = await page.evaluate(() => {
    const correctedElement = document.getElementById('ctl00_cphBody_ucNavigateToNextPrevLetter_hlPrevVersion')
    const corrected = correctedElement ? `${correctedElement.innerText} : ${correctedElement.href}` : 'empty'

    return {
      companySymbol: document.getElementById('ctl00_txbSymbol').innerText,
      companyName: document.getElementById('ctl00_txbCompanyName').innerText,
      ISIC: document.getElementById('ctl00_lblISIC').innerText,
      date:  document.getElementById('ctl00_lblPeriodEndToDate').innerText,
      period: document.getElementById('ctl00_lblPeriod').innerText,
      audited: document.getElementById('ctl00_lblIsAudited').innerText,
      corrected,
      letterSerial: new window.URL(window.location).searchParams.get('LetterSerial'),
      listedCapital: document.getElementById('ctl00_lblListedCapital').innerText,
      unauthorizedCapital: document.getElementById('ctl00_txbUnauthorizedCapital').innerText,
      selectValue: document.getElementById('ddlTable').value
    }
  })

  if (selectValue !== '0') {
    await page.select('#ddlTable', '0')
    await page.waitFor(1500)
  }

  console.log('get financialStatementTableData data')

  // get table raw data or html
  await page.addScriptTag({ content: `${extractTableFromCodal}`})
  const financialStatementTableData = await page.evaluate(() => { return extractTableFromCodal() })

  const financialStatement = prettifyCodalJson(convertCodalHTMLTableToJson({ html: financialStatementTableData, date }))
  const financialStatementLink = page.url()

  console.log('get income statement')
  // now get income statement
  await page.select('#ddlTable', '1')
  await page.waitFor(1500)

  await page.addScriptTag({ content: `${extractTableFromCodal}`})
  const incomeStatementTableData = await page.evaluate(() => { return extractTableFromCodal() })

  const incomeStatement = prettifyCodalJson(convertCodalHTMLTableToJson({html: incomeStatementTableData, date}))
  const incomeStatementLink = page.url()

  page.close()

  // store this company as available companies
  await CompanyService.create({ symbol: companySymbol, name: companyName })

  // store financial info
  try {
    await FinancialService.create(companySymbol, {
      symbol: companySymbol,
      date,
      period,
      audited,
      corrected,
      letterSerial,
      baseURL: url,
      listedCapital: toNumber(listedCapital),
      unauthorizedCapital: toNumber(unauthorizedCapital),
      ISIC,
      financialStatementLink,
      financialStatement,
      incomeStatement,
      incomeStatementLink
    })

    return true
  } catch (e) { // store error
    await FinancialErrorService.create({
      symbol: companySymbol,
      letterSerial,
      baseURL: url,
      financialStatementLink,
      financialStatement,
      incomeStatement,
      incomeStatementLink,
      error: e.toString()
    })

    return false
  }
}
