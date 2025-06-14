const matchSchema = require('../../models/match.model')
const tournamentSchema = require('../../models/tournament.model')
const userSchema = require('../../models/user.model')
const blockSchema = require('../../models/block.model')
const gameRequestSchema = require('../../models/gamerequest.model')
const { distributeCards } = require('./cards')
const uuid = require('uuid')
const { socketConstants, messages, swMessages, getBadge } = require('../../helpers/constant')
const utils = require('../../helpers/utils')
const { skipBidTurn, selfExit } = require('./gamePlay.controller')
const { default: mongoose } = require('mongoose')
const moment = require('moment')

module.exports.getRandomNumberFromArray = async function (arr, length = 0) {
    if (!length) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        const randomValue = arr[randomIndex];
        return randomValue;
    }
    else {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());

        return shuffled.slice(0, length);
    }
}

module.exports.IntervalForRandomMatch = async (userId, io, socketId, coins) => {
    const setIntervalKey = utils.generateRandomKey()
    //update user interval key    
    await userSchema.updateOne({ _id: userId }, { randomMatchInterval: setIntervalKey, inMatch: true, lastMatch: 'single', onHomePage: false })

    this.timeOutForRandomMatch(userId, io, socketId)

    // global[setIntervalKey] = setInterval(async function () {
    setTimeout(async () => {

        const checkForMatchCreate = await matchSchema.find({ startTime: null, players: { $nin: [userId] }, $expr: { $eq: [{ $size: '$players' }, 1] }, coins, friendsMode: false })
        if (checkForMatchCreate.length == 0) {
            await matchSchema({ players: [userId], coins }).save()
        }
        const foundMatchDetails = await matchSchema.findOne({ players: { $nin: [userId] }, startTime: null, endTime: null, $expr: { $eq: [{ $size: '$players' }, 1] }, coins })
        // console.log('foundMatchDetails', foundMatchDetails)
        let blockStatus = null
        let alreadyMatch = null
        if (foundMatchDetails) {
            const opponentPlayer = foundMatchDetails.players[0]
            alreadyMatch = await matchSchema.findOne({ players: { $in: [userId] }, endTime: null, $expr: { $eq: [{ $size: '$players' }, 1] } })
            blockStatus = await blockSchema.findOne({ $or: [{ userId: userId, blockedBy: opponentPlayer }, { userId: opponentPlayer, blockedBy: userId }] })
        }

        if (foundMatchDetails && !blockStatus && !alreadyMatch) {
            await matchSchema.updateOne({ _id: foundMatchDetails._id }, { $addToSet: { players: userId } })
            const matchId = foundMatchDetails._id
            const opponentId = foundMatchDetails.players[0]
            const [opponent, selfDetails] = await Promise.all([
                userSchema.findOne({ _id: opponentId }),
                userSchema.findOne({ _id: userId })
            ])

            if (opponent.randomMatchInterval) {
                await userSchema.updateOne({ _id: opponentId }, { randomMatchInterval: null })
                clearInterval(global[opponent.randomMatchInterval])
            }

            if (selfDetails.randomMatchInterval) {
                await userSchema.updateOne({ _id: userId }, { randomMatchInterval: null })
                clearInterval(global[selfDetails.randomMatchInterval])
            }


            //clear timeout for both the players
            if (opponent.randomMatchTimeout) {
                await userSchema.updateOne({ _id: opponentId }, { randomMatchTimeout: null })
                clearTimeout(global[opponent.randomMatchTimeout])
            }

            if (selfDetails.randomMatchTimeout) {
                await userSchema.updateOne({ _id: userId }, { randomMatchTimeout: null })
                clearTimeout(global[selfDetails.randomMatchTimeout])
            }


            //send emit for both the players for opponent found   

            io.to(opponent.socketId).emit(socketConstants.opponentFound, {
                status: true,
                userName: selfDetails.userName,
                profileImage: selfDetails.profileImage,
                avatar: selfDetails.avatar,
                badge: getBadge(selfDetails?.coins, false)
            })

            io.to(socketId).emit(socketConstants.opponentFound, {
                status: true,
                userName: opponent.userName,
                profileImage: opponent.profileImage,
                avatar: opponent.avatar,
                badge: getBadge(opponent?.coins, false)
            })
            const getRandomNumberFromArray = async function (arr) {
                const randomIndex = Math.floor(Math.random() * arr.length);
                const randomValue = arr[randomIndex];
                return randomValue;
            }

            const { deck, player1, player2 } = distributeCards()
            const userCards = {
                playerId: userId,
                cards: player1
            }
            const opponentCards = {
                playerId: opponentId,
                cards: player2
            }
            const matchDetails = await matchSchema.findOneAndUpdate({ _id: matchId }, {
                startTime: new Date(),
                deck,
                player1: userCards,
                player2: opponentCards,
                turn: await getRandomNumberFromArray([userId, opponentId]),
            }, { new: true })
            await userSchema.updateMany({ _id: { $in: matchDetails.players.map(e => e.toString()) } }, { $inc: { coins: (-coins) } })

            //start the game and send the emit for start game
            global[matchId] = setTimeout(async () => {

                const matchDetails = await matchSchema.findOne({ _id: matchId, endTime: null })
                if (matchDetails) {

                    const users = await userSchema.find({ _id: { $in: [userId, opponentId] } })

                    users.forEach(e => {
                        io.to(e.socketId).emit(socketConstants.coinsUpdate, { coins: e.coins, badge: getBadge(e.coins, false) })
                    })
                }

                if (matchDetails && !matchDetails.endTime) {

                    const dataObj = Object.assign({})
                    dataObj['matchId'] = matchDetails._id
                    dataObj['deck'] = matchDetails.deck
                    // dataObj['turn'] = matchDetails.turn
                    dataObj['bidRound'] = matchDetails.bidRound


                    io.to(opponent.socketId).emit(socketConstants.gameStart, {
                        ...dataObj, cards: matchDetails.player2.cards, opponentCards: matchDetails.player1.cards,
                        opponentInfo: {
                            _id: selfDetails._id,
                            userName: selfDetails.userName,
                            profileImage: selfDetails.profileImage,
                            avatar: selfDetails.avatar,
                            badge: getBadge(selfDetails?.coins, false)
                        }
                    })

                    io.to(socketId).emit(socketConstants.gameStart, {
                        ...dataObj, cards: matchDetails.player1.cards, opponentCards: matchDetails.player2.cards,
                        opponentInfo: {
                            _id: opponent._id,
                            userName: opponent.userName,
                            profileImage: opponent.profileImage,
                            avatar: opponent.avatar,
                            badge: getBadge(opponent?.coins, false)
                        }
                    })
                }

                setTimeout(async () => {

                    const matchDetails = await matchSchema.findOneAndUpdate({ _id: matchId, endTime: null }, {
                        timerStartTime: new Date()
                    }, { new: true }).populate('players', 'socketId')
                    if (matchDetails) {
                        // const socket = String(matchDetails.turn) == String(opponentId) ? opponent.socketId : selfDetails.socketId
                        io.to(matchDetails?.players[0]?.socketId).emit(socketConstants.playBidturn, {
                            playBidTurn: true,
                            turn: String(matchDetails.turn)
                        })

                        io.to(matchDetails?.players[1]?.socketId).emit(socketConstants.playBidturn, {
                            playBidTurn: true,
                            turn: String(matchDetails.turn)
                        })

                        skipBidTurn(matchDetails.turn, io)
                    }

                }, 3000)

            }, 4000)

        }
    }, Math.floor(Math.random() * (1000 - 300 + 1)) + 300)

}

