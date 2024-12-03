const express = require('express')
const path = require('path')

const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const {format} = require('date-fns')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null
const intializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('localhost running at http://lcoalhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error '${e.message}'`)
    process.exit(1)
  }
}
intializeDbServer()

app.get('/todos/', async (request, response) => {
  const {status, priority, search_q, category} = request.query

  try {
    let query = `SELECT * FROM todo `
    let conditions = []
    let params = []
    if (status) {
      conditions.push('status=?')
      params.push(status)
    }
    if (priority) {
      conditions.push('priority=?')
      params.push(priority)
    }
    if (search_q) {
      conditions.push('todo LIKE ?')
      params.push(`%${search_q}%`)
    }
    if (category) {
      conditions.push('category=?')
      params.push(category)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }
    const dbUser = await db.all(query, params)
    response.send(dbUser)
  } catch (e) {
    response.status(500).send(`DB ERROR: '${e.message}'`)
  }
})
