import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, Swords, Clock } from 'lucide-react'
import Sidebar from '../components/Sidebar'

function Avatar({ name, gradient }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, color: 'white', fontSize: 17, flexShrink: 0
    }}>
      {name[0].toUpperCase()}
    </div>
  )
}

export default function Challenges() {
  const navigate = useNavigate()
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const token = localStorage.getItem('bigs-token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  async function fetchAll() {
    try {
      const [rc, st] = await Promise.all([
        fetch('/api/challenges/received', { headers }).then(r => r.json()),
        fetch('/api/challenges/sent', { headers }).then(r => r.json()),
      ])
      setReceived(Array.isArray(rc) ? rc : [])
      setSent(Array.isArray(st) ? st : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
    pollRef.current = setInterval(fetchAll, 4000)
    return () => clearInterval(pollRef.current)
  }, [])

  async function handleAccept(id) {
    // O servidor emite 'match:found' aos dois jogadores; o SocketContext navega pro lobby.
    await fetch(`/api/challenges/${id}/accept`, { method: 'PUT', headers })
  }

  async function handleDecline(id) {
    await fetch(`/api/challenges/${id}/decline`, { method: 'PUT', headers })
    fetchAll()
  }

  async function handleCancel(id) {
    await fetch(`/api/challenges/${id}`, { method: 'DELETE', headers })
    fetchAll()
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ marginBottom: 28 }}>
          <div className="eyebrow">BATALHAS PENDENTES</div>
          <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>
            QUEM <span style={{ color: 'var(--crimson)' }}>CHAMOU</span> VOCÊ
          </h1>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 6 }}>Aceita pra cair direto no lobby. Recusa e segue o jogo.</p>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
          {/* RECEBIDOS */}
          <section>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginBottom: 12 }}>
              ► RECEBIDOS ({received.length})
            </div>
            {loading ? (
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>CARREGANDO...</div>
            ) : received.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)' }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>NENHUM DESAFIO RECEBIDO</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {received.map(c => (
                  <div key={c.id} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                    <Avatar name={c.challenger.username} gradient="linear-gradient(135deg, var(--crimson) 0%, var(--gold) 100%)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>@{c.challenger.username}</div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--crimson)' }}>TE DESAFIOU</div>
                    </div>
                    <button className="btn btn-sm" onClick={() => handleAccept(c.id)} style={{ background: 'var(--emerald)', color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Check size={12} /> Aceitar
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleDecline(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ENVIADOS */}
          <section>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginBottom: 12 }}>
              ► ENVIADOS ({sent.length})
            </div>
            {loading ? (
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>CARREGANDO...</div>
            ) : sent.length === 0 ? (
              <div style={{ padding: '32px 20px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)' }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>NENHUM DESAFIO ENVIADO</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sent.map(c => (
                  <div key={c.id} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                    <Avatar name={c.opponent.username} gradient="linear-gradient(135deg, var(--sapphire) 0%, var(--purple) 100%)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>@{c.opponent.username}</div>
                      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={9} /> AGUARDANDO RESPOSTA
                      </div>
                    </div>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleCancel(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <X size={12} /> Cancelar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--ink-4)' }}>
          <Swords size={14} />
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em' }}>
            DESAFIE AMIGOS PELA TELA DE AMIGOS
          </span>
          <button onClick={() => navigate('/friends')} className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>
            IR PARA AMIGOS →
          </button>
        </div>
      </div>
    </div>
  )
}
