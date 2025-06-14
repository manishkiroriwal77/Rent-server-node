const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const userSchema = require('../models/user.model')
const admin = require('firebase-admin')
const serviceAccount = {
    
}


// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// })



// // Example usage
// const englishText = 'Hello, how are you?';
// translateToSwahili(englishText); 

module.exports.successResponse = (message, data = null) => {
    return { success: true, message: message, data: data }
}


module.exports.errorResponse = (message, data = null) => {
    return { success: false, message: message, data: data }
}

module.exports.SIGNJWT = (data) => jwt.sign(data, process.env.JWT_SECRET)

module.exports.verifyJwt = async (token) => {
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET)
        return data
    } catch (error) {
        console.log('err', error)
        return false
    }
}

module.exports.hashPassword = (password) => bcrypt.hash(password, parseInt(process.env.SALT))

module.exports.comparePassword = (hash, password) => bcrypt.compare(password, hash)

module.exports.parseMongoId = (id) => mongoose.Types.ObjectId(id)

module.exports.validMongoId = (id) => mongoose.isValidObjectId(id)

module.exports.paginationData = (totalCount, LIMIT, OFFSET) => {
    let totalPages = Math.ceil(totalCount / LIMIT);
    let currentPage = Math.floor(OFFSET / LIMIT);
    let prevPage = (currentPage - 1) > 0 ? (currentPage - 1) * LIMIT : 0;
    let nextPage = (currentPage + 1) <= totalPages ? (currentPage + 1) * LIMIT : 0;
    return {
        totalCount,
        nextPage,
        prevPage,
        currentPage: currentPage + 1
    }
}

module.exports.verifySuccess = (message) => {

    return `<html>
   <head>
   <link rel="icon" href="/public/favicon.png" type="image/x-icon"/>

   <link rel="shortcut icon" href="/public/favicon.png" type="image/x-icon"/>
   <title>Email Verification
   </title>
   <style> 
    @media only screen and (max-width:600px){
      .style{
         height:80vh
         width:85vw
      }
    } 
   </style>
   </head>
   <body style="margin:0; background-color:white;">
   <div  width="100%" style="height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center;background-color:white; font-family: 'Open Sans', sans-serif;">
   <div style="height:80vh; width:85vw; display:flex; flex-direction:column; justify-content:space-around; background-color:black;">
   <div style="text-align:center; background-color:black"> <img  style="margin-top: -7px;" src="https://iili.io/HXjpSAN.png"  width="400px"></div>
       <h1 style="text-align:center; color:white; font-weight:500;font-size:50px;font-family:'Rubik',sans-serif; margin-top: 50px;">${message}</h1><br/>
       <p style="text-align:center; bottom:0px; font-size:30px; color:white; margin:0px 0 10px;"><strong>Copyright ${new Date().getFullYear()}</strong> © <strong>MANIFEST MOTO. All rights reserved.</strong></p>
   </div>
   <div></div>
   </body>
   </html >`

}

module.exports.escapeSpecialCharacter = (text) => {

    if (text) return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    else return '';
}

module.exports.generateOtp = (length) => {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

module.exports.generateRandomKey = () => Math.random().toString().substring(2, 16);


module.exports.sendPushNotification = async (deviceTokens, title, description, data = { admin: true }) => {
    //send notifications to the users
    // await userSchema.updateMany({ deviceToken: condition ? { $in: fcmToken } : fcmToken }, { $inc: { badgeCount: 1 } })
    // const usersFcmToken = await userSchema.find({ _id: { $in: userIds }, deviceToken: { $ne: null } })
    const fcmToken = deviceTokens
    let user = await userSchema.find({ deviceToken: { $in: fcmToken } })
    for (let i of user) {

        if (i.deviceToken) {
            let payload = {
                notification: {
                    title: title,
                    body: description,
                    // color: "#6071C6",
                    // sound: "default",
                    //  badge: String(i.badgeCount)
                },

                data: {
                    "data": JSON.stringify(data)
                },
                token: i.deviceToken
            };


            admin.messaging().send(payload)
                .then((res) => {
                    console.log('notification res=>', res)
                    console.log(res['results'][0])
                })
                .catch((err) => {
                    console.log('notification error=>', err)
                })


        }



        // admin.messaging().sendToDevice(i.deviceToken, payload)
        //     .then((res) => {
        //         console.log('notification res=>', res)
        //         console.log(res['results'][0])
        //     })
        //     .catch((err) => {
        //         console.log('notification error=>', err)
        //     })
    }

}






