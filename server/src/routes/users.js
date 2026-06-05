const router = require('express').Router()
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
    const players = await prisma.user.findMany({
      where: { rankedUnlocked: true },
      select: { id: true, username: true, rankPoints: true, wins: true, losses: true },
      orderBy: { rankPoints: 'desc' },
      take: 50
    })
    res.json(players.map((p, i) => ({ ...p, position: i + 1, rank: getRank(p.rankPoints) })))
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
