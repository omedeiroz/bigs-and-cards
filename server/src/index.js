require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { initSocket } = require('./socket')

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  process.env.FRONTEND_URL,
].filter(Boolean)
app.use(cors({ origin: allowedOrigins, exposedHeaders: ['x-refresh-token'] }))
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/friends', require('./routes/friends'))
app.use('/api/challenges', require('./routes/challenges'))

app.get('/health', (_, res) => res.json({ ok: true }))

const server = http.createServer(app)
initSocket(server)

const PORT = process.env.PORT || 3001
server.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`))
