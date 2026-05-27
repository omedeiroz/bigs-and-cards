import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/auth.css'

export default function Login() {
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handle(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error)
      login(data.user, data.token)
      navigate('/')
    } catch {
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">Bigs <span>&</span> Cards</h1>
        <h2>Entrar</h2>

        <form onSubmit={submit} className="auth-form">
          <label>
            <span>Email ou username</span>
            <input name="login" value={form.login} onChange={handle} required autoFocus />
          </label>
          <label>
            <span>Senha</span>
            <input name="password" type="password" value={form.password} onChange={handle} required />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          Não tem conta? <Link to="/register">Cadastrar</Link>
        </p>
      </div>
    </div>
  )
}
