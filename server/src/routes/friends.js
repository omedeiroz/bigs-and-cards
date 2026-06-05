const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// GET /api/friends — lista amigos aceitos
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      include: {
        sender: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } }
      }
    })

    const friends = friendships.map(f => {
      const friend = f.senderId === userId ? f.receiver : f.sender
      return { ...friend, friendshipId: f.id }
    })

    res.json(friends)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// GET /api/friends/requests — pedidos pendentes recebidos
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const requests = await prisma.friendship.findMany({
      where: { receiverId: req.user.id, status: 'pending' },
      include: { sender: { select: { id: true, username: true } } }
    })
    res.json(requests)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// POST /api/friends/request — enviar pedido por username
router.post('/request', authMiddleware, async (req, res) => {
  const { username } = req.body
  const senderId = req.user.id

  if (!username) return res.status(400).json({ error: 'Informe o username' })

  try {
    const target = await prisma.user.findUnique({ where: { username } })
    if (!target) return res.status(404).json({ error: 'Usuário não encontrado' })
    if (target.id === senderId) return res.status(400).json({ error: 'Você não pode se adicionar' })

    const exists = await prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId: target.id },
          { senderId: target.id, receiverId: senderId }
        ]
      }
    })
    if (exists) return res.status(400).json({ error: 'Pedido já existe ou já são amigos' })

    const friendship = await prisma.friendship.create({
      data: { senderId, receiverId: target.id }
    })
    res.status(201).json(friendship)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// PUT /api/friends/:id/accept — aceitar pedido
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!friendship || friendship.receiverId !== req.user.id)
      return res.status(404).json({ error: 'Pedido não encontrado' })

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: 'accepted' }
    })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

// DELETE /api/friends/:id — recusar pedido ou remover amigo
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: Number(req.params.id) }
    })

    if (!friendship || (friendship.senderId !== req.user.id && friendship.receiverId !== req.user.id))
      return res.status(404).json({ error: 'Amizade não encontrada' })

    await prisma.friendship.delete({ where: { id: friendship.id } })
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
