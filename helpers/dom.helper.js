import jQueryFactory from 'jquery'
import jsdom from 'jsdom'
import tableToJson from 'tabletojson'

const { JSDOM } = jsdom

const createWindow = () => new JSDOM('').window

export const parseHTML = html => jQueryFactory(createWindow(), true)(html)

export const convertTableToJSON = html => tableToJson.Tabletojson.convert(html, { useFirstRowForHeadings: true })

export const stripHTML = html => html.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, "")
