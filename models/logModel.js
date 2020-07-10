import mongoose from 'mongoose'

const Schema = mongoose.Schema

export const logSchema = new Schema({
  content: {
    type: Schema.Types.Mixed,
    required: true
  }
})

export default mongoose.model('log', logSchema, 'logs')
