const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

//GET playes API
app.get('/', async (request, response) => {
  const getPlayerQuery = `
    SELECT * FROM cricket_team;`
  const playerArray = await db.all(getPlayerQuery)
  response.send(playerArray)
})

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT * FROM cricket_team;`
  const playerArray = await db.all(getPlayerQuery)
  response.send(
    playerArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//GET playes by ID API

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT * FROM cricket_team where player_id=${playerId};`
  const players = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(players))
})

//POST Player API

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
    INSERT INTO
    cricket_team(player_name,jersey_number,role)
    VALUES
    ('${playerName}','${jerseyNumber}','${role}');`
  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//UPDATE playes by ID API

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  console.log(playerId)
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const putPlayerQuery = `
    UPDATE cricket_team
    SET
    player_name='${playerName}',
    jersey_number='${jerseyNumber}',
    role='${role}'
    WHERE player_id=${playerId};`
  await db.run(putPlayerQuery)
  response.send('Player Details Updated')
})

//Delete Player API

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const putPlayerQuery = `
    DELETE FROM cricket_team
    WHERE player_id=${playerId};`
  await db.run(putPlayerQuery)
  response.send('Player Removed')
})
module.exports = app
