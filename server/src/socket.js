const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const game = require('./game')
const { getRank, applyMatchResult } = require('./rank')
const { TYPES, generatePayload, evaluate } = require('./minigame')

const prisma = new PrismaClient()
let io = null

const userSockets = new Map()   // userId -> Set<socketId>
const userInfo = new Map()      // userId -> username
const rooms = new Map()         // roomId -> { players: [id,id], ready: Set, type }
const finalizing = new Set()
const mgState = new Map()       // roomId -> { type, payload, order, submissions, timer }

let casualQueue = []
let rankedQueue = []

function getOnlineUserIds() { return [...userSockets.keys()] }

function emitToUser(userId, event, payload) {
  const sockets = userSockets.get(userId)
  if (!sockets) return
  for (const sid of sockets) io.to(sid).emit(event, payload)
}

function broadcastPresence() {
  if (io) io.emit('presence:update', getOnlineUserIds())
}

function broadcastGame(roomId) {
  const g = game.getGame(roomId)
  if (!g) return
  for (const pid of g.order) {
    emitToUser(pid, 'game:state', game.viewFor(roomId, pid))
  }
  if (g.status === 'ended' && !finalizing.has(roomId)) {
    finalizing.add(roomId)
    finalizeMatch(roomId).finally(() => finalizing.delete(roomId))
  }
}

function createMatch(aId, bId, type = 'casual') {
  const roomId = `match_${Date.now()}_${aId}_${bId}`
  rooms.set(roomId, { players: [aId, bId], ready: new Set(), type })
  emitToUser(aId, 'match:found', { roomId, type, opponent: { id: bId, username: userInfo.get(bId) || '???' } })
  emitToUser(bId, 'match:found', { roomId, type, opponent: { id: aId, username: userInfo.get(aId) || '???' } })
  return roomId
}

function leaveAllQueues(userId) {
  casualQueue = casualQueue.filter(p => p.id !== userId)
  rankedQueue = rankedQueue.filter(p => p.id !== userId)
}

function tryEnqueueAndMatch(uid, username, type) {
  const q = type === 'ranked' ? rankedQueue : casualQueue
  if (q.some(p => p.id === uid)) return
  q.push({ id: uid, username })
  if (q.length >= 2) {
    const a = q.shift()
    const b = q.shift()
    createMatch(a.id, b.id, type)
  }
}

// ---- Minigames ----

function startMinigame(roomId, forcedType, ctx = {}) {
  const g = game.getGame(roomId)
  if (!g || g.status !== 'playing') return
  if (mgState.has(roomId)) return

  const type = forcedType || TYPES[Math.floor(Math.random() * TYPES.length)]
  const payload = generatePayload(type)

  // Par ou ímpar: o servidor sorteia quem é "par" e quem é "ímpar"
  if (type === 'par_impar') {
    const aIsPar = Math.random() < 0.5
    payload.parityA = aIsPar ? 'par' : 'impar'
    payload.parityB = aIsPar ? 'impar' : 'par'
  }

  const state = {
    type, payload,
    order: g.order.slice(),
    submissions: {},
    ctx,
    ready: new Set(),
    launched: false,
    readyTimer: null,
    timer: null,
  }
  mgState.set(roomId, state)

  for (const pid of g.order) {
    emitToUser(pid, 'minigame:pending', { type, round: g.round })
  }

  // auto-inicia se ambos não confirmarem em 12s
  state.readyTimer = setTimeout(() => launchMinigame(roomId), 12000)
}

function launchMinigame(roomId) {
  const state = mgState.get(roomId)
  if (!state || state.launched) return
  clearTimeout(state.readyTimer)
  state.launched = true

  const g = game.getGame(roomId)
  if (!g) return

  for (const pid of state.order) {
    let payload = state.payload
    if (state.type === 'par_impar') {
      const yourParity = pid === state.order[0] ? state.payload.parityA : state.payload.parityB
      payload = { ...state.payload, yourParity }
    }
    emitToUser(pid, 'minigame:start', { type: state.type, payload, round: g.round })
  }

  state.timer = setTimeout(() => resolveMinigame(roomId), state.payload.durationMs + 4000)
}

