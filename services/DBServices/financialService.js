import Financial from '../../models/financialModel.js'

export default class FinancialService {
  static async findAll (symbol, query) {
    return await Financial(symbol).find(query)
  }

  static async findOne (symbol, query) {
    return await Financial(symbol).findOne(query)
  }

  static async create (symbol, financial) {
    return await Financial(symbol).create(financial)
  }
}
