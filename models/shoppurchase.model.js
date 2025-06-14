const mongoose = require('mongoose')


const purchaseSchema = mongoose.Schema({
    item: { type: mongoose.Types.ObjectId, ref: "shop" },
    user: { type: mongoose.Types.ObjectId, ref: "user" }
}, { timestamps: true })

module.exports = mongoose.model('purchase', purchaseSchema)