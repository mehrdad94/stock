import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const financialSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  baseURL: {
    type: String,
    required: true
  },
  letterSerial: {
    type: String,
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
  error: {
    type: String,
    required: true
  }
})

export default mongoose.model('financialError', financialSchema, 'financialError')
