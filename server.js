import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'

// middleware
import Middleware from './middleware/index.js'

// controllers
import financialController from './controllers/financialController.js'
import scrapperController from './controllers/scrapperController.js'

dotenv.config()

const app = express()
Middleware(app)

// connect to db
const mongoURL = process.env.MONGO_URL
mongoose.connect(mongoURL).then(() => {
  console.log('database connected')
})

// controllers
app.use('/api/finance', financialController)
app.use('/api/scrapper', scrapperController)

// run server
const serverPort = process.env.PORT

app.listen(serverPort, () => console.log(`Example app listening at http://localhost:${serverPort}`))