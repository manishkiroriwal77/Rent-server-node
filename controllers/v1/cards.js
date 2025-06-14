const cardPoints = {
    King: 4,
    Jack: 3,
    Queen: 2,
    Ace: 11,
    Three: 0,
    Four: 0,
    Five: 0,
    Six: 0,
    Seven: 10
}

const cardValues = {
    King: 13,
    Jack: 11,
    Queen: 12,
    Ace: 14,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7
}

const suits = {
    "Heart": "Heart",
    "Diamond": "Diamond",
    "Club": "Club",
    "Spade": "Spade"
}

module.exports.generateRandomSuite = () => {
    let suitArray = Object.keys(suits)
    let randomIndex = Math.floor(Math.random() * suitArray.length);
    return suitArray[randomIndex]
}


module.exports.cards = [
    {
        "name": "King",
        "points": cardPoints.King,
        "suit": suits.Heart,
        "value": "HK",
        "cardvalue": cardValues.King
    },
    {
        "name": "Jack",
        "points": cardPoints.Jack,
        "suit": suits.Heart,
        "value": "HJ",
        "cardvalue": cardValues.Jack
    },
    {
        "name": "Queen",
        "points": cardPoints.Queen,
        "suit": suits.Heart,
        "value": "HQ",
        "cardvalue": cardValues.Queen
    },
    {
        "name": "Ace",
        "points": cardPoints.Ace,
        "suit": suits.Heart,
        "value": "HA",
        "cardvalue": cardValues.Ace
    },
    {
        "name": "Three",
        "points": cardPoints.Three,
        "suit": suits.Heart,
        "value": "H3",
        "cardvalue": cardValues.Three
    },
    {
        "name": "Four",
        "points": cardPoints.Four,
        "suit": suits.Heart,
        "value": "H4",
        "cardvalue": cardValues.Four
    },
    {
        "name": "Five",
        "points": cardPoints.Five,
        "suit": suits.Heart,
        "value": "H5",
        "cardvalue": cardValues.Five

    },
    {
        "name": "Six",
        "points": cardPoints.Six,
        "suit": suits.Heart,
        "value": "H6",
        "cardvalue": cardValues.Six

    },
    {
        "name": "Seven",
        "points": cardPoints.Seven,
        "suit": suits.Heart,
        "value": "H7",
        "cardvalue": cardValues.Seven
    },
    {
        "name": "King",
        "points": cardPoints.King,
        "suit": suits.Diamond,
        "value": "DK",
        "cardvalue": cardValues.King
    },
    {
        "name": "Jack",
        "points": cardPoints.Jack,
        "suit": suits.Diamond,
        "value": "DJ",
        "cardvalue": cardValues.Jack

    },
    {
        "name": "Queen",
        "points": cardPoints.Queen,
        "suit": suits.Diamond,
        "value": "DQ",
        "cardvalue": cardValues.Queen
    },
    {
        "name": "Ace",
        "points": cardPoints.Ace,
        "suit": suits.Diamond,
        "value": "DA",
        "cardvalue": cardValues.Ace
    },
    {
        "name": "Three",
        "points": cardPoints.Three,
        "suit": suits.Diamond,
        "value": "D3",
        "cardvalue": cardValues.Three
    },
    {
        "name": "Four",
        "points": cardPoints.Four,
        "suit": suits.Diamond,
        "value": "D4",
        "cardvalue": cardValues.Four
    },
    {
        "name": "Five",
        "points": cardPoints.Five,
        "suit": suits.Diamond,
        "value": "D5",
        "cardvalue": cardValues.Five
    },
    {
        "name": "Six",
        "points": cardPoints.Six,
        "suit": suits.Diamond,
        "value": "D6",
        "cardvalue": cardValues.Six
    },
    {
        "name": "Seven",
        "points": cardPoints.Seven,
        "suit": suits.Diamond,
        "value": "D7",
        "cardvalue": cardValues.Seven
    },
    {
        "name": "King",
        "points": cardPoints.King,
        "suit": suits.Club,
        "value": "CK",
        "cardvalue": cardValues.King
    },
    {
        "name": "Jack",
        "points": cardPoints.Jack,
        "suit": suits.Club,
        "value": "CJ",
        "cardvalue": cardValues.Jack
    },
    {
        "name": "Queen",
        "points": cardPoints.Queen,
        "suit": suits.Club,
        "value": "CQ",
        "cardvalue": cardValues.Queen
    },
    {
        "name": "Ace",
        "points": cardPoints.Ace,
        "suit": suits.Club,
        "value": "CA",
        "cardvalue": cardValues.Ace
    },
    {
        "name": "Three",
        "points": cardPoints.Three,
        "suit": suits.Club,
        "value": "C3",
        "cardvalue": cardValues.Three
    },
    {
        "name": "Four",
        "points": cardPoints.Four,
        "suit": suits.Club,
        "value": "C4",
        "cardvalue": cardValues.Four
    },
    {
        "name": "Five",
        "points": cardPoints.Five,
        "suit": suits.Club,
        "value": "C5",
        "cardvalue": cardValues.Five

    },
    {
        "name": "Six",
        "points": cardPoints.Six,
        "suit": suits.Club,
        "value": "C6",
        "cardvalue": cardValues.Six
    },
    {
        "name": "Seven",
        "points": cardPoints.Seven,
        "suit": suits.Club,
        "value": "C7",
        "cardvalue": cardValues.Seven
    },
    {
        "name": "King",
        "points": cardPoints.King,
        "suit": suits.Spade,
        "value": "SK",
        "cardvalue": cardValues.King
    },
    {
        "name": "Jack",
        "points": cardPoints.Jack,
        "suit": suits.Spade,
        "value": "SJ",
        "cardvalue": cardValues.Jack
    },
    {
        "name": "Queen",
        "points": cardPoints.Queen,
        "suit": suits.Spade,
        "value": "SQ",
        "cardvalue": cardValues.Queen
    },
    {
        "name": "Ace",
        "points": cardPoints.Ace,
        "suit": suits.Spade,
        "value": "SA",
        "cardvalue": cardValues.Ace
    },
    {
        "name": "Three",
        "points": cardPoints.Three,
        "suit": suits.Spade,
        "value": "S3",
        "cardvalue": cardValues.Three
    },
    {
        "name": "Four",
        "points": cardPoints.Four,
        "suit": suits.Spade,
        "value": "S4",
        "cardvalue": cardValues.Four
    },
    {
        "name": "Five",
        "points": cardPoints.Five,
        "suit": suits.Spade,
        "value": "S5",
        "cardvalue": cardValues.Five
    },
    {
        "name": "Six",
        "points": cardPoints.Six,
        "suit": suits.Spade,
        "value": "S6",
        "cardvalue": cardValues.Six
    },
    {
        "name": "Seven",
        "points": cardPoints.Seven,
        "suit": suits.Spade,
        "value": "S7",
        "cardvalue": cardValues.Seven
    },

]


function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}


module.exports.distributeCards = () => {
    const shuffledCars = shuffle(this.cards)
    const deck = []
    const player1 = []
    const player2 = []
    for (let i = 0; i < shuffledCars.length; i++) {
        if (i >= 0 && i < 26) deck.push(shuffledCars[i])
        else if (i >= 26 && i < 31) player1.push(shuffledCars[i])
        else player2.push(shuffledCars[i])
    }
    //check fot hete players do not get all cards of the same suite
    // if (player1.every((e) => e.suit === player1[0].suit)) this.distributeCards()
    // else if (player2.every((e) => e.suit === player2[0].suit)) this.distributeCards()
    //else
    return { deck, player1, player2 }
}




