const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password)
    return res.status(400).json({ error: 'Preencha todos os campos' })

  if (password.length < 6)
    return res.status(400).json({ error: 'Senha deve ter ao menos 6 caracteres' })

  try {
    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    })
    if (exists) {
      const field = exists.email === email ? 'Email' : 'Username'
      return res.status(400).json({ error: `${field} já está em uso` })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { username, email, password: hashed }
    })

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '3h' })
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' })
  }
})

router.post('/login', async (req, res) => {
  const { login, password } = req.body

  if (!login || !password)
    return res.status(400).json({ error: 'Preencha todos os campos' })

  try {
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: login }, { username: login }] }
    })

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Credenciais inválidas' })

    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '3h' })
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } })
  } catch {
    res.status(500).json({ error: 'Erro interno' })
  }
})

module.exports = router
