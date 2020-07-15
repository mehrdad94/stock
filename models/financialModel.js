import mongoose from 'mongoose'

const Schema = mongoose.Schema

const getTotalCurrentAssets = financialStatement => financialStatement['جمع دارایی‌های جاری'] || financialStatement['جمع داراییهای جاری']
const getTotalCurrentLiabilities = financialStatement => financialStatement['جمع بدهی‌های جاری'] || financialStatement['جمع بدهیهای جاری']
const getShortTermInvestments = financialStatement => financialStatement['سرمایه‌گذاری‌‌های کوتاه مدت'] || financialStatement['سرمایه گذاریهای کوتاه مدت'] || financialStatement['سرمایه‌گذاری‌های کوتاه‌مدت']
const getTotalAssets = financialStatement => financialStatement['جمع دارایی‌ها'] || financialStatement['جمع داراییها']
const getTotalDebt = financialStatement => financialStatement['جمع بدهیهای جاری و غیر جاری'] || financialStatement['جمع بدهی‌ها'] || financialStatement['جمع بدهی ها']
const getOwnersEquity = financialStatement => financialStatement['جمع حقوق صاحبان سهام'] || financialStatement['جمع حقوق مالکانه']

const errorReporter = function () {
  let string = `Unable to convert, link: ${arguments[0]} `

  const args = [].slice.call(arguments, 1)
  args.forEach((arg, index) => {
    string += `${index}: ${arg}, `
  })
  throw new Error(string)
}

export const financialSchemaObject = {
  symbol: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  letterSerial: {
    type: String,
    required: true
  },
  period: {
    type: String,
    required: true
  },
  audited: {
    type: String,
    required: true
  },
  corrected: {
    type: String,
    required: true
  },
  ISIC: {
    type: String,
    required: true
  },
  listedCapital: {
    type: Number,
    required: true
  },
  unauthorizedCapital: {
    type: Number,
    required: true
  },
  incomeStatementLink: {
    type: String,
    required: true
  },
  financialStatementLink: {
    type: String,
    required: true
  },
  incomeStatement: {
    type: Schema.Types.Mixed,
    required: true
  },
  financialStatement: {
    type: Schema.Types.Mixed,
    required: true
  },
  ratios: {
    currentRatio: {
      type: Number,
      default: function () {
        return parseInt(getTotalCurrentAssets(this.financialStatement)) / parseInt(getTotalCurrentLiabilities(this.financialStatement))
      }
    },
    quickRatio: {
      type: Number,
      default: function () {
        return (parseInt(getTotalCurrentAssets(this.financialStatement)) - parseInt(this.financialStatement['موجودی مواد و کالا'])) / parseInt(getTotalCurrentLiabilities(this.financialStatement))
      }
    },
    cashRatio: {
      type: Number,
      default: function () {
        return (parseInt(getShortTermInvestments(this.financialStatement)) + parseInt(this.financialStatement['موجودی نقد'])) / parseInt(getTotalCurrentLiabilities(this.financialStatement))
      }
    },
    debtRatio: {
      type: Number,
      default: function () {
        const first = parseInt(getTotalDebt(this.financialStatement))
        const second = parseInt(getTotalAssets(this.financialStatement))
        const result = first /second

        if (isNaN(result)) errorReporter(this.financialStatementLink, first, second)
        else return result
      }
    },
    debtToEquityRatio: {
      type: Number,
      default: function () {
        const first = parseInt(getTotalDebt(this.financialStatement))
        const second = parseInt(getOwnersEquity(this.financialStatement))
        const result = first /second

        if (isNaN(result)) errorReporter(this.financialStatementLink, first, second)
        else return result
      }
    }
  }
}

export const financialSchema = new Schema(financialSchemaObject)

export default mongoose.model('financial', financialSchema, 'statements')
