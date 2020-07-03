import fs from 'fs'

export const toJSONFile = async (name, data) => await fs.promises.writeFile(name, data)
