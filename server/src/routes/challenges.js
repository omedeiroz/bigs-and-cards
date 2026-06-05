const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')
const { createMatch, emitToUser } = require('../socket')

const prisma = new PrismaClient()

async function areFriends(a, b) {
  const f = await prisma.friendship.findFirst({
    where: {
      status: 'accepted',
      OR: [
        { senderId: a, receiverId: b },
        { senderId: b, receiverId: a }
      ]
    }
  })
  return !!f
}

// GET /api/challenges/received — desafios pendentes recebidos
router.get('/received', authMiddleware, async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { opponentId: req.user.id, status: 'pending' },
      include: { challenger: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(challenges)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/challenges/sent — desafios pendentes enviados
router.get('/sent', authMiddleware, async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { challengerId: req.user.id, status: 'pending' },
      include: { opponent: { select: { id: true, username: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(challenges)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/challenges — desafiar um amigo
router.post('/', authMiddleware, async (req, res) => {
  const challengerId = req.user.id
  const opponentId = Number(req.body.opponentId)

  if (!opponentId) return res.status(400).json({ error: 'Informe o oponente' })
  if (opponentId === challengerId) return res.status(400).json({ error: 'Você não pode se desafiar' })

  try {
    if (!(await areFriends(challengerId, opponentId)))
      return res.status(403).json({ error: 'Você só pode desafiar amigos' })

    const exists = await prisma.challenge.findFirst({
      where: {
        status: 'pending',
        OR: [
          { challengerId, opponentId },
          { challengerId: opponentId, opponentId: challengerId }
        ]
      }
    })
    if (exists) return res.status(400).json({ error: 'Já existe um desafio pendente com esse jogador' })

    const challenge = await prisma.challenge.create({
      data: { challengerId, opponentId }
    })
    emitToUser(opponentId, 'challenge:received', { from: req.user.username })
    res.status(201).json(challenge)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/challenges/:id/accept — aceitar (apenas oponente)
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const challenge = await prisma.challenge.findUnique({ where: { id: Number(req.params.id) } })
    if (!challenge || challenge.opponentId !== req.user.id || challenge.status !== 'pending')
      return res.status(404).json({ error: 'Desafio não encontrado' })

    const updated = await prisma.challenge.update({
      where: { id: challenge.id },
      data: { status: 'accepted' }
    })
    createMatch(challenge.challengerId, challenge.opponentId)
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/challenges/:id/decline — recusar (apenas oponente)
router.put('/:id/decline', authMiddleware, async (req, res) => {
  try {
    const challenge = await prisma.challenge.findUnique({ where: { id: Number(req.params.id) } })
    if (!challenge || challenge.opponentId !== req.user.id || challenge.status !== 'pending')
      return res.status(404).json({ error: 'Desafio não encontrado' })

    const updated = await prisma.challenge.update({
      where: { id: challenge.id },
      data: { status: 'declined' }
    })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/challenges/:id — cancelar (apenas quem desafiou)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const challenge = await prisma.challenge.findUnique({ where: { id: Number(req.params.id) } })
    if (!challenge || challenge.challengerId !== req.user.id)
      return res.status(404).json({ error: 'Desafio não encontrado' })

    await prisma.challenge.delete({ where: { id: challenge.id } })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
