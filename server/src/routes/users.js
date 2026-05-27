const router = require('express').Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, createdAt: true }
    })
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
