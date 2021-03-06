import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const companySchema = new Schema({
  symbol: {
    type: String,
    required: true
  },
  name: {
    type: String
  }
})

export default mongoose.model('company', companySchema, 'companies')
