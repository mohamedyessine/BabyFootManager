
'use strict'
const fs = require('fs')
const path = require('path')
const { EXTERNAL_IP, WEBSOCKET_PORT, HTTP_PORT, ENV } = require('../config.js')

async function create() {
  const contents = `
// This file is built by api/services/client_config.js. 
const BF_CLIENT_CONFIG = {
  SERVER_IP : '${ EXTERNAL_IP }',
  WEBSOCKET_PORT : ${ WEBSOCKET_PORT },
  HTTP_PORT : ${ HTTP_PORT },
  ENV: '${ ENV }'
}
  `

  await fs.writeFile(path.join(__dirname, '../../ui/config.js'), contents, err => {
    if (err) {
      throw(err)
    }
  })
}

module.exports = {
  create: create
}