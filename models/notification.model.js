const mongoose = require('mongoose')


const notificationSchema = mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: "user" },
    title: { type: String, },
    description: { type: String },
    type: { type: String, default: 'Admin Notification' }
}, { timestamps: true })

module.exports = mongoose.model('notifications', notificationSchema)

// let data = []
// for (let i = 0; i < 25; i++) {
//     data.push({ userId: "65b0fdcfb87c91cc897a23ea", type: "Admin Notification", text: `${i} notification` })
// }
// console.log('sdfgsg', data)
// mongoose.model('notifications', notificationSchema).insertMany(data).then((res) => console.log(res)).catch((err) => console.log(err))