const userSchema = require('../../models/user.model')
const utils = require('../../helpers/utils')
const blockSchema = require('../../models/block.model')
const friendSchema = require('../../models/friend.model')
const gameRequestSchema = require('../../models/gamerequest.model')
const matchSchema = require('../../models/match.model')
const { responseStatus, messages, gameConstants, socketConstants, swMessages, translateToSwahili,getBadge } = require('../../helpers/constant')
const { timeOutForFriendMatch } = require('./gamePlayhelper')
const moment = require('moment')
const e = require('express')
const { default: mongoose } = require('mongoose')

module.exports.leaderBoard = async (req, res, next) => {
    try {
        const { offset, limit, status, search } = req.body
        let message = req.headers.language == "sw" ? swMessages : messages
        let paginationData = [{ $skip: 0 }, { $limit: 1000 }]
        if (offset || offset == 0 && limit) paginationData = [{ $skip: offset }, { $limit: limit }]
        const selfUser = req.user._id
        let statusObj = []
        if (status) {
            var startTime = null
            var endTime = null
            switch (status) {
                case "daily":
                    startTime = new Date(moment().startOf('day'))
                    endTime = new Date(moment().endOf('day'))
                    break;
                case "weekly":
                    startTime = new Date(moment().startOf('week'))
                    endTime = new Date(moment().endOf('week'))
                    break;

                case "monthly":
                    startTime = new Date(moment().startOf('month'))
                    endTime = new Date(moment().endOf('month'))
                    break;
                case "yearly":
                    startTime = new Date(moment().startOf('year'))
                    endTime = new Date(moment().endOf('year'))
                    break;

                default:
                    break;
            }

            if (startTime && endTime) {
                statusObj = [
                    { $gte: ['$startTime', startTime] },
                    { $lte: ['$startTime', endTime] }
                ]
            }
        }

        let list = await userSchema.aggregate(
            [
                // {
                //     $match: {
                //         completeProfile: true,
                //       //  userType: "email"
                //     }
                // },
                {
                    $lookup: {
                        from: 'matches',
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$winner', '$$userId'] },
                                            ...statusObj
                                        ],
                                    },

                                }
                            },

                        ], as: 'wins'
                    }
                },
                {
                    $lookup: {
                        from: 'blocks',
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userId', '$$userId'] },
                                            { $eq: ['$blockedBy', selfUser] }
                                        ]
                                    }
                                }
                            },

                        ], as: 'block'
                    }
                },
                {
                    $lookup: {
                        from: 'blocks',
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$userId', selfUser] },
                                            { $eq: ['$blockedBy', '$$userId'] }
                                        ]
                                    }

                                }
                            },

                        ], as: 'visible'
                    }
                },
                {
                    $match: {
                        $expr: { $lte: [{ $size: '$visible' }, 0] }
                    }
                },
                {
                    $lookup: {
                        from: 'friends',
                        let: { userId: "$_id" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $and: [
                                                    { $eq: ['$from', '$$userId'] },
                                                    { $eq: ['$to', selfUser] }
                                                ],

                                            },
                                            {
                                                $and: [
                                                    { $eq: ['$to', '$$userId'] },
                                                    { $eq: ['$from', selfUser] }
                                                ],
                                            }
                                        ]
                                    },
                                }
                            },

                        ], as: 'friend'
                    }
                },
                {
                    $project: {
                        wins: { $size: '$wins' },
                        userName: 1,
                        profileImage: 1,
                        avatar: 1,
                        friend: 1,
                        userId: 1,
                        isBlock: { $cond: [{ $gt: [{ $size: "$block" }, 0] }, true, false] },
                        isFriends: { $cond: [{ $gt: [{ $size: "$friend" }, 0] }, true, false] },
                        coins:1,
                        badge:getBadge(),
                    },
                },
                {
                    $sort: { wins: -1 }
                },
                {
                    $match: search ? {
                        'userName': { $regex: new RegExp(('.*' + search + '.*'), "i") }
                    } : {}
                },
                {
                    $facet: {
                        data: paginationData,
                        totalCount: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$totalCount",
                        preserveNullAndEmptyArrays: true
                    }
                }

            ]
        )

        let totalCount = list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0
        list = list[0]?.data ?? []
        let pagination = utils.paginationData(totalCount, limit, offset)
        return res.status(responseStatus.success).json(utils.successResponse(message.leaderBoard, list))

    } catch (error) {
        next(error)
    }

}


