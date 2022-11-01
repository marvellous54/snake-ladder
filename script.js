class Player {
    constructor(distance, icon, serialNumber, dangerPaths, dangerSentPaths, boostPaths, boostedPaths, paths, win) {
        this.distance = distance
        this.icon = icon
        this.serialNumber = serialNumber
        this.dangerPaths = dangerPaths
        this.dangerSentPaths = dangerSentPaths
        this.boostPaths = boostPaths
        this.boostedPaths = boostedPaths
        this.paths = paths
        this.win = win
    }

    appendIcon(player) {
        player.paths[player.distance].append(player.icon)
    }

    onDangerPaths() {
        return this.dangerPaths.some(path => {
            return this.distance === path
        });
    }

    onBoostPaths() {
        return this.boostPaths.some(path => {
            return this.distance === path
        })
    }

    onOtherPlayerPath() {
        return this.paths[this.distance].childElementCount === 2
    }

    maxDistance() {
        return this.distance >= 99
    }

    playerBackHome() {
        if (this.onDangerPaths()) {
            this.distance = this.dangerSentPaths[this.dangerPaths.indexOf(this.distance)]
            this.appendIcon(this)
        }
    }

    boostPlayerDistance() {
        if (this.onBoostPaths()) {
            this.distance = this.boostedPaths[this.boostPaths.indexOf(this.distance)]
            this.appendIcon(this)
        }
    }

    sendOpponentHome(playerOne, playerTwo) {
        if (this.onOtherPlayerPath()) {
            if (this.paths[this.distance].firstElementChild === playerOne.icon) {
                playerOne.distance = 0
                this.appendIcon(playerOne)
            } else if (this.paths[this.distance].firstElementChild === playerTwo.icon) {
                playerTwo.distance = 0
                this.appendIcon(playerTwo)
            }
        }
    }

    checkWin() {
        if (this.maxDistance()) {
            this.win = true
            this.distance = 99
            this.appendIcon(this)
        }
    }

    reset() {
        this.distance = 0
        this.appendIcon(this)
        this.win = false
    }

    actions(numberEl, playerOne, playerTwo, appendIconTime, extraActionsTime) {        
        this.distance += parseInt(numberEl.textContent)
        setTimeout(() => {
            if (this.distance < 99) {
                this.appendIcon(this)
            } else if (this.distance >= 99) {
                this.checkWin()
            }

            setTimeout(() => {
                this.playerBackHome()
                this.boostPlayerDistance()
                this.sendOpponentHome(playerOne, playerTwo)
                this.checkWin()
            }, extraActionsTime);  
        }, appendIconTime)      
    }
}

// before creating the paths
// dom variables
const boardEl = document.querySelector("[data-board]")
const diceRollerEl = document.querySelector("[data-dice-roller]") 
const diceNumberEl = document.querySelector("[data-dice-number]")
const messageBoxEl = document.querySelector("[data-message-container]")

// js variables
    // players
let playerOne = new Player(0, document.querySelector("[data-player-one]"), 1)
let playerTwo = new Player(0, document.querySelector("[data-player-two]"), 2)
    // booleans
let gameStart = false
let playerOneTurn = true
let playWithComputer = null
let diceInterval = null
    // time
const stopDiceIntTime = 2000
const diceIntTime = 10
const appendIconTime = 750
const extraActionsTime = 500 // after append "appendIconTime" making it value (500 + 750) = 1250
const swapTurnTime = 2700
const announceSwapTurnTime = 1500
const removeAnnouncerTime = 750 // after "announceSwapTurnTime" making it value (1500 + 750) = 2250

// creating paths
createPaths()

// after creating the paths 
// dom variables
const paths = [...document.querySelectorAll("[data-path]")]
paths[playerOne.distance].append(playerOne.icon)
paths[playerTwo.distance].append(playerTwo.icon)

// js variables
let dangerPaths = [34, 38, 47, 61, 87, 93, 95]
let dangerSentPaths = [5, 9, 26, 12, 23, 72, 54]
let boostPaths = [3, 7, 20, 25, 70, 79]
let boostedPaths = [15, 29, 41, 73, 91, 98]

