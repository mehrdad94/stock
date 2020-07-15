import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const financialSchema = new Schema({
  symbol: {
    type: String
  },
  baseURL: {
    type: String,
    required: true
  },
  letterSerial: {
    type: String
  },
  incomeStatementLink: {
    type: String
  },
  financialStatementLink: {
    type: String
  },
  incomeStatement: {
    type: Schema.Types.Mixed
  },
  financialStatement: {
    type: Schema.Types.Mixed
  },
  error: {
    type: String,
    required: true
  }
})

export default mongoose.model('financialError', financialSchema, 'financialErrors')
