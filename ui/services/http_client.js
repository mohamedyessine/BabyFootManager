'use strict'

const BfHttpService = function() {
  const API = 'http://' + BF_CLIENT_CONFIG.SERVER_IP + ':' + BF_CLIENT_CONFIG.HTTP_PORT + '/api/'

  
  this.get = function(path, params) {
    return new Promise(function(resolve, reject) {
      var xhr= new XMLHttpRequest()
      xhr.open('GET', API + path, true)
      
      xhr.onload = function() {
        if(xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          bfErrorService.displayErrorMessage(JSON.parse(xhr.responseText))
          reject(xhr.status)
        }
      } 

      xhr.send();
    })
  }
}

const bfHttpService = new BfHttpService()