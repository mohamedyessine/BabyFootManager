function bfMenu() {
  'use strict'

  const menu = document.getElementById('menu')
  const menuList = menu.querySelector('ul')
  const gameBoard = document.getElementById('gameBoard')
  const chat = document.getElementById('chat')

  var menuOpen = false
  var selected = 'games'

  menu.addEventListener('click', function(event) {
    switch(event.target.innerHTML) {
      case 'Parties':
        toggleElements(true, false, false)
        selected = 'games'
        break
      case 'Tchat':
        toggleElements(false, true, false)
        selected = 'chat'
        break
    }

    if (menuOpen) {
      closeMenu()
      return
    }

    openMenu()
  })

  menu.addEventListener('focusout', function() {
    closeMenu() 
  })

  window.onresize = function(event) {
    if (window.innerWidth > 970) {
      toggleElements(true, true, true)
      return
    }

    switch(selected) {
      case 'games':
        toggleElements(true, false, false)
        break
      case 'chat':
        toggleElements(false, true, false)
        break

    }
  }

  function toggleElements(gameBoardOn, chatOn) {
    gameBoard.style.display = gameBoardOn ? 'flex' : 'none'
    chat.style.display = chatOn ? 'flex' : 'none'
  }

  function closeMenu() {
    menu.classList.remove('menuOn')
    menuList.style.display = 'none'
    menuOpen = false
  }

  function openMenu() {
    menu.classList.add('menuOn')
    menuList.style.display = 'block'
    menuOpen = true
  }
}