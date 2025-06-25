const mongoose = require('mongoose')

const shopRentSchema = mongoose.Schema({
    shopId: { type: mongoose.Types.ObjectId, default: null, ref: 'shop'},
    userId: { type: mongoose.Types.ObjectId, default: null, ref: 'user'},

}, { timestamps: true })

module.exports = mongoose.model('shoprent', shopRentSchema)