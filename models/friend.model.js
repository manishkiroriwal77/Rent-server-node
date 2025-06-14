const mongoose = require('mongoose')
const friendSchema = mongoose.Schema({
    from: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
    to: { type: mongoose.Types.ObjectId, default: null, ref: 'user' },
}, { timestamps: true })

module.exports = mongoose.model('friend', friendSchema)