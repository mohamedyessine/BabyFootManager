'use strict'
const { Pool } = require('pg')
const schema = require('./schema')

let _pool

async function initDb(config) {
  _pool = new Pool({
    user: config.PGUSER,
    host: config.PGHOST,
    database: config.PGDATABASE,
    password: config.PGPASSWORD,
    port: config.PGPORT
  })

  // crée des tables, des séquences et des index s'ils n'existent pas déjà
  const client = await _pool.connect()
  
  try {
    await client.query('BEGIN')

    for (let s of schema) {
      if (s.sequences) {
        for (let seq of s.sequences) {
          await client.query(`CREATE SEQUENCE IF NOT EXISTS ${seq}`)
        }
      }

      await client.query(`CREATE TABLE IF NOT EXISTS ${s.table}(${s.columns.join(", ")})`)

      if (s.indexes) {
        for (let i of s.indexes) {
          await client.query(`CREATE INDEX IF NOT EXISTS idx_${i.split(', ').join('_')} ON ${s.table}(${i})`)
        }
      }
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    console.error(error.stack)
    throw error
  } finally {
    await client.release()
  }
}

async function _getGame(client, gameId) {
  return await client.query(`
    SELECT g.id, g.active, p.name as player1, p2.name as player2, g.created_at, g.updated_at
    FROM games g
    INNER JOIN players p ON g.player1 = p.id
    INNER JOIN players p2 ON g.player2 = p2.id
    WHERE g.id = $1
  `, [ gameId ])
}

async function getGames() {
  const client = await _pool.connect() 

  try {
    // récupère d'abord les jeux actifs par ordre croissant (le plus ancien en premier)
    const activeGames = await client.query(`
      SELECT g.id, g.active, p.name AS player1, p2.name AS player2, g.created_at, g.updated_at
      FROM games g
      INNER JOIN players p ON g.player1 = p.id
      INNER JOIN players p2 ON g.player2 = p2.id
      WHERE g.active = true
      ORDER BY g.updated_at ASC
    `)

    // puis récupère les jeux terminés par ordre décroissant (le plus récent en premier)
    const finishedGames = await client.query(`
      SELECT g.id, g.active, p.name AS player1, p2.name AS player2, g.created_at, g.updated_at
      FROM games g
      INNER JOIN players p ON g.player1 = p.id
      INNER JOIN players p2 ON g.player2 = p2.id
      WHERE g.active = false
      ORDER BY g.updated_at DESC
    `)

    return { result: activeGames.rows.concat(finishedGames.rows) }
  } catch (error) {
    return { result: null, error: error.stack }
  } finally {
    await client.release()
  }
}

async function addGame(data) {
  const client = await _pool.connect() 
  const player1id = await createPlayer(data.player1, client)
  const player2id = await createPlayer(data.player2, client)

  try {
    const newGameID = await client.query(`
      INSERT INTO games (
        id, active, player1, player2, created_at, updated_at
      ) VALUES (
        nextval('games_id_seq'),
        true,
        $1,
        $2,
        current_timestamp,
        current_timestamp
      )
      RETURNING id
    `, [ player1id, player2id])

    const result = await _getGame(client, newGameID.rows[0].id)
    return { result: result.rows[0] }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function finishGame(data) {
  const client = await _pool.connect() 

  try {
    const updatedGame = await client.query(`
      UPDATE games SET active = false, updated_at = current_timestamp
      WHERE games.id = $1
      RETURNING id
    `, [data.id ])

    const result = await _getGame(client, updatedGame.rows[0].id)

    return { result: result.rows[0] }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function deleteGame(data) {
  const client = await _pool.connect() 

  try {
    const gameToDelete = await _getGame(client, data.id)

    await client.query(`DELETE FROM games WHERE id = $1`, [ data.id ])

    return { result: gameToDelete.rows[0] }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function newMessage(data) {
  const client = await _pool.connect() 
  const playerId = await createPlayer(data.player, client)

  try {
    const newMessageID = await client.query(`
    INSERT INTO chat (
      id, message, player, created_at
    ) VALUES (
      nextval('chat_id_seq'), $1, $2, current_timestamp
    )
    RETURNING id`, [ data.message, playerId ])

    const result = await getMessages(newMessageID.rows[0].id)
    return { result: result.result[0], error: result.error }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}

async function getMessages(messageId) {
  const client = await _pool.connect() 

  try {
    let whereClause = ''
    const params = []

    if (messageId) {
      whereClause = `WHERE c.id = $1`
      params.push(messageId)
    }

    let query = `
      SELECT c.id, c.message, p.name as player, p.icon as player_icon, c.created_at
      FROM chat c
      INNER JOIN players p ON c.player = p.id
      ${whereClause}
      ORDER BY c.created_at DESC LIMIT 10
    `

    const result = await client.query(query, params)
    return { result: result.rows, error: null }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}


async function createPlayer(player, client) {
  const existing = await client.query(`SELECT id, name, icon FROM players WHERE name = $1`, [ player ])

  if (!existing.rows.length) {
    const newPlayer = await client.query(`
      INSERT INTO players (id, name, icon) VALUES (nextval('players_id_seq'), $1, nextval('players_icon_seq')) RETURNING id
    `, [ player ])
    return newPlayer.rows[0].id
  }

  return existing.rows[0].id
}

function endPool() {
  _pool.end()
}


async function searchPlayers(playerName) {
  const client = await _pool.connect() 

  try {
    let result

    if (!playerName) {
      result = await client.query(`SELECT id, name, icon FROM players`)
    } else {
      result = await client.query(`SELECT id, name, icon FROM players WHERE name ILIKE $1`, [ '%' + playerName + '%' ])
    }

    return { result: result.rows }
  } catch (error) {
    return { result: null, error: error.stack}
  } finally {
    await client.release()
  }
}



module.exports = {
  initDb: initDb,
  getGames: getGames,
  addGame: addGame,
  finishGame: finishGame,
  deleteGame: deleteGame,
  endPool: endPool,
  searchPlayers: searchPlayers,
  newMessage: newMessage,
  getMessages: getMessages,
}