module.exports.addFriend = async (req, res, next) => {
    try {
        const { userId } = req.body
        const selfId = req.user._id
        let message = req.headers.language == "sw" ? swMessages : messages
        let blockStatus = await blockSchema.findOne({ $or: [{ userId: userId, blockedBy: selfId }, { userId: selfId, blockedBy: userId }] })
        if (blockStatus) return res.status(responseStatus.badRequest).json(utils.errorResponse(message.userNot))
        //already friend status
        let friendStatus = await friendSchema.findOne({ $or: [{ from: userId, to: selfId }, { from: selfId, to: userId }] })
        if (friendStatus) return res.status(responseStatus.badRequest).json(utils.errorResponse(message.alreadyFriend))

        //make friends
        friendSchema({ from: selfId, to: userId }).save().then()

        return res.status(responseStatus.success).json(utils.successResponse(message.friendDone))


    } catch (error) {
        next(err)
    }


}


module.exports.friendList = async (req, res, next) => {
    try {
        const { offset, limit, status, search } = req.body
        console.log('id',req.user._id)
        let message = req.headers.language == "sw" ? swMessages : messages
        let paginationData = [{ $skip: 0 }, { $limit: 1000 }]
        if (offset || offset == 0 && limit) paginationData = [{ $skip: offset }, { $limit: limit }]
        const selfUser = req.user._id

        let list = await friendSchema.aggregate(
            [
                {
                    $match: {
                        $or: [{ from: selfUser }, { to: selfUser }],
                    }
                },
                {
                    $lookup: {
                        from: 'matches',
                        let: {
                            userId: { $cond: [{ $eq: ['$to', selfUser] }, "$from", "$to"] },
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$winner', '$$userId']
                                    }
                                }
                            },

                        ], as: 'wins'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: { $cond: [{ $eq: ['$from', selfUser] }, '$to', '$from'] } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$userId']
                                    },
                                    userType: "email"
                                }
                            },
                            {
                                $project: {
                                    _id: 1,
                                    userName: 1,
                                    profileImage: 1,
                                    avatar: 1,
                                    coins:1
                                }
                            }

                        ], as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'blocks',
                        let: { user: { $cond: [{ $eq: ['$from', selfUser] }, '$to', '$from'] } },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $and: [
                                                    { $eq: ['$userId', '$$user'] },
                                                    { $eq: ['$blockedBy', selfUser] }
                                                ],

                                            },
                                            {
                                                $and: [
                                                    { $eq: ['$userId', selfUser] },
                                                    { $eq: ['$blockedBy', '$$user'] }
                                                ],
                                            }
                                        ]

                                    },

                                }
                            },

                        ], as: 'block'
                    }
                },
                {
                    $addFields: {
                        isBlock: { $cond: [{ $gt: [{ $size: "$block" }, 0] }, true, false] }
                    }
                },
                {
                    $match: { isBlock: false, user: { $ne: null } }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $project: {
                        _id: "$user._id",
                        wins: { $size: '$wins' },
                        userName: '$user.userName',
                        profileImage: '$user.profileImage',
                        avatar: '$user.avatar',
                        coins:"$user.coins",
                        badge:getBadge('$user.coins'),
                    },
                },
                {
                    $match: search ? {
                        'userName': { $regex: new RegExp(('.*' + search + '.*'), "i") },
                    } : {}
                },
                {
                    $facet: {
                        data: paginationData,
                        totalCount: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$totalCount",
                        preserveNullAndEmptyArrays: true
                    }
                }

            ]
        )

        let totalCount = list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0
        list = list[0]?.data ?? []
        let pagination = utils.paginationData(totalCount, limit, offset)
        return res.status(responseStatus.success).json(utils.successResponse(message.leaderBoard, list))

    } catch (error) {
        next(error)
    }

}


module.exports.blockUser = async (req, res, next) => {
    try {
        const { user } = req.body
        let message = req.headers.language == "sw" ? swMessages : messages
        const verifyUser = await userSchema.findOne({ _id: user }).lean()
        if (!verifyUser) return res.status(responseStatus.badRequest).send(utils.errorResponse(message.userNot))
        const checkBlock = await blockSchema.findOne({ userId: user, blockedBy: req.user._id }).lean()
        if (checkBlock) return res.status(responseStatus.badRequest).send(utils.errorResponse(message.userBlockedAlready))
        blockSchema({ userId: user, blockedBy: req.user._id }).save().then().catch();
        const gameRequest = await gameRequestSchema.findOne({ from: user, to: req.user._id })
        if (gameRequest) {
            await gameRequestSchema.deleteOne({ _id: gameRequest._id })
            global.io.to(verifyUser.socketId).emit(socketConstants.error, {
                message: verifyUser.language == "en" ? messages.blockedUser : swMessages.blockedUser,
                status: 400
            })
        }

        return res.status(responseStatus.success).send(utils.successResponse(message.userBlocked))
    }
    catch (error) { return next(error) }
}

