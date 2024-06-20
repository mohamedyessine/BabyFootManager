function bfList() {
  'use strict'
  var lastActiveGameIndex = -1

  const gameListContainer = document.getElementById('gameList')
  const gameList = gameListContainer.querySelector('ul')

  function getGames() {
    bfHttpService.get('games').then(function(gamesData){
      writeGamesToDom(gamesData) 
    })
  }

  getGames()
  bfWebSocketService.addEventListener('open', getGames)


  gameList.addEventListener('click', function(event) {
    const elementClass = event.target.classList[0]
    const parentElement = event.target.parentElement
    const gameId = parentElement.getAttribute('data-id')

    switch(elementClass) {
      case 'finishCheckBox' :
        var messageSent = bfWebSocketService.sendMessage('finishGame', {
          id: gameId,
          active: !event.target.checked,

        }, event)

        if (!messageSent) {
          return
        }

        event.target.disabled = true
        break
      
      case 'deleteCheckBox' :
        bfWebSocketService.sendMessage('deleteGame', { id: gameId }, event)
        break
    }
  })

  gameList.addEventListener('keydown', function(event) {
  

    const inputValue = event.target.value
    const allowedKey = event.key.length > 1
    const startPos = event.target.selectionStart
    const endPos = event.target.selectionEnd
    const proposedValue = inputValue.slice(0, startPos) + event.key + inputValue.slice(endPos, inputValue.length)
    const outOfRange = !isNaN(proposedValue) && (proposedValue < 0 || proposedValue > 10)

    if( !allowedKey && (outOfRange || isNaN(event.key))) {
      event.preventDefault()
    }

    if (!allowedKey && !isNaN(proposedValue) && proposedValue.length == 2 && proposedValue[0] == 0) {
      event.target.value = proposedValue[1]
      event.preventDefault()
    }

    if (event.keyCode == 38 || event.keyCode == 107) {
      const newValue = +event.target.value + 1

      if (newValue != null && !isNaN(newValue) && newValue <= 10) {
        event.target.value = newValue
        event.preventDefault()
      }
    }

    if (event.keyCode == 40 || event.keyCode == 109) {
      const newValue = +event.target.value - 1

      if (newValue != null && !isNaN(newValue) && newValue >= 0) {
        event.target.value = newValue
        event.preventDefault()
      }
    }
  })

  bfWebSocketService.addEventListener('message', function(event){
    const data = JSON.parse(event.data)
    switch(data.type) {
      case 'addGame' :
        addGame(data.body)
        break
      case 'finishGame' :
        finishGame(data.body)
        break
      case 'deleteGame' :
        deleteGameWithVisualEffect(data.body)
        break
    }
  })

 
  function addGame(gameData) {
    const newGameElement = buildNewGameElement(gameData) 
    const tempClass = gameData.active ? 'newGame' : 'finishedGame'
    newGameElement.classList.add(tempClass)
    const insertIndex = lastActiveGameIndex + (gameData.active ? 1 : 0)

    gameList.insertBefore(newGameElement, gameList.children[insertIndex])

    setTimeout(function() {
      newGameElement.classList.remove(tempClass)
    }, 300);

    if (gameData.active) {
      lastActiveGameIndex++
      updateGameCounter()
    }
  }


  function finishGame(gameData) {
    const gameElementToDelete = gameList.querySelector("[data-id='" + gameData.id + "']")
    const spanElements = gameElementToDelete.getElementsByTagName('span')
    const textElement = spanElements[0]

    const finishCheckBox = gameElementToDelete.getElementsByClassName('finishCheckBox')[0]
    gameElementToDelete.classList.add('finishedGame')
    finishCheckBox.checked = true
    finishCheckBox.disabled = true

    textElement.parentElement.classList.add('finished')
 
    setTimeout(function() {
      deleteGame(gameData)
      addGame(gameData)
      lastActiveGameIndex--
      updateGameCounter()
    }, 250);
  }


  function deleteGameWithVisualEffect(gameData) {
    const gameElementToDelete = gameList.querySelector("[data-id='" + gameData.id + "']")

    if (!gameElementToDelete) {
      return
    }

    gameElementToDelete.classList.add('deletedGame')

    setTimeout(function() {
      deleteGame(gameData) 
    }, 150);
  }

  function deleteGame(gameData) {
    const gameElementToDelete = gameList.querySelector("[data-id='" + gameData.id + "']")

    if (!gameElementToDelete) {
      return
    }

    gameList.removeChild(gameElementToDelete)

    if (gameData.active) {
      lastActiveGameIndex--
      updateGameCounter()
    }
  }

  function updateGameCounter() {
    const gameListHeading = gameListContainer.querySelector('h2')
    gameListHeading.querySelector('span').innerHTML = lastActiveGameIndex + 1
  }

  function writeGamesToDom(gamesData) {
    gameList.innerHTML = ''

    gamesData.forEach(function(gameData, index) {
      if (gameData.active) {
        lastActiveGameIndex = index
      }

      const gameElement = buildNewGameElement(gameData)
      gameList.appendChild(gameElement)
    })

    updateGameCounter()
  }


  function buildNewGameElement(gameData) {
    const newGameElement = document.createElement('li')
    const finishCheckBox = buildFinishCheckBox(gameData.active)
    const newGameText = buildGameText(gameData.player1, gameData.player2)
    const deleteCheckBox = buildDeleteCheckBox();
    finishCheckBox.style.marginRight = "10px";
    newGameElement.setAttribute('data-id', gameData.id)
    newGameElement.appendChild(newGameText)
    newGameElement.appendChild(finishCheckBox)
    newGameElement.appendChild(deleteCheckBox);

    if (finishCheckBox.checked) {
      newGameElement.classList.add('finished')
    }

    return newGameElement
  }

  function buildDeleteCheckBox() {
    var deleteCheckBox = document.createElement('input')
    deleteCheckBox.type = "checkbox"
    deleteCheckBox.classList.add('deleteCheckBox')
    deleteCheckBox.setAttribute('title', 'Supprimer le jeu')
    return deleteCheckBox
  }
  

  function buildGameText(player1name, player2name) {
    var newGameText = document.createElement('span')
    newGameText.innerHTML = player1name + ' vs ' + player2name
    return newGameText
  }


  function buildFinishCheckBox(active) {
    var finishCheckBox = document.createElement('input')
    finishCheckBox.type = "checkbox"
    finishCheckBox.checked = !active
    finishCheckBox.disabled = !active
    finishCheckBox.classList.add('finishCheckBox')
    finishCheckBox.setAttribute('title', 'Terminez le jeu')
    return finishCheckBox
  }
}
