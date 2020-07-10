import puppeteer from 'puppeteer'
import { retry } from './queue.helper.js'

let browser = null
const getNewPage = async () => {
  if (!browser) browser = await puppeteer.launch({
    // headless: true
  })

  return await browser.newPage()
}

export const interceptRequest = async ({ url, requestFinished }) => {
    const page = await getNewPage()

    await page.setRequestInterception(true)

    page.on('request', request => { request.continue() })

    page.on('requestfinished', requestFinished)

    await retry(() => page.goto(url, {waitUntil: 'networkidle0', timeout: 30000}), 3)

    page.close()
}

export const getPageContent = async ({ url, getter, sharedVariable = {} }) => {
  const page = await getNewPage()

  console.log('open', url.toString())

  await retry(() => page.goto(url, {timeout: 30000}), 3)

  await page.addScriptTag({ content: `${getter}`})

  const output = await page.evaluate((sharedVariable) => getter({ window, document, sharedVariable }), sharedVariable)

  page.close()

  console.log('close', url.toString())

  return output
}

export const getPageBody = async ({ url }) => {
  function getter ({ document }) { return document.body.innerHTML }

  return await getPageContent({ url, getter })
}

export const goToPage = async ({ url }) => {
  const page = await getNewPage()

  console.log('open', url.toString())

  await retry(() => page.goto(url, {timeout: 30000}), 3)

  return page
}
