import FinancialError from '../../models/financialErrorModel.js'

export default class FinancialErrorService {
  static async findOne (query) {
    return await FinancialError.findOne(query)
  }

  static async findAll (query) {
    return await FinancialError.find(query)
  }

  static async deleteOne (query) {
    return await FinancialError.deleteOne(query)
  }

  static async create (error) {
    const { letterSerial } = error

    const isDuplicate = await FinancialError.findOne({ letterSerial })

    if (!isDuplicate) return await FinancialError.create(error)
    else return true
  }
}
