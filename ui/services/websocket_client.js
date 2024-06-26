'use strict'

const BfWebSocketService = function() {
  var socket = null
  var eventListenerCallbacks = []
  var reconnectTimeout = 1
  var connectionStatus = 'closed'

  this.connect = function(){
    const self = this 

    return new Promise(function(resolve, reject) {
      socket = new WebSocket('ws://' + BF_CLIENT_CONFIG.SERVER_IP + ':' + BF_CLIENT_CONFIG.WEBSOCKET_PORT)

      socket.onopen = function(event) {
        connectionStatus = 'open'
        bfErrorService.logToConsole('log', 'A WebSocket connection has been opened.')

        eventListenerCallbacks.forEach(e => {
          if (e.type == 'open') {
            e.callback()
            return
          }

          socket.addEventListener(e.type, e.callback)
        })

        resolve()
      }

      socket.onmessage = function(event) {
        const data = JSON.parse(event.data)

        if (data.type === 'error') {
          bfErrorService.displayErrorMessage('The server has sent the following error: ', event)
        }
      }

      socket.onerror = function(event) {
        if (connectionStatus == 'open') {
          bfErrorService.displayErrorMessage('A WebSocket error has occured, closing connection.', event)
        }

        connectionStatus = 'closed'
        socket.close()
      }

      socket.onclose = function(event) {
        bfErrorService.logToConsole('warning', 'Socket is closed. Reconnect will be attempted in ' + reconnectTimeout + ' second.');

        setTimeout(function() {
        
          if (reconnectTimeout < 300) {
            reconnectTimeout++
          }

          self.connect();
        }, reconnectTimeout * 1000);
      }
    })
  }

  this.addEventListener = function(type, callback) {
    socket.addEventListener(type, callback)
    eventListenerCallbacks.push({ type: type, callback: callback })
  }


  this.sendMessage = function(type, body, event) {
    // si la connexion est hors ligne, affiche un message d'erreur, empêche l'action de l'utilisateur et tente de rétablir une connexion
    if (socket.readyState == 3) {
      if (event) {
        event.preventDefault()
      }

      bfErrorService.displayErrorMessage('Cannot establish contact with WebSocket server')
      return false
    }

    socket.send(
      JSON.stringify({
        type: type,
        body: body
      })
    )

    return true
  }
}

const bfWebSocketService = new BfWebSocketService()