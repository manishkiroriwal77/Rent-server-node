const mongoose = require('mongoose')
const { dbSetup } = require('./db.setup')
require('dotenv').config()
const MONGOURL = process.env.MONGO_CONNECT_URL

console.log('MONGOURL',MONGOURL)

mongoose.set('strictQuery', false)
if (MONGOURL) {
    mongoose.connect(MONGOURL, { useNewUrlParser: true }, (err) => {
        if (err) console.log('mongo connetion error=>', err)
        else {
            console.log(`connected to database=>${MONGOURL}`)
            dbSetup();
        }
    })
}
