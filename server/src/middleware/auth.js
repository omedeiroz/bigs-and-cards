const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    // Sessão deslizante: renova o prazo de 3h a cada requisição autenticada
    const fresh = jwt.sign(
      { id: payload.id, username: payload.username },
      process.env.JWT_SECRET,
      { expiresIn: '3h' }
    )
    res.set('x-refresh-token', fresh)
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
}

module.exports = authMiddleware
