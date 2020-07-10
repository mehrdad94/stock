import Company from '../../models/companyModel.js'

export default class CompanyService {
  static async getAll () {
    return await Company.find({})
  }

  static async create (company) {
    const { symbol } = company

    const existInDataBase = await Company.findOne({ symbol })

    if (!existInDataBase) return await Company.create(company)
    else return true
  }
}
