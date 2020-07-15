import PriceError from '../../models/priceErrorModel.js'

export default class PriceErrorService {
  static async findOne (query) {
    return await PriceError.findOne(query)
  }

  static async findAll (query) {
    return await PriceError.find(query)
  }

  static async deleteOne (query) {
    return await PriceError.deleteOne(query)
  }

  static async create (error) {
    const { symbol } = error

    const isDuplicate = await PriceError.findOne({ symbol })

    if (!isDuplicate) return await PriceError.create(error)
    else return true
  }
}
