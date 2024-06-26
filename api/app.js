'use strict'
const db = require('./services/database.js')
const http_server = require('./services/http_server.js')
const client_config = require('./services/client_config.js')
const cache_buster = require('./services/cache_buster.js')
const websocket_server = require('./services/websocket_server.js')
const config = require('./config.js')

async function init() {
  console.log(`starting in the ${config.ENV} environment`)
  await client_config.create()
  await cache_buster.updateIndexHtml()
  await db.initDb(config)
  await http_server.startServer()
  await http_server.startAPI(db)
  await websocket_server.startServer(db)
}

init()
