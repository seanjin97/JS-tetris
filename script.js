document.addEventListener("DOMContentLoaded", () => {
    const width = 10
    const grid = document.querySelector(".grid")
    let squares = Array.from(document.querySelectorAll(".grid div"))
    const scoreDisplay = document.querySelector("#score")
    const startBtn = document.querySelector("#start-button")
    let nextRandom = 0
    let timerId
    let score = 0
    const colors = [
        "orange",
        "red",
        "purple",
        "green", 
        "blue"
    ]

    //The Tetrominoes, index of each square of the shape
    const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
    ]

    const zTetromino = [
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1],
    [0,width,width+1,width*2+1],
    [width+1, width+2,width*2,width*2+1]
    ]

    const tTetromino = [
    [1,width,width+1,width+2],
    [1,width+1,width+2,width*2+1],
    [width,width+1,width+2,width*2+1],
    [1,width,width+1,width*2+1]
    ]

    const oTetromino = [
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1],
    [0,1,width,width+1]
    ]

    const iTetromino = [
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3],
    [1,width+1,width*2+1,width*3+1],
    [width,width+1,width+2,width+3]
    ]

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]

    let currentPosition = 4 // initialise the starting position
    let currentRotation = 0 // initialise the starting rotation

    let random = Math.floor(Math.random() * theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation] // initialise the starting tetromino pattern a random

    //draw the first rotation in the first tetromino
    draw = () => {
        current.forEach(index => { // for each square in the current tetromino pattern e.g. [0, 1, 2, 4], add a class to div element at the position of the square. Take currentPosition as the starting point to draw the shape
            squares[currentPosition + index].classList.add("tetromino") 
            squares[currentPosition + index].style.backgroundColor = colors[random]
        })
    }

    // undraw the Tetramino
    undraw = () => {
        current.forEach(index => { // for each square in the current tetromino pattern e.g. [0, 1, 2, 4], remove the class from the div element at the position of the square. Take currentPosition as the starting point to draw the shape
            squares[currentPosition + index].classList.remove("tetromino")
            squares[currentPosition + index].style.backgroundColor = ""
        })
    }
    
    // move down function
    moveDown = () => {
        undraw()
        currentPosition += width // move down by 1 box
        draw()
        freeze()
    }

    // move the tetromino left, unless it is at the edge or there is a blockage
    moveLeft = () => {
        undraw()
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0) // True if any square touches the left edge of the grid i.e. coordinates are multiples of 10

        if (!isAtLeftEdge) { // check if at left edge, if not at left edge, move 1 coordinate left
            currentPosition -= 1
        }
        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) { // check if frozen blocks are in place on the left, if yes then stay at current position
            currentPosition += 1
        }
        draw()
    }

    // move the tetromino right, unless it is at the edge or there is a blockage
    moveRight = () => {
        undraw()
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1)
        if (!isAtRightEdge) {
            currentPosition += 1
        }
        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            currentPosition -= 1
        }
        draw()
    }
    
    // if currentPosition === width - 1 returns true
    isAtRight = () => { 
        return current.some(index => (currentPosition + index + 1) % width === 0)
    }

    // if currentPosition === to left most position return true
    isAtLeft = () => {
        return current.some(index => (currentPosition + index) % width === 0)
    }

    // check valid rotation of tetromino before the rotation
    checkRotatedPosition = (P) => { // P refers to hypothetical position before the move. on first call P is the currentPosition
        P = P || currentPosition // if P is null, P = currentPosition, if P is not null, then P = P.
        // tetromino wraps around from left to right when currentPosition decreases
        if ((P+1) % width < 4) { // check if P is on left half of grid. also add 1 as the position index can be 1 less than where the piece is
            if (isAtRight()) { // check if actual position of tetromino is flipped to the other side since being at the max edge will cause it to flip over
                currentPosition += 1 // move to the right to prevent tetrtomino from wrapping into right 
                checkRotatedPosition(P) // check again
            }
            // tetromino wraps around from right to left when currentPosition increases
        } else if (P % width > 5) { // if P is on the right side of the grid
            if (isAtLeft()) { // check actual currentPosition of tetromino has wrapped into the left
                currentPosition -= 1 // shift tetromino backwards to attempt to remove wrapping
                checkRotatedPosition(P) // check again
            }
        }
    }

    rotate = () => {
        undraw()
        currentRotation++
        if (currentRotation === current.length) { // if the current rotation gets to 4, reset back to 0
            currentRotation = 0
        }
        current = theTetrominoes[random][currentRotation]
        checkRotatedPosition()
        draw()
    }
    
    moveDown = () => {
        undraw()
        
        currentPosition += width

        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            currentPosition -= width
        }

        if (current.some(index => squares[currentPosition + index].classList.contains("tetromino"))) {
            currentPosition -= width
        }
        draw()
        freeze()
    }
    // assign functions to keyCodes
    control = (e) => {
        if (e.keyCode === 37) {
            moveLeft()
        } else if (e.keyCode === 38) {
            rotate()
        } else if (e.keyCode === 39) {
            moveRight()
        } else if (e.keyCode === 40) {
            moveDown()
        }
    }
    document.addEventListener("keyup", control)
    
    // show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll(".mini-grid div")
    const displayWidth = 4
    let displayIndex = 0
    // the Tetrominoes without rotations
    const upNextTetrominoes = [
        [1, displayWidth+1, displayWidth*2+1, 2],
        [0, displayWidth, displayWidth+1, displayWidth*2+1],
        [1, displayWidth, displayWidth+1, displayWidth+2],
        [0, 1, displayWidth, displayWidth+1], 
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1]
    ]

    // display the shape in the mini-grid display
    displayShape = () => {
        // remove any trace of a tetromino from the mini grid
        displaySquares.forEach(box => {
            box.classList.remove("tetromino")
            box.style.backgroundColor = ""
        })
        upNextTetrominoes[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add("tetromino")
            displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
        })
    }

    // freeze the tetromino once at the bottom
    freeze = () => { // array.some is similar to forEach, it iterates through each element in the array and returns true if any 1 of the elements returns true for logic
        if (current.some(index => squares[currentPosition + index + width].classList.contains("taken"))) { // any of the boxes in the space of the dimension of the tetromino + 1 line below it has the class "taken", meaning that the tetromino is at the bottom of the playing space
            current.forEach(index => squares[currentPosition + index].classList.add("taken")) // add "taken" to the current position of the tetromino for each of the squares, to prevent overwrite from other tetrominoes
            
            // start a new tetromino falling
            random = nextRandom
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            current = theTetrominoes[random][currentRotation]
            currentPosition = 4
            draw()
            displayShape()
            addScore()
            gameOver()
        }
    }

    // add score
    addScore = () => {
        for (let i=0; i<199; i+=width) { // for each row on the grid
            const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9] // this is the current row

            if (row.every(index => squares[index].classList.contains("taken"))) { // if all the boxes in the row contain squares from tetrominoes
                score += 10
                scoreDisplay.innerHTML = score // change inner html of element in DOM
                row.forEach(index => {
                    squares[index].classList.remove("taken") // remove taken class from reach square in row
                    squares[index].classList.remove("tetromino")
                    squares[index].style.backgroundColor = ""
                })
                const squaresRemoved = squares.splice(i, width) // remove row, splice(starting index, number of items to remove)
                squares = squaresRemoved.concat(squares)
                squares.forEach(cell => grid.appendChild(cell)) 
            }
        }
    }

    // add functionality to the button
    startBtn.addEventListener("click", () => {
        if (timerId) { // when button clicked and there's a timeId assigned, pause the game
            clearInterval(timerId)
            timerId = null
        } else { // if button is clicked and timeId is null, start the game
            draw()
            timerId = setInterval(moveDown, 1000)
            nextRandom = Math.floor(Math.random() * theTetrominoes.length)
            displayShape()
        }
    })

    gameOver = () => {
        if (current.some(index => squares[currentPosition + index].classList.contains("taken"))) {
            scoreDisplay.innerHTML = "end" // change score to end
            clearInterval(timerId) // stop timer
        }
    }
})

