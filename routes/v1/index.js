const routes = require('express').Router()
const userRoutes = require('./user.router')
const friendsRoute = require('./friends.router')
const adminRoute = require('./admin.router')



routes.use('/user', userRoutes)
routes.use('/friend', friendsRoute)
routes.use('/admin', adminRoute)



module.exports = routes