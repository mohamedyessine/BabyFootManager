function createPlayerSearch(input, options = {}){
  var dropDownElement = createDropDownElement(input, options.search_icon)
 // enregistre le dernier keyCode à enregistrer
  var lastKeyCode

  input.addEventListener('keydown', function(event) {
    lastKeyCode = event.keyCode
  })

  // recherche les noms des joueurs sur keyup
  input.addEventListener('keyup', function(event) {
    // focus au premier élément de la liste déroulante en appuyant sur la flèche vers le bas
    if (event.keyCode == 40) {
      input.value = input.value.trim()
      browseToDropDown(dropDownElement)
      return
    }

    // enter
    if (event.keyCode == 13 && options.on_enter) {
      options.on_enter()
    }

   // n'affiche pas la liste déroulante lors de la saisie ou de la tabulation
    if (event.keyCode == 13 || event.keyCode == 9) {
      dropDownElement.style.display = 'none'
      return 
    }

    // masque la liste déroulante lors de l'échappement ou lorsque l'entrée est vide
    if (event.keyCode == 27 || !input.value ) {
      dropDownElement.style.display = 'none'
      return
    }

    searchWithDebounce(input, 250).then(function(players) {
      if (options.on_search) {
        options.on_search(players)
      }
   
      if ([ 13, 9, 27 ].includes(lastKeyCode) || !input.value) {
        return
      }

      if (players.length === 1 && players[0].name === input.value) {
        dropDownElement.style.display = 'none'
        return
      }

      addPlayersToList(players, dropDownElement)
    })
  })

  input.addEventListener('blur', function(event){
    if (event.relatedTarget && event.relatedTarget.tabIndex) {
      return
    }

    dropDownElement.style.display = 'none'
    input.value = input.value.trim()
  })

  dropDownElement.addEventListener('focusout', function(){
    if (event.relatedTarget && (event.relatedTarget == input || event.relatedTarget.tabIndex)) {
      return
    }

    dropDownElement.style.display = 'none'
  })

  dropDownElement.addEventListener('keyup', function(event) {
    const activeElement = document.activeElement

    if (event.keyCode == 40) {
      browseDown(dropDownElement, activeElement, 'down')
      return
    }

    if (event.keyCode == 38) {
      browseUp(dropDownElement, activeElement, 'up')
      return
    }

    // enter ou space event
    if (event.keyCode == 30 || event.keyCode == 13) {
      selectPlayer(activeElement)
    }
  })

  dropDownElement.addEventListener('click', function() {
    selectPlayer()
  })

  function selectPlayer(activeElement = null) {
    if (!activeElement) {
      activeElement = document.activeElement
    }

    var playerName = activeElement.innerHTML
    input.value = playerName
    input.focus()
    dropDownElement.style.display = 'none'

    if (options.on_select) {
      options.on_select(activeElement.icon, playerName)
    }
  }

  function createDropDownElement(input, search_icon) {
    const dropDownElement = document.createElement('ul')
    const parentElement = input.parentElement
    parentElement.appendChild(dropDownElement)

    if (search_icon) {
      parentElement.classList.add('search_icon')
    }

    return dropDownElement
  }


  function addPlayersToList(players, dropDownElement) {
    dropDownElement.style.display = players.length ? 'block' : 'none'
    // init
    dropDownElement.innerHTML = ''

    players.forEach(function(player, index) {
      var playerElement = document.createElement('li')
      playerElement.innerHTML = player.name
      playerElement.tabIndex = index + 1
      playerElement.icon = player.icon
      dropDownElement.appendChild(playerElement)
    })
  }

  function searchWithDebounce (input, interval) {
    var self = this
    this.timeout

    return new Promise(function(resolve, reject) {
      var later = function() {
        self.timeout = null
        resolve(search(input.value))
      }

      clearTimeout(self.timeout)
      self.timeout = setTimeout(later, interval)
    })
  }


  function search(playerName) {
    playerName = playerName.trim()

    var path = 'playerSearch'

    // si un espace est saisi dans la barre de recherche, obtient une liste de tous les joueurs
    if (playerName) {
      path = path + '?name=' + playerName
    }

    return bfHttpService.get(path)
  }

  function browseToDropDown(dropDownElement) {
    const listItems = dropDownElement.getElementsByTagName('li')

    if (!listItems.length) {
      return
    }

    listItems[0].focus()
  }

  function browseDown(dropDownElement, activeElement) {
    const listItems = dropDownElement.getElementsByTagName('li')
    const listItemsCount = listItems.length
    const tabIndex = activeElement.tabIndex

    if (!listItems.length) {
      return
    }

   
    if (tabIndex == listItemsCount) {
      listItems[0].focus()
      return
    }

    listItems[tabIndex].focus()
  }

  function browseUp(dropDownElement, activeElement) {
    const listItems = dropDownElement.getElementsByTagName('li')
    const listItemsCount = listItems.length
    const tabIndex = activeElement.tabIndex

    if (!listItems.length) {
      return
    }

    if (tabIndex == 1) {
      listItems[listItemsCount - 1].focus()
      return
    }

    listItems[tabIndex - 2].focus()
  }
}
