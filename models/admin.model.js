const mongoose = require('mongoose')
const adminSchema = mongoose.Schema({
    email: { type: String, default: null },
    password: { type: String },
    deviceToken: { type: String, default: null },
    forgotToken: { type: String, default: null },
    androidVersion:{type:String,default:null},
    iosVersion:{type:String,default:null}
}, { timestamps: true })

module.exports = mongoose.model('admin', adminSchema)