module.exports.timeOutForRandomMatch = async function (userId, io, socketId) {
    const timeoutKey = utils.generateRandomKey()
    await userSchema.updateOne({ _id: userId }, { randomMatchTimeout: timeoutKey })
    const selfDetails = await userSchema.findOne({ _id: userId })
    // time out for no opponent found
    global[timeoutKey] = setTimeout(async () => {
        //clear interval for the user
        await userSchema.updateOne({ _id: userId }, { randomMatchInterval: null, randomMatchTimeout: null })
        clearInterval(global[selfDetails.randomMatchInterval])
        //delete selfMatch
        matchSchema.deleteOne({ players: { $in: [userId] }, startTime: null }).then()

        //emit to the selfUser
        io.to(socketId).emit(socketConstants.opponentFound, {
            status: false,
            userName: null,
            profileImage: null,
            message: selfDetails.language == "en" ? messages.opponentNotFound : swMessages.opponentNotFound
        })

    }, parseInt(process.env.RANDOM_MATCH_TIMER))
}

module.exports.timeOutForFriendMatch = async function (userId, io, socketId) {
    const timeoutKey = utils.generateRandomKey()
    await userSchema.updateOne({ _id: userId }, { randomMatchTimeout: timeoutKey })
    // time out for no opponent found
    const selfDetails = await userSchema.findOne({ _id: userId })
    global[timeoutKey] = setTimeout(async () => {
        await userSchema.updateOne({ _id: userId }, { randomMatchTimeout: null })
        //delete match
        await matchSchema.findOneAndUpdate({ players: [userId] }, { endTime: new Date() }).sort('-createdAt')

        //delete match Req
        gameRequestSchema.deleteOne({ from: userId }).then()
        //emit to the selfUser
        io.to(socketId).emit(socketConstants.opponentFound, {
            status: false,
            userName: null,
            profileImage: null,
            message: selfDetails.language == "en" ? messages.opponentNotFound : swMessages.opponentNotFound
        })

    }, parseInt(process.env.FRIEND_MATCH_TIMER))
}

