const mongoose = require('mongoose')
const adminSchema = mongoose.Schema({
    rules: { type: String, default: null },
    termsConditions: { type: String },
    privacyPolicy: { type: String, default: null },
}, { timestamps: true })

module.exports = mongoose.model('gameData', adminSchema)