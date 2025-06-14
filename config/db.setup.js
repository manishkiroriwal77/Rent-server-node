const adminSchema = require("../models/admin.model");
const bcrypt = require('bcrypt')
const gameSchema = require("../models/game.model");
const userSchema = require("../models/user.model");
const { gameConstants } = require('../helpers/constant')
const adminMail = process.env.ADMIN_MAIL;
const adminPass = process.env.ADMIN_PASSWORD;

module.exports.dbSetup = async () => {
    //destructing game constants
    const { privacyPolicy, rules, termsConditions } = gameConstants
    adminSchema.findOne({ email: adminMail }).then(res => {
        if (!res) new adminSchema({ email: adminMail, password: bcrypt.hashSync(adminPass, parseInt(process.env.SALT)) }).save()
            .then(res => console.log('Admin created'))
            .catch(err => console.log(`Admin create Error: ${err}`))
    }).catch(err => console.log(`Admin create Error: ${err}`))

    gameSchema.findOne({}).then(res => {
        if (!res) new gameSchema({ termsConditions, privacyPolicy, rules }).save()
            .then(res => console.log('Terms privacy and rules created'))
            .catch(err => console.log(`Terms create Error: ${err}`))
    }).catch(err => console.log(`Terms create Error: ${err}`))

    userSchema.findOne({ email: 'google@yopmail.com' }).then(res => {
        if (!res) new userSchema({
            email: 'google@yopmail.com',
            userName: 'GoogleUser',
            fullName: 'Google User',
            password: bcrypt.hashSync('Google@321', parseInt(process.env.SALT)),
            day: '01',
            month: '01',
            year: '2000',
            country: 'India',
            avatar: 'avatar1',
            userType: 'email',
            emailVerified: true,
            completeProfile: true
        }).save()
            .then(res => console.log('Google account created'))
            .catch(err => console.log(`Google account create Error: ${err}`))
    }).catch(err => console.log(`Google account create Error: ${err}`))
}