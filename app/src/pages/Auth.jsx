import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.target)
    const body = mode === 'login'
      ? { login: fd.get('login'), password: fd.get('password') }
      : { username: fd.get('username'), email: fd.get('email'), password: fd.get('password') }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao autenticar')
      login(data.user, data.token)
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
      {/* LEFT */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1108 0%, #0a0908 60%)',
        position: 'relative', overflow: 'hidden',
        padding: 48,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* subtle bg glyph */}
        <div style={{ position: 'absolute', right: -60, bottom: -60, fontFamily: 'var(--font-display)', fontSize: 500, color: 'rgba(255,201,60,0.04)', lineHeight: 0.8, letterSpacing: '-0.05em', pointerEvents: 'none' }}>B</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--gold)', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-on-gold)',
            transform: 'rotate(-6deg)',
            boxShadow: '0 8px 20px var(--gold-glow)',
          }}>B</div>
          <div>
            <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>BIGS & CARDS</div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-3)', marginTop: 2 }}>v0.1 · BETA FECHADO</div>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>► O JOGO DA GALERA</div>
          <h1 className="display" style={{ fontSize: 84, color: 'var(--ink-1)', marginTop: 14, lineHeight: 0.92 }}>
            VAI ENCARAR<br />A PARADA?
          </h1>
          <p style={{ marginTop: 18, fontSize: 17, color: 'var(--ink-2)', maxWidth: 480, lineHeight: 1.55 }}>
            10 cartas. 20 de HP. Elixir pra queimar. Você e a galera no tabuleiro — só que agora é todo mundo contra todo mundo.
          </p>

          <div style={{ display: 'flex', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
            {['10 CARTAS', '20 DE HP', 'ELIXIR', 'MINIGAMES'].map(tag => (
              <span key={tag} className="pill pill-ghost">{tag}</span>
            ))}
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>
          ◇ PRIVATE LOBBY · CONVITE ONLY · FRIENDS LIST CURATED ◇
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--line-2)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }} style={{
                flex: 1, padding: '14px 0',
                fontFamily: 'var(--font-mono)',
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
                color: mode === m ? 'var(--gold)' : 'var(--ink-3)',
                borderBottom: mode === m ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all var(--dur-fast) var(--ease-out)',
                border: 'none', cursor: 'pointer', background: 'transparent',
              }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <h2 className="display" style={{ fontSize: 40, lineHeight: 1 }}>
            {mode === 'login' ? 'Bora jogar' : 'Cria a conta'}
          </h2>
          <p style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: 14 }}>
            {mode === 'login' ? 'Manda o login pra cair direto no lobby.' : 'Username, email, senha. Sem firula.'}
          </p>

          <form style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label className="label">Username</label>
                <input className="input" name="username" placeholder="ex: gbzin01" required />
              </div>
            )}
            <div>
              <label className="label">{mode === 'login' ? 'Email ou username' : 'Email'}</label>
              <input className="input" name={mode === 'login' ? 'login' : 'email'} placeholder={mode === 'login' ? 'voce@email.com ou @user' : 'voce@email.com'} required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" name="password" type="password" placeholder="••••••••" required />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'var(--crimson-soft)', border: '1px solid var(--crimson)', borderRadius: 'var(--r-sm)', fontSize: 13, color: 'var(--crimson)' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }} disabled={loading}>
              {loading ? 'Carregando...' : mode === 'login' ? 'Entrar →' : 'Criar conta →'}
            </button>
          </form>

          <div className="mono" style={{ marginTop: 40, fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)', textAlign: 'center' }}>
            AO ENTRAR · VOCÊ CONCORDA EM TOMAR LAVADA
          </div>
        </div>
      </div>
    </div>
  )
}