// player one extra data
playerOne.paths = paths
playerOne.dangerPaths = dangerPaths
playerOne.dangerSentPaths = dangerSentPaths
playerOne.boostPaths = boostPaths
playerOne.boostedPaths = boostedPaths
playerOne.win = false

// player two extra data
playerTwo.paths = paths
playerTwo.dangerPaths = dangerPaths
playerTwo.dangerSentPaths = dangerSentPaths
playerTwo.boostPaths = boostPaths
playerTwo.boostedPaths = boostedPaths
playerTwo.win = false

function createPaths() {
    let paths = ''
    for (let i = 0; i < 100; i++) {
        paths += `<div class="path" data-path></div>`
    }
    boardEl.innerHTML = paths
}

function rollDice(player) {
    if (diceInterval === null && noWin()) {
        let randomNumber = null
        diceInterval = setInterval(() => {
            randomNumber = Math.floor( Math.random() * 6 ) + 1
            diceNumberEl.textContent = randomNumber
        }, diceIntTime);
        setTimeout(() => {
            clearInterval(diceInterval)
            diceInterval = null
            movePlayers(player)
        }, stopDiceIntTime);
    } else {
        announceWinInterface()
    }
}

function movePlayers(player) {
    player.actions(diceNumberEl, playerOne, playerTwo, appendIconTime, extraActionsTime)
    announceTurnInterface()
    swapTurn()
}

function swapTurn() {
    setTimeout(() => {
        playerOneTurn = !playerOneTurn

        if (!playerOneTurn && playWithComputer) {
            rollDice(playerTwo)
        } 
    }, swapTurnTime)     
}

function noWin() {
    return playerOne.win === false && playerTwo.win === false
}

function startGame(target, targetParent) {
    if (target.textContent === "Yes") {
        playWithComputer = true
    } else if (target.textContent === "No") {
        playWithComputer = false
    } else if (target.textContent === "Restart") {
        restartGame()
    }
    gameStart = true
    targetParent.classList.add("hide")
}

function restartGame() {
    messageBoxEl.innerHTML = `
        <p>do you want to play with computer?</p>
        <button>Yes</button>
        <button>No</button>
    `
    setTimeout(() => {
        showAnnouncer()
        resetGame()
    }, 500);
}

function resetGame() {
    playerOne.reset()
    playerTwo.reset()
    playerOneTurn = true
    diceInterval = null
    diceNumberEl.textContent = ""
}


// functions that passes message on the screen through the "messageBoxEl"
function announceTurnInterface() {
    setTimeout(() => {
        if (playerOneTurn && noWin()) {
            announcePlayerTwoTurn()
            removeAnnouncer()
        } else if (!playerOneTurn && noWin()) {
            announcePlayerOneTurn()
            removeAnnouncer()
        }
    }, announceSwapTurnTime);    
}

function announceWinInterface() {
    showAnnouncer()
    if (playerOne.win === true) {
        messageBoxEl.innerHTML = ` <p>player 1 wins</p> <button class="span-two">Restart</button>`
    } else if (playerTwo.win === true) {
        messageBoxEl.innerHTML = ` <p>player 2 wins</p> <button class="span-two">Restart</button>`
    }
}

function announcePlayerTwoTurn() {
    messageBoxEl.classList.remove("hide")
    messageBoxEl.innerHTML = ` <p>Player 2's Turn</p> `
    diceRollerEl.style.backgroundColor = "limegreen"
}

function announcePlayerOneTurn() {
    messageBoxEl.classList.remove("hide")
    messageBoxEl.innerHTML = ` <p>Player 1's Turn</p> `
    diceRollerEl.style.backgroundColor = "blue"
}

function showAnnouncer() {
    messageBoxEl.classList.remove("hide")
}

function removeAnnouncer() {
    setTimeout(() => {
        messageBoxEl.classList.add("hide")
    }, removeAnnouncerTime);
}


// eventListeners
diceRollerEl.addEventListener("click", () => {
    if (playerOneTurn && noWin() && gameStart) {
        rollDice(playerOne)        
    } else if (!playerOneTurn && noWin() && !playWithComputer) {
        rollDice(playerTwo)
    }
})

messageBoxEl.addEventListener("click", (e) => {
    const target = e.target
    const targetParent = target.parentElement
    startGame(target, targetParent)
})
