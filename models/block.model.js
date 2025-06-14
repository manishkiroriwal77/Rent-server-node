const mongoose = require('mongoose')
const blockSchema = mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
    blockedBy: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
}, { timestamps: true })

module.exports = mongoose.model('block', blockSchema)