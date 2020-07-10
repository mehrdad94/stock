import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const financialSchema = new Schema({
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
        return parseInt(this.financialStatement['جمع دارایی‌های جاری']) / parseInt(this.financialStatement['جمع بدهی‌های جاری'])
      }
    },
    quickRatio: {
      type: Number,
      default: function () {
        return (parseInt(this.financialStatement['جمع دارایی‌های جاری']) - parseInt(this.financialStatement['موجودی مواد و کالا'])) / parseInt(this.financialStatement['جمع بدهی‌های جاری'])
      }
    },
    cashRatio: {
      type: Number,
      default: function () {
        return (parseInt(this.financialStatement['سرمایه‌گذاری‌‌های کوتاه مدت']) + parseInt(this.financialStatement['موجودی نقد'])) / parseInt(this.financialStatement['جمع بدهی‌های جاری'])
      }
    }
  }
})

export default (collection) => mongoose.model('financial', financialSchema, collection)
