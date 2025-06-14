const mongoose = require('mongoose')

const { shopConfig } = require('../helpers/shopConfig')
const shopSchema = mongoose.Schema({

    nameEn: { type: String },
    nameSw: { type: String },
    type: { type: String, enum: shopConfig.shopTypes },
    cost: { type: String },
    costType: { type: String, enum: shopConfig.costTypes },
    imageUrl: { type: String },
    coinsGet: { type: String }

}, { timestamps: true })

module.exports = mongoose.model('shop', shopSchema)

//this.model.insertMany(shopConfig.shopData).then()