module.exports.unblockUser = async (req, res, next) => {
    try {
        const { user } = req.body
        let message = req.headers.language == "sw" ? swMessages : messages
        const verifyUser = await userSchema.findOne({ _id: user }).lean()
        if (!verifyUser) return res.status(responseStatus.badRequest).send(utils.errorResponse(message.userNot))
        const checkBlock = await blockSchema.findOne({ userId: user, blockedBy: req.user._id }).lean()
        if (checkBlock) {
            blockSchema.deleteOne({ userId: user, blockedBy: req.user._id }).then().catch()
            return res.status(responseStatus.success).send(utils.successResponse(message.userUnblocked))
        } else return res.status(responseStatus.badRequest).send(utils.errorResponse(message.noBlockedUser))
    }
    catch (error) { return next(error) }
}

module.exports.blockedUserList = async (req, res, next) => {
    try {
        let message = req.headers.language == "sw" ? swMessages : messages
        const aggregationArray = [
            {
                $match: {
                    _id: req.user._id
                }
            },
            {
                $lookup: {
                    from: 'blocks',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$blockedBy", req.user._id] },
                                        { $ne: ["$userId", req.user._id] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: 'users',
                                let: { user: '$userId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ["$_id", "$$user"]
                                            }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'matches',
                                            let: { user: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ["$winner", "$$user"]
                                                        }
                                                    }
                                                },
                                                {
                                                    $project: {
                                                        _id: 1
                                                    }
                                                }
                                            ], as: 'wins'
                                        }
                                    },
                                    {
                                        $project: {
                                            _id: 1,
                                            userName: 1,
                                            profileImage: 1,
                                            avatar: 1,
                                            wins: { $size: '$wins' },
                                            coins:1,
                                            badge:getBadge('$coins')
                                        }
                                    }
                                ], as: 'blockedUser'
                            }
                        },
                        {
                            $unwind: {
                                path: '$blockedUser',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                blockedUser: 1
                            }
                        }
                    ], as: 'blockedList'
                }
            },

            {
                $project: {
                    _id: 1,
                    userName: 1,
                    blockedList: 1
                }
            }
        ]
        const getList = await userSchema.aggregate(aggregationArray)
        // console.log('data', getList[0]?.blockedList.map((e) => e.blockedUser))
        return res.status(responseStatus.success).send(utils.successResponse(message.blockedList, getList[0]?.blockedList.map((e) => e.blockedUser)))
    }
    catch (error) { return next(error) }
}

