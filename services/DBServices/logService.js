import Log from '../../models/logModel.js'

export default class LogService {
  static async create (content) {
    return await Log.create(content)
  }
}
