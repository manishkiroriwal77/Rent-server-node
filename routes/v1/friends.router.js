const friendRoutes = require('express').Router()
const friendController = require('../../controllers/v1/friends.controller')

const { auth } = require('../../middlewares/auth')

const { validator } = require('../../middlewares/validator')
const validation = require('../../validations/user.validations')

const multer = require('../../middlewares/multer')


friendRoutes.post('/leaderBoard', auth, validator(validation.leaderBoard), friendController.leaderBoard)

friendRoutes.post('/addFriend', auth, validator(validation.addFriend), friendController.addFriend)

friendRoutes.post('/list', auth, friendController.friendList)

friendRoutes.post('/block-user', auth, multer, validator(validation.blockUser), friendController.blockUser)

friendRoutes.post('/unblock-user', auth, multer, validator(validation.blockUser), friendController.unblockUser)

friendRoutes.get('/blocked-list', auth, multer, friendController.blockedUserList)

friendRoutes.post('/game-request', auth, validator(validation.addFriend), friendController.gameRequest)

friendRoutes.post('/game-request-list', auth, friendController.gameRequestList)


module.exports = friendRoutes


