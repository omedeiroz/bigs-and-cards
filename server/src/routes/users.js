const router = require('express').Router()
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')
const { getRank } = require('../rank')

const prisma = new PrismaClient()

const VALID_CARDS = ['gbzin','pepao','hadez','davi','bigs','ian','eric','pirula','gustavo','rena']

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, username: true, email: true, createdAt: true,
        matchesPlayed: true, wins: true, losses: true,
        rankPoints: true, rankedUnlocked: true, mainCardId: true,
      }
    })
    res.json({ ...user, rank: getRank(user.rankPoints) })
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.put('/me', authMiddleware, async (req, res) => {
  const { mainCardId } = req.body
  if (mainCardId !== undefined && mainCardId !== null && !VALID_CARDS.includes(mainCardId)) {
    return res.status(400).json({ error: 'Carta inválida' })
  }
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { mainCardId: mainCardId ?? null },
      select: { id: true, mainCardId: true }
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.put('/me/username', authMiddleware, async (req, res) => {
  const name = (req.body.username || '').trim()
  if (name.length < 3 || name.length > 20)
    return res.status(400).json({ error: 'O nick precisa ter entre 3 e 20 caracteres' })
  if (!/^[a-zA-Z0-9_]+$/.test(name))
    return res.status(400).json({ error: 'Use apenas letras, números e _' })
  try {
    const taken = await prisma.user.findFirst({
      where: { username: { equals: name, mode: 'insensitive' }, NOT: { id: req.user.id } },
      select: { id: true }
    })
    if (taken) return res.status(409).json({ error: 'Esse nick já está em uso' })

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { username: name },
      select: { id: true, username: true, email: true }
    })
    // Reemite o token porque o username vive dentro dele
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    )
    res.json({ user, token })
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/search', authMiddleware, async (req, res) => {
  const { q } = req.query
  if (!q || q.length < 2) return res.json([])
  try {
    const users = await prisma.user.findMany({
      where: { username: { contains: q, mode: 'insensitive' }, NOT: { id: req.user.id } },
      select: { id: true, username: true },
      take: 8
    })
    res.json(users)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/matches', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id
    const matches = await prisma.match.findMany({
      where: { OR: [{ playerAId: uid }, { playerBId: uid }] },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        playerA: { select: { id: true, username: true } },
        playerB: { select: { id: true, username: true } },
      }
    })
    const result = matches.map(m => {
      const opponent = m.playerAId === uid ? m.playerB : m.playerA
      return {
        id: m.id,
        opponent,
        won: m.winnerId === uid,
        draw: m.winnerId === null,
        matchType: m.matchType,
        rounds: m.rounds,
        createdAt: m.createdAt,
      }
    })
    res.json(result)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    // Todos os jogadores aparecem — mesmo quem ainda não desbloqueou ranqueada
    const players = await prisma.user.findMany({
      select: { id: true, username: true, rankPoints: true },
      orderBy: { rankPoints: 'desc' },
      take: 100
    })

    // V/D contam SÓ partidas ranqueadas (apuradas a partir da tabela Match)
    const rankedMatches = await prisma.match.findMany({
      where: { matchType: 'ranked' },
      select: { playerAId: true, playerBId: true, winnerId: true }
    })
    const tally = {}
    const bump = (uid, key) => {
      if (uid == null) return
      if (!tally[uid]) tally[uid] = { wins: 0, losses: 0 }
      tally[uid][key]++
    }
    for (const m of rankedMatches) {
      if (m.winnerId == null) continue
      const loserId = m.playerAId === m.winnerId ? m.playerBId : m.playerAId
      bump(m.winnerId, 'wins')
      bump(loserId, 'losses')
    }

    res.json(players.map((p, i) => ({
      ...p,
      wins: tally[p.id]?.wins ?? 0,
      losses: tally[p.id]?.losses ?? 0,
      position: i + 1,
      rank: getRank(p.rankPoints),
    })))
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
