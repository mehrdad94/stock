import Financial from '../../models/financialModel.js'

export default class FinancialService {
  static async findAll (query) {
    return await Financial.find(query)
  }

  static async findOne (query) {
    return await Financial.findOne(query)
  }

  static async create (financial) {
    const { letterSerial } = financial

    const hasDuplicate = await FinancialService.findOne({ letterSerial })

    if (!hasDuplicate) return await Financial.create(financial)
    else return true
  }
}