function resolveMinigame(roomId) {
  const state = mgState.get(roomId)
  if (!state) return
  clearTimeout(state.timer)
  mgState.delete(roomId)

  const g = game.getGame(roomId)
  if (!g) return

  const [aId, bId] = state.order
  const valA = state.submissions[aId] || null
  const valB = state.submissions[bId] || null

  const side = evaluate(state.type, state.payload, valA, valB)
  const winnerId = side === 'a' ? aId : side === 'b' ? bId : null
  const loserId = winnerId ? state.order.find(id => id !== winnerId) : null

  const dmg = game.minigameDamage(g.round)
  if (loserId) game.applyMinigameDamage(roomId, loserId, dmg)

  // Contabiliza vitória de minigame no jogador vencedor
  if (winnerId) {
    const freshGame = game.getGame(roomId)
    if (freshGame?.players[winnerId]?.stats) freshGame.players[winnerId].stats.minigamesWon++
  }

  // Pepão passive bonus: se o dono do Pepão venceu o minigame, +1 dano extra
  const pepaoOwnerId = state.ctx?.pepaoOwnerId
  let pepaoBonus = false
  if (pepaoOwnerId && winnerId === pepaoOwnerId) {
    const bonusTarget = state.order.find(id => id !== pepaoOwnerId)
    if (bonusTarget) {
      game.applyMinigameDamage(roomId, bonusTarget, 1)
      pepaoBonus = true
    }
  }

  // Pepão special: se dono do Pepão venceu → adversário não pode jogar cartas nesse turno
  if (state.ctx?.pepaoSpecial && winnerId === state.ctx.pepaoOwnerId) {
    const pepaoOpp = state.order.find(id => id !== winnerId)
    const freshGame = game.getGame(roomId)
    if (freshGame && pepaoOpp && freshGame.players[pepaoOpp]) {
      freshGame.players[pepaoOpp].skipNextCardPlay = true
    }
  }

  // Elixir rewards: vencedor +2, empate +1 cada
  if (winnerId) {
    game.grantElixir(roomId, winnerId, 2)
  } else {
    for (const pid of state.order) game.grantElixir(roomId, pid, 1)
  }

  const baseDamage = loserId ? dmg : 0
  const resultPayload = {
    type: state.type,
    winner: winnerId,
    loser: loserId,
    draw: !winnerId,
    damage: baseDamage + (pepaoBonus ? 1 : 0),
    pepaoBonus,
    values: { [aId]: valA, [bId]: valB },
    elixirGrant: winnerId ? 2 : 1,
  }
  for (const pid of g.order) {
    emitToUser(pid, 'minigame:result', resultPayload)
  }

  broadcastGame(roomId)
}

// ---- Finalizar partida e salvar histórico ----

async function finalizeMatch(roomId) {
  const g = game.getGame(roomId)
  if (!g || g.status !== 'ended') return

  const room = rooms.get(roomId)
  const isRanked = room?.type === 'ranked'
  const winnerId = g.winner
  const loserId = g.order.find(id => id !== winnerId)

  try {
    // Salvar Match no banco
    await prisma.match.create({
      data: {
        playerAId: g.order[0],
        playerBId: g.order[1],
        winnerId: winnerId ?? null,
        matchType: room?.type || 'casual',
        rounds: g.round,
      }
    })

    for (const [uid, isWin] of [[winnerId, true], [loserId, false]]) {
      if (!uid) continue
      const u = await prisma.user.findUnique({
        where: { id: uid },
        select: { matchesPlayed: true, wins: true, losses: true, rankPoints: true, rankedUnlocked: true }
      })
      if (!u) continue

      const newPlayed = u.matchesPlayed + 1
      const update = {
        matchesPlayed: newPlayed,
        wins:   isWin ? u.wins + 1 : u.wins,
        losses: isWin ? u.losses   : u.losses + 1,
        rankedUnlocked: u.rankedUnlocked || newPlayed >= 2,
      }

      if (isRanked) {
        const { newPts, delta } = applyMatchResult(u.rankPoints, isWin)
        update.rankPoints = newPts
        emitToUser(uid, 'rank:update', { delta, newPts, isWin, rank: getRank(newPts) })
      }

      await prisma.user.update({ where: { id: uid }, data: update })

      if (!u.rankedUnlocked && newPlayed >= 2) {
        emitToUser(uid, 'ranked:unlocked', {})
      }
    }
  } catch (e) {
    console.error('finalizeMatch error:', e)
  }

  game.removeGame(roomId)
  rooms.delete(roomId)
  mgState.delete(roomId)
}

function addUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) userSockets.set(userId, new Set())
  userSockets.get(userId).add(socketId)
}

