import Price from '../../models/priceModel.js'

export default class PriceService {
  static async findAll (query) {
    return await Price.find(query)
  }

  static async findOne (query) {
    return await Price.findOne(query)
  }

  static async create (financial) {
    const { symbol } = financial
    const hasDuplicate = await PriceService.findOne({ symbol })

    if (!hasDuplicate) await Price.create(financial)
    else return true
  }
}
