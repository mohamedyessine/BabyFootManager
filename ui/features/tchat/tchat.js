function bfTChat() {
  'use strict'
  const chat = document.getElementById('chat')
  const messageList = chat.querySelector('ul')
  const playerNameInput = chat.querySelector('input')
  const textArea = chat.querySelector('textarea')
  const localStorage = window.localStorage
  // le numéro de l'icône du joueur actuellement sélectionné
  var playerIconNumber
  // suivre si le nom d'utilisateur a changé depuis l'envoi du dernier message
  var nameUsedForLastMessage = playerNameInput.value

  createPlayerSearch(playerNameInput, { search_icon: true, on_enter: focusMessageBox, on_search: getPlayerIcon, on_select: setPlayerIcon })

  // recevoir les 10 derniers messages
  function getMessages() {
    bfHttpService.get('messages').then(function(messages){
      writeMessagesToDom(messages) 
    })
  }

  //exécuter une fois lors du premier chargement
  getMessages()
  bfWebSocketService.addEventListener('open', getMessages)

  // rappel pour la recherche du joueur lors de la saisie pour focaliser la boîte de message
  function focusMessageBox() {
    textArea.focus()
  }

  var initialInput = playerNameInput.value

  // obtenir l'icône du joueur lors de la première exécution
  if (initialInput) {
    setPlayerIcon(localStorage.getItem('playerIcon'), initialInput)
  }

  function getPlayerIcon(players) {
    var iconNumber
    var foundPlayer
    
    players.forEach(function(player) {
      if (player.name == playerNameInput.value) {
        iconNumber = player.icon
        foundPlayer = player.name
      }
    })

    setPlayerIcon(iconNumber, foundPlayer)
  }

  function setPlayerIcon(iconNumber, player) {
    const iconImage = chat.firstElementChild.lastElementChild

    if (!player) {
      localStorage.setItem('playerIcon', '')
      iconImage.style.display = 'none'
      playerIconNumber = null
      return
    }
    
    localStorage.setItem('playerIcon', iconNumber)
    iconImage.style.display = 'inline-block'
    var iconPosition = calculateIconPosition(iconNumber)
    iconImage.style['background-position'] = `${iconPosition.x * 30}px ${iconPosition.y * 30}px`
    playerIconNumber = iconNumber
  }


  function calculateIconPosition(iconNumber) {
    return {
      x: iconNumber % 14,
      y: Math.ceil(iconNumber / 14)
    }
  }

  textArea.addEventListener('keydown', function(event) {
    // soumettre le message sur Entrée, créer une nouvelle ligne sur Entrée + Maj
    if (event.keyCode == 13 && !event.shiftKey) {
      const messageSent = bfWebSocketService.sendMessage('newMessage', { player: playerNameInput.value , message: textArea.value.trim() }, event)
      event.target.value = null

      if (!messageSent) {
        return
      }

      event.preventDefault()
    }
  })

  function writeMessagesToDom(messagesData) {
    messageList.innerHTML = ''

    messagesData.forEach(function(messageData) {
      messageList.appendChild(buildNewMessageElement(messageData))
    })
  }

  // subscribe to the webSockets message pour obtenir de nouvelles discussions
  bfWebSocketService.addEventListener('message', function(event){
    const scrolledDown = messageList.scrollTop === messageList.scrollHeight - messageList.offsetHeight +2 
    const data = JSON.parse(event.data)

    if (data.type !== 'newMessage') {
      return
    }

    const playerName = playerNameInput.value
    messageList.appendChild(buildNewMessageElement(data.body))

    if (nameUsedForLastMessage !== playerName) {
      recalculateMe()
    }

   // définit l'icône du joueur si ce n'est pas déjà fait
    if (data.body.player == playerName && !playerIconNumber) {
      setPlayerIcon(data.body.player_icon, playerName)
    }

    if (scrolledDown || data.body.player == playerName) {
      messageList.scrollTop = messageList.scrollHeight;
    }

    nameUsedForLastMessage = playerName
  })


  function recalculateMe() {
    for (var messageElement of messageList.getElementsByTagName('li')) {
      const playerName = playerNameInput.value
      const spanElements = messageElement.getElementsByTagName('span')
      const messagePlayer = spanElements[2].innerHTML
      const hidePlayer = messagePlayer == playerName
      spanElements[1].style.display = hidePlayer ? 'inline' : 'none'
      spanElements[2].style.display = hidePlayer ? 'none' : 'inline'
    }
  }


  function buildNewMessageElement(messageData) {
    var newMessageElement = document.createElement('li')
    addPlayerIcon(messageData, newMessageElement)
    addMessageText(messageData.player, messageData.message, newMessageElement)

    if (!messageData.player) {
      newMessageElement.classList.add('unknownPlayer')
    }

    return newMessageElement
  }

  function addPlayerIcon(messageData, newMessageElement) {
    var playerIcon = document.createElement('span')

    if (messageData.player) {
      playerIcon.style['background-image'] = 'url("../../assets/icons.jpg")'
      var iconPosition = calculateIconPosition(messageData.player_icon)
      playerIcon.style['background-position'] = `${iconPosition.x * 15}px ${iconPosition.y * 15}px`
    }

    newMessageElement.appendChild(playerIcon)
  }


  function addMessageText(playerName, message, newMessageElement) {
    var meSpan = document.createElement('span')
    var playerNameSpan = document.createElement('span')

    if (!playerName) {
      playerName = 'Inconnu'
    }

    // afficher 'Moi' à la place du nom du joueur lorsque le joueur est le même que celui qui a envoyé le message
    if (playerName == playerNameInput.value) {
      playerNameSpan.style.display = 'none'
    } else {
      meSpan.style.display = 'none'
    }

    playerNameSpan.innerHTML =  playerName
    meSpan.innerHTML = 'Moi'

    newMessageElement.appendChild(meSpan)
    newMessageElement.appendChild(playerNameSpan)
    newMessageElement.innerHTML = newMessageElement.innerHTML + ' : ' + message
  }
}