module.exports.gameRequest = async (req, res, next) => {
    // setTimeout(async () => {
    try {
        const { userId, coins } = req.body
        var message = req.headers.language == "sw" ? swMessages : messages
        const selfId = req.user._id
        const userDetails = await userSchema.findOne({ _id: userId })
        if (req.user.coins < parseInt(coins)) return res.status(responseStatus.badRequest).json(utils.errorResponse(message.insufficentCoins))
        if (!userDetails) return res.status(responseStatus.badRequest).json(utils.errorResponse(message.userNot))

        //check friend
        const friends = await friendSchema.findOne({ $or: [{ from: selfId, to: userId }, { from: userId, to: selfId }] })
        if (friends) {
            //check block status
            const blockStatus = await blockSchema.findOne({ $or: [{ userId: selfId, blockedBy: userId }, { userId: userId, blockedBy: selfId }] })
            if (blockStatus) {
                let blockCond = String(blockStatus.from) === String(req.user._id)
                return res.status(responseStatus.badRequest).json(utils.errorResponse(blockCond ? message.userNot : message.blockedUser))
            }
            //check already in game 
            const alreayMatch = await matchSchema.findOne({ players: { $in: [userId] }, endTime: null })
            if (alreayMatch) return res.status(responseStatus.badRequest).json(utils.errorResponse(message.alreadymatch))

            // check for already requested
            const alreayReq = await gameRequestSchema.findOne({ from: userId, to: selfId, isAccepted: false })
            if (alreayReq) return res.status(responseStatus.badRequest).json(utils.errorResponse(message.ReqAlready))

            //if (userDetails.randomMatchTimeout) return res.status(responseStatus.badRequest).json(utils.errorResponse(messages.alreadymatch))
            const _id = new mongoose.Types.ObjectId
            //make the game request
            const [game] = await Promise.all([
                gameRequestSchema({ _id, from: selfId, to: userId, coins }).save(),
                userSchema.updateOne({ _id: selfId }, { onHomePage: false, inMatch: true, lastMatch: 'single' }),
                matchSchema({ players: [selfId], friendsMode: true, coins, roomId: _id }).save(),
            ])

            //initiate the timer for the sender
            timeOutForFriendMatch(selfId, global.io, req.user.socketId)
            //const gameMessage = req.headers.language == "sw" ? "" : `${req.user.userName} sent you a game request for a game of ${coins} coins.`
            //emit socket 
            const socketMessage = userDetails.language == "en" ? `${req.user.userName} sent you a game request for a game of ${coins} coins.` : await translateToSwahili(`${req.user.userName} sent you a game request for a game of ${coins} coins.`)

            let gameDataObj = { roomId: game._id, message: socketMessage }

            // global.io.to(userDetails.socketId).emit(socketConstants.gameRequest, gameDataObj)

            //send push notification

            userDetails.deviceToken ? utils.sendPushNotification([userDetails.deviceToken], 'gameRequest', socketMessage, gameDataObj) : null

            return res.status(responseStatus.success).json(utils.successResponse(message.gameRequest))
        }
        else return res.status(responseStatus.badRequest).json(utils.errorResponse(message.notFriends))

    } catch (error) {
        next(error)
    }
    // }, 500)

}

module.exports.gameRequestList = async (req, res, next) => {
    try {
        const { offset, limit, status, search } = req.body
        let message = req.headers.language == "sw" ? swMessages : messages
        let paginationData = [{ $skip: 0 }, { $limit: 1000 }]
        if (offset || offset == 0 && limit) paginationData = [{ $skip: offset }, { $limit: limit }]
        const selfUser = req.user._id

        let list = await gameRequestSchema.aggregate(
            [
                {
                    $match: {
                        to: selfUser
                    }
                },
                {
                    $lookup: {
                        from: 'matches',
                        let: {
                            userId: { $cond: [{ $eq: ['$to', selfUser] }, "$from", "$to"] },
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$winner', '$$userId']
                                    }
                                }
                            },

                        ], as: 'wins'
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        let: { userId: '$from' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$_id', '$$userId']
                                    }
                                }
                            },
                            {
                                $project: {
                                    userName: 1,
                                    profileImage: 1,
                                    avatar: 1,
                                    coins:1
                                }
                            }

                        ], as: 'user'
                    }
                },
                {
                    $unwind: {
                        path: '$user',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: 'blocks',
                        let: { user: '$from' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $and: [
                                                    { $eq: ['$userId', '$$user'] },
                                                    { $eq: ['$blockedBy', selfUser] }
                                                ],

                                            },
                                            {
                                                $and: [
                                                    { $eq: ['$userId', selfUser] },
                                                    { $eq: ['$blockedBy', '$$user'] }
                                                ],
                                            }
                                        ]

                                    },

                                }
                            },

                        ], as: 'block'
                    }
                },
                {
                    $addFields: {
                        isBlock: { $cond: [{ $gt: [{ $size: "$block" }, 0] }, true, false] }
                    }
                },
                {
                    $match: { isBlock: false }
                },
                {

                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $project: {
                        wins: { $size: '$wins' },
                        userId: '$user._id',
                        userName: '$user.userName',
                        profileImage: '$user.profileImage',
                        avatar: '$user.avatar',
                        coins: 1,
                        badge:getBadge('$user.coins')
                    },
                },
                {
                    $match: search ? {
                        'userName': { $regex: new RegExp(('.*' + search + '.*'), "i") },
                    } : {}
                },
                {
                    $facet: {
                        data: paginationData,
                        totalCount: [
                            {
                                $count: 'count'
                            }
                        ]
                    }
                },
                {
                    $unwind: {
                        path: "$totalCount",
                        preserveNullAndEmptyArrays: true
                    }
                }

            ]
        )

        let totalCount = list && list[0] && list[0].totalCount ? list[0].totalCount.count : 0
        list = list[0]?.data ?? []
        let pagination = utils.paginationData(totalCount, limit, offset)
        return res.status(responseStatus.success).json(utils.successResponse(message.reqList, list))

    } catch (error) {
        next(error)
    }
}