module.exports.tournamentFixture = async (tournamentDetail) => {
    const aggregation = [
        {
            $match: {
                _id: { $in: tournamentDetail.joinedPlayers.map(x => mongoose.Types.ObjectId(x._id)) }
            }
        },
        {
            $lookup: {
                from: 'matches',
                localField: '_id',
                foreignField: 'players',
                pipeline: [
                    {
                        $match: {
                            tournament: mongoose.Types.ObjectId(tournamentDetail?._id),
                        }
                    },
                    {
                        $sort: {
                            updatedAt: -1
                        }
                    }
                ],
                as: 'matchDetails'
            }
        },
        // {
        //     $lookup: {
        //         from: 'matches',
        //         let: { user: '$_id' },
        //         localField: '_id',
        //         foreignField: 'players',
        //         pipeline: [
        //             {
        //                 $match: {
        //                     tournament: mongoose.Types.ObjectId(tournamentDetail?._id),
        //                     endTime: { $ne: null },
        //                     $expr: { $eq: ['$winner', '$$user'] }
        //                 }
        //             }
        //         ],
        //         as: 'totalWins'
        //     }
        // },
        {
            $addFields: {
                index: { $indexOfArray: [tournamentDetail.joinedPlayers, "$_id"] },
                status: {
                    $cond: [
                        { $in: ['$_id', tournamentDetail.exitPlayers || []] },
                        { message: 'eliminated', icon: 'eliminated' },
                        {
                            $cond: [
                                { $ne: [{ $first: '$matchDetails.startTime' }, null] },
                                { message: 'inGame', icon: 'inGame' },
                                { message: 'waiting', icon: 'waiting' },
                            ]
                        }
                    ]
                },
                // divideBy: { $cond: [{ $eq: [{ $first: '$lastMatch.endBySelfExit' }, true] }, 1, 2] }
            }
        },
        {
            $addFields: {
                statusCode: {
                    $cond: [
                        { $eq: ['$status.message', 'inGame'] },
                        0,
                        {
                            $cond: [
                                { $eq: ['$status.message', 'waiting'] },
                                1,
                                2
                            ]
                        }
                    ]
                },
                // checkWins: "$totalWins",
                // totalWins: {
                //     $ceil: {
                //         $divide: [
                //             {
                //                 $size: '$totalWins'

                //             }, 2]
                //     }
                // },
                //totalWins: 1
            }
        },
        {
            $sort: { index: 1 }
        },
        {
            $sort: {
                totalWins: -1,
                statusCode: 1,
            }
        },
        {
            $project: {
                userName: 1,
                profileImage: 1,
                totalWins: 1,
                status: 1,
                avatar: 1,
                statusCode: 1,
                language: 1,
                checkWins: 1,
                socketId: 1,
                badge: getBadge('$coins')
            }
        }
    ]

    const fixture = await userSchema.aggregate(aggregation)
    let rank = 1
    const updatedFixture = fixture.map(x => {
        x['rank'] = rank
        rank++
        return x
    })

    return updatedFixture
}

module.exports.getUniqueElements = (arr1, arr2) => {
    return arr1.filter(element => !arr2.includes(utils.parseMongoId(element)))
        .concat(arr2.filter(element => !arr1.includes(utils.parseMongoId(element))));
}

