function bfAdd() {
  'use strict'

// récupère les éléments
  const newGame = document.getElementById('newGame')
  const playerInputs = newGame.getElementsByTagName('input')
  const player1Input  = playerInputs[0]
  const player2Input  = playerInputs[1]
  const addGameButton  = newGame.querySelector('button')



  createPlayerSearch(player1Input)
  createPlayerSearch(player2Input)

  

  // ajoute le jeu sur le formulaire soumettre
  addGameButton.addEventListener('click', function(event) {
    if (!player1Input.value || !player2Input.value) {
      return
    }

    bfWebSocketService.sendMessage('addGame', { player1: player1Input.value, player2: player2Input.value }, event)
  })
  
}
