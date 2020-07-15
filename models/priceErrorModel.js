import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const priceSchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  priceHistory: {
    type: Schema.Types.Mixed
  },
  error: {
    type: String,
    required: true
  }
})

export default mongoose.model('priceError', priceSchema, 'priceErrors')