function removeUserSocket(userId, socketId) {
  const set = userSockets.get(userId)
  if (!set) return
  set.delete(socketId)
  if (set.size === 0) userSockets.delete(userId)
}

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        process.env.FRONTEND_URL,
      ].filter(Boolean),
    }
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Token não fornecido'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = payload.id
      socket.username = payload.username
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    addUserSocket(socket.userId, socket.id)
    userInfo.set(socket.userId, socket.username)
    broadcastPresence()
    socket.emit('presence:update', getOnlineUserIds())

    socket.on('queue:join', ({ type } = {}) => {
      const qtype = type === 'ranked' ? 'ranked' : 'casual'
      if (qtype === 'ranked') {
        prisma.user.findUnique({ where: { id: socket.userId }, select: { rankedUnlocked: true } })
          .then(u => {
            if (!u?.rankedUnlocked) {
              socket.emit('queue:error', 'Jogue 2 partidas casuais primeiro para desbloquear o ranked.')
              return
            }
            tryEnqueueAndMatch(socket.userId, socket.username, 'ranked')
          })
          .catch(() => socket.emit('queue:error', 'Erro ao verificar ranked'))
      } else {
        tryEnqueueAndMatch(socket.userId, socket.username, 'casual')
      }
    })

    socket.on('queue:leave', () => leaveAllQueues(socket.userId))

    socket.on('lobby:join', (roomId) => {
      if (rooms.has(roomId)) socket.join(roomId)
    })

    socket.on('lobby:ready', (roomId) => {
      const room = rooms.get(roomId)
      if (!room || !room.players.includes(socket.userId)) return
      room.ready.add(socket.userId)
      io.to(roomId).emit('lobby:state', { players: room.players, ready: [...room.ready] })
      if (room.ready.size >= room.players.length) {
        const [aId, bId] = room.players
        if (!game.getGame(roomId)) {
          game.createGame(
            roomId,
            { id: aId, username: userInfo.get(aId) || '???' },
            { id: bId, username: userInfo.get(bId) || '???' }
          )
        }
        io.to(roomId).emit('match:start', { roomId })
      }
    })

    socket.on('lobby:leave', (roomId) => {
      const room = rooms.get(roomId)
      socket.leave(roomId)
      if (room) {
        socket.to(roomId).emit('lobby:opponentLeft')
        rooms.delete(roomId)
      }
    })

    // ---- Partida ----
    socket.on('game:join', (roomId) => {
      const g = game.getGame(roomId)
      if (!g || !g.order.includes(socket.userId)) return
      socket.join(roomId)
      socket.emit('game:state', game.viewFor(roomId, socket.userId))
    })

    socket.on('game:playCard', ({ roomId, handIndex }) => {
      const res = game.playCard(roomId, socket.userId, handIndex)
      if (res.error) return socket.emit('game:error', res.error)
      if (res.tauntCombat) io.to(roomId).emit('game:event', res.tauntCombat)
      broadcastGame(roomId)
      const ctx = game.consumeMinigameTrigger(roomId)
      if (ctx) startMinigame(roomId, null, ctx)
    })

    socket.on('game:endTurn', (roomId) => {
      const res = game.endTurn(roomId, socket.userId)
      if (res.error) return socket.emit('game:error', res.error)
      broadcastGame(roomId)
      if (res.triggerMinigame) startMinigame(roomId)
    })

    socket.on('game:attack', ({ roomId, attackerUid, target }) => {
      const res = game.attack(roomId, socket.userId, attackerUid, target)
      if (res.error) return socket.emit('game:error', res.error)
      if (res.event) io.to(roomId).emit('game:event', res.event)
      broadcastGame(roomId)
      const ctx = game.consumeMinigameTrigger(roomId)
      if (ctx) startMinigame(roomId, null, ctx)
    })

    socket.on('game:special', ({ roomId, sourceUid, target }) => {
      const res = game.activateSpecial(roomId, socket.userId, sourceUid, target)
      if (res.error) return socket.emit('game:error', res.error)
      if (res.event) io.to(roomId).emit('game:event', res.event)
      broadcastGame(roomId)
      const ctx = game.consumeMinigameTrigger(roomId)
      if (ctx) startMinigame(roomId, null, ctx)
    })

    socket.on('game:surrender', (roomId) => {
      const res = game.surrender(roomId, socket.userId)
      if (res.error) return socket.emit('game:error', res.error)
      broadcastGame(roomId)
    })

    // ---- Minigames ----
    socket.on('minigame:submit', ({ roomId, value }) => {
      const state = mgState.get(roomId)
      if (!state) return
      const uid = socket.userId
      if (!state.order.includes(uid)) return
      state.submissions[uid] = value

      // Quando ambos submeteram, resolve imediatamente
      if (Object.keys(state.submissions).length >= 2) {
        resolveMinigame(roomId)
      }
    })

    socket.on('minigame:ready', (roomId) => {
      const state = mgState.get(roomId)
      if (!state || state.launched) return
      if (!state.order.includes(socket.userId)) return
      state.ready.add(socket.userId)

      for (const pid of state.order) {
        emitToUser(pid, 'minigame:readyState', { ready: state.ready.size, total: state.order.length })
      }

      if (state.ready.size >= state.order.length) launchMinigame(roomId)
    })

    socket.on('disconnect', () => {
      removeUserSocket(socket.userId, socket.id)
      leaveAllQueues(socket.userId)
      broadcastPresence()
    })
  })

  return io
}

module.exports = { initSocket, emitToUser, createMatch, getOnlineUserIds }
