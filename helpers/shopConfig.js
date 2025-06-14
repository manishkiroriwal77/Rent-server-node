const fs = require('fs')
const fileList = fs.readdirSync('public/shops')
console.log(fileList)

const baseDir = 'public/shops/'

module.exports.shopConfig = {
    shopTypes: ['coins', 'skins', 'cardDecks', 'emojis'],
    costTypes: ['real', 'coins'],
    shopData: [
        {
            name: "coins_500",
            type: "coins",
            cost: "$1",
            costType: "real",
            imageUrl: baseDir + fileList[1],
            coinsGet: "500"
        },
        {
            name: "coins_2500",
            type: "coins",
            cost: "$5",
            costType: "real",
            imageUrl: baseDir + fileList[0],
            coinsGet: "2500"
        },
        {
            name: "coins_5000",
            type: "coins",
            cost: "$10",
            costType: "real",
            imageUrl: baseDir + fileList[2],
            coinsGet: "5000"
        },
        {
            name: "skin 1",
            type: "skins",
            cost: "100",
            costType: "coins",
            imageUrl: baseDir + fileList[9]
        },
        {
            name: "skin 2",
            type: "skins",
            cost: "150",
            costType: "coins",
            imageUrl: baseDir + fileList[10]
        },
        {
            name: "skin 3",
            type: "skins",
            cost: "200",
            costType: "coins",
            imageUrl: baseDir + fileList[11]
        },
        {
            name: "card Deck 1",
            type: "cardDecks",
            cost: "100",
            costType: "coins",
            imageUrl: baseDir + fileList[3]
        },
        {
            name: "card Deck 2",
            type: "cardDecks",
            cost: "150",
            costType: "coins",
            imageUrl: baseDir + fileList[4]
        },
        {
            name: "card Deck 3",
            type: "cardDecks",
            cost: "200",
            costType: "coins",
            imageUrl: baseDir + fileList[5]
        },
        {
            name: "emoji 1",
            type: "emojis",
            cost: "100",
            costType: "coins",
            imageUrl: baseDir + fileList[6]
        },
        {
            name: "emoji 2",
            type: "emojis",
            cost: "150",
            costType: "coins",
            imageUrl: baseDir + fileList[7]
        },
        {
            name: "emoji 3",
            type: "emojis",
            cost: "200",
            costType: "coins",
            imageUrl: baseDir + fileList[8]
        },

    ]
}