module.exports.tournamentStuff = async () => {
    setInterval(async () => {
        const tournamentDetail = await tournamentSchema.find({ dateTime: new Date(moment().utc(moment()).format('YYYY-MM-DDTHH:mm')), isStart: false, isEnd: false }).populate('players')
        if (tournamentDetail?.length > 0) {
            const tournamentIds = []
            const toDelete = []
            const moneyBack = []
            for (let i of tournamentDetail) {
                if (i?.totalPlayers == i.players.length) {
                    tournamentIds.push(i._id)
                    for (let player of i.players) {
                        global.io.to(player.socketId).emit('tournamentStart', { tournamentIds })
                    }
                } else {
                    for (let user of i.players) global.io.to(user.socketId).emit(socketConstants.coinsUpdate, { coins: user.coins + i.registerCoins, badge: getBadge(user.coins + i.registerCoins, false) })
                    moneyBack.push({ updateMany: { filter: { _id: { $in: i.players } }, update: { $inc: { coins: i?.registerCoins } } } })
                    toDelete.push(i._id)
                }
            }

            await Promise.all([
                tournamentSchema.updateMany({ _id: { $in: tournamentIds } }, { isStart: true }),
                tournamentSchema.deleteMany({ _id: { $in: toDelete } }),
                userSchema.bulkWrite(moneyBack)
            ])

            global.io.emit('screenRefresh', {})

            setTimeout(async () => {

                await tournamentSchema.updateMany({ _id: { $in: tournamentIds } }, { $set: { destoryAfter2Mins: true } })
                const allTournaments = await tournamentSchema.find({ _id: { $in: tournamentIds }, isEnd: false })
                for (let tournament of allTournaments) {
                    if (tournament.exitPlayers.length == tournament.joinedPlayers.length - 1) {

                        let runnerUp = await this.tournamentFixture(tournament)


                        const winner = this.getUniqueElements(tournament.exitPlayers, tournament.joinedPlayers)

                        runnerUp = runnerUp.filter(e => String(e._id) != String(winner[0]))

                        let looser = null



                        if (tournament.joinedPlayers.includes(utils.parseMongoId(winner[0]))) {

                            const winCoins = parseFloat((tournament.registerCoins * tournament.players.length) * 0.50)
                            const looserCoins = parseFloat((tournament.registerCoins * tournament.players.length) * 0.25)


                            if (runnerUp.length > 0) {
                                looser = await userSchema.findOneAndUpdate({ _id: runnerUp[0]._id }, { $inc: { coins: looserCoins }, $set: { alreadyPlayed: [], inMatch: false } }, { new: true })
                            }


                            const [updatedUser] = await Promise.all([
                                userSchema.findOneAndUpdate({ _id: winner[0] }, { $inc: { coins: winCoins }, $set: { alreadyPlayed: [], inMatch: false } }, { new: true }),
                                tournamentSchema.updateOne({ _id: tournament._id }, { isEnd: true, winner: winner[0] }),
                                matchSchema.deleteMany({ tournament: tournament._id, startTime: null })
                            ])
                            const winnerPlayer = await userSchema.findOne({ _id: winner[0] }).lean()
                            global.io.to(winnerPlayer.socketId).emit(socketConstants.tournamentResult, { message: winnerPlayer.language == 'en' ? messages.wonTourn : swMessages.wonTourn, isWinner: true, winCoins: updatedUser?.coins })

                            if (runnerUp.length > 0) global.io.to(runnerUp[0].socketId).emit(socketConstants.coinsUpdate, { coins: looser.coins, badge: getBadge(looser.coins, false) })
                        }
                    }
                }
                global.io.emit('screenRefresh', { a: "" })
            }, 120000)
        }
    }, 1000)
}

module.exports.lastGameStatus = async (userDetails, io) => {
    console.log(':::: lastGameStatus :::: ', { inMatch: userDetails?.inMatch })
    if (userDetails?.inMatch) {
        const [match] = await Promise.all([
            matchSchema.findOne({ players: userDetails._id }).populate('tournament').sort({ createdAt: -1 }),
            userSchema.updateOne({ _id: userDetails._id }, { inMatch: false })
        ])
        if (match && match?.tournament && match?.endTime) {
            if (String(match?.tournament?.winner) == String(userDetails?._id)) io.to(userDetails?.socketId).emit(socketConstants.lastGameStatus, { message: userDetails.language == 'en' ? messages.lastWonTourn : swMessages.lastWonTourn })
            else io.to(userDetails?.socketId).emit(socketConstants.lastGameStatus, { message: userDetails.language == 'en' ? messages.lastLostTourn : swMessages.lastLostTourn })
            await userSchema.updateOne({ _id: userDetails?._id }, { inMatch: false })
        } else if (match && match?.endTime) {
            if (String(match?.winner) == String(userDetails?._id)) io.to(userDetails?.socketId).emit(socketConstants.lastGameStatus, { message: userDetails.language == 'en' ? messages.lastWonRandom : swMessages.lastWonRandom })
            else io.to(userDetails?.socketId).emit(socketConstants.lastGameStatus, { message: userDetails.language == 'en' ? messages.lastLostRandom : swMessages.lastLostRandom })
            await userSchema.updateOne({ _id: userDetails?._id }, { inMatch: false })
        } else if (match && !match.endTime) selfExit(userDetails, io, false, true)
        else {
            if (userDetails.lastMatch == 'tournament') io.to(userDetails?.socketId).emit(socketConstants.lastGameStatus, { message: userDetails.language == 'en' ? messages.lastLostTourn : swMessages.lastLostTourn })
            // else io.to(userDetails?.socketId).emit(socketConstants.lastGameStatus, { message: userDetails.language == 'en' ? messages.lastLostRandom : swMessages.lastLostRandom })
            await userSchema.updateOne({ _id: userDetails?._id }, { inMatch: false })
        }
    } else if (userDetails?.netOff) {
        await userSchema.updateOne({ _id: userDetails?._id }, { netOff: false })
        io.to(userDetails?.socketId).emit(socketConstants.lastGameStatus, { message: userDetails.language == 'en' ? messages.lastWonRandom : swMessages.lastWonRandom })
    }
}