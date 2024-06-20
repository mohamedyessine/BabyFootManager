'use strict'
const express = require('express')
const cors = require('cors')
const http_server = express()
const path = require('path')
const { HTTP_PORT } = require('../config.js')

async function startServer() {
  await http_server.use(express.static(path.join(__dirname, '../../ui')))
  await http_server.use(cors())
  await http_server.listen(HTTP_PORT, () => console.log(`app listening on port ${HTTP_PORT}!`))
}

async function runQuery(db, res, queryType, args = []) {
  const { result, error } = await db[queryType](...args)

  if (error) {
    res.status(500)
    console.error(error)
    return res.json({ error: error })
  }

  return res.send(result)

}

async function startAPI(db) {
  await http_server.get('/api/games', async (req, res) => {
    return runQuery(db, res, 'getGames')
  })

  await http_server.get('/api/playerSearch', async (req, res) => {
    return runQuery(db, res, 'searchPlayers', [ req.query.name ])
  })

  await http_server.get('/api/messages', async (req, res) => {
    return runQuery(db, res, 'getMessages')
  })

}

module.exports = { 
  startServer: startServer,
  startAPI: startAPI
}