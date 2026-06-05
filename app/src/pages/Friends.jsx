import { useState, useEffect, useRef } from 'react'
import { UserPlus, Check, X, Users, Search, Swords } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import { useSocket } from '../context/SocketContext'

export default function Friends() {
  const { onlineIds } = useSocket()
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [addInput, setAddInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [challengeFeedback, setChallengeFeedback] = useState({})
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  const token = localStorage.getItem('bigs-token')
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  async function fetchAll() {
    setLoading(true)
    try {
      const [fr, rq] = await Promise.all([
        fetch('/api/friends', { headers }).then(r => r.json()),
        fetch('/api/friends/requests', { headers }).then(r => r.json()),
      ])
      setFriends(Array.isArray(fr) ? fr : [])
      setRequests(Array.isArray(rq) ? rq : [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleInputChange(e) {
    const val = e.target.value
    setAddInput(val)
    setAddError('')
    setAddSuccess('')

    clearTimeout(debounceRef.current)
    if (val.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(val.trim())}`, { headers })
        const data = await res.json()
        setSuggestions(Array.isArray(data) ? data : [])
        setShowSuggestions(true)
      } catch {}
    }, 250)
  }

  function selectSuggestion(username) {
    setAddInput(username)
    setSuggestions([])
    setShowSuggestions(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')
    setShowSuggestions(false)
    const target = addInput.trim()
    if (!target) return

    const res = await fetch('/api/friends/request', {
      method: 'POST',
      headers,
      body: JSON.stringify({ username: target })
    })
    const data = await res.json()

    if (!res.ok) {
      setAddError(data.error)
    } else {
      setAddSuccess(`Pedido enviado para @${target}`)
      setAddInput('')
      setSuggestions([])
    }
  }

  async function handleAccept(id) {
    await fetch(`/api/friends/${id}/accept`, { method: 'PUT', headers })
    fetchAll()
  }

  async function handleReject(id) {
    await fetch(`/api/friends/${id}`, { method: 'DELETE', headers })
    fetchAll()
  }

  async function handleRemove(friendshipId) {
    await fetch(`/api/friends/${friendshipId}`, { method: 'DELETE', headers })
    fetchAll()
  }

  async function handleChallenge(userId) {
    const res = await fetch('/api/challenges', {
      method: 'POST',
      headers,
      body: JSON.stringify({ opponentId: userId })
    })
    const data = await res.json()
    setChallengeFeedback(prev => ({
      ...prev,
      [userId]: res.ok ? { ok: true, msg: 'Desafio enviado!' } : { ok: false, msg: data.error }
    }))
    setTimeout(() => {
      setChallengeFeedback(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
    }, 3000)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ marginBottom: 24 }}>
          <div className="eyebrow">PARCEIROS DE LAVADA</div>
          <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>
            QUEM TÁ NA <span style={{ color: 'var(--gold)' }}>ÁREA</span>
          </h1>
        </header>

        {/* Add friend */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, marginBottom: 36, maxWidth: 480 }}>
          <div style={{ flex: 1, position: 'relative' }} ref={wrapperRef}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--ink-4)', pointerEvents: 'none'
              }} />
              <input
                className="input"
                placeholder="Buscar por username..."
                value={addInput}
                onChange={handleInputChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                style={{ paddingLeft: 36 }}
                autoComplete="off"
              />
            </div>

            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                background: 'var(--bg-2)', border: '1px solid var(--line-1)',
                borderRadius: 'var(--r-md)', zIndex: 50, overflow: 'hidden'
              }}>
                {suggestions.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => selectSuggestion(u.username)}
                    style={{
                      width: '100%', padding: '10px 14px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--ink-1)', textAlign: 'left',
                      borderBottom: '1px solid var(--line-1)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--sapphire) 0%, var(--purple) 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: 'white', fontSize: 12, flexShrink: 0
                    }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>@{u.username}</span>
                  </button>
                ))}
              </div>
            )}

            {addError && <div style={{ color: 'var(--crimson)', fontSize: 12, marginTop: 6 }}>{addError}</div>}
            {addSuccess && <div style={{ color: 'var(--emerald)', fontSize: 12, marginTop: 6 }}>{addSuccess}</div>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <UserPlus size={14} /> Adicionar
          </button>
        </form>

        {/* Pending requests */}
        {requests.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginBottom: 12 }}>
              ► PEDIDOS RECEBIDOS ({requests.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {requests.map(r => (
                <div key={r.id} className="panel" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--sapphire) 0%, var(--purple) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'white', fontSize: 15, flexShrink: 0
                  }}>
                    {r.sender.username[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>@{r.sender.username}</div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-4)' }}>QUER SER SEU AMIGO</div>
                  </div>
                  <button
                    className="btn btn-sm"
                    onClick={() => handleAccept(r.id)}
                    style={{ background: 'var(--emerald)', color: '#000', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Check size={12} /> Aceitar
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => handleReject(r.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <X size={12} /> Recusar
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Friends list */}
        <section>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginBottom: 12 }}>
            ► AMIGOS ({friends.length})
          </div>

          {loading ? (
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>CARREGANDO...</div>
          ) : friends.length === 0 ? (
            <div style={{ padding: '48px 32px', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)' }}>
              <Users size={32} style={{ color: 'var(--ink-4)', margin: '0 auto 12px', display: 'block' }} />
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NENHUM AMIGO AINDA</div>
              <p style={{ fontSize: 14, color: 'var(--ink-4)', marginTop: 8 }}>Busque pelo username acima.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
              {friends.map(f => {
                const fb = challengeFeedback[f.id]
                const online = onlineIds.includes(f.id)
                return (
                  <div key={f.id} className="panel" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--gold) 0%, var(--crimson) 100%)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, color: 'var(--ink-on-gold)', fontSize: 18
                        }}>
                          {f.username[0].toUpperCase()}
                        </div>
                        <span style={{
                          position: 'absolute', bottom: 0, right: 0,
                          width: 12, height: 12, borderRadius: '50%',
                          background: online ? 'var(--emerald)' : 'var(--ink-4)',
                          border: '2px solid var(--bg-2)'
                        }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          @{f.username}
                        </div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: online ? 'var(--emerald)' : 'var(--ink-4)' }}>
                          {online ? 'ONLINE' : 'OFFLINE'}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleRemove(f.friendshipId)}
                        style={{ padding: '4px 8px', flexShrink: 0 }}
                        title="Remover amigo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    {fb ? (
                      <div style={{
                        fontSize: 12, textAlign: 'center', padding: '8px 0',
                        color: fb.ok ? 'var(--emerald)' : 'var(--crimson)'
                      }}>
                        {fb.msg}
                      </div>
                    ) : (
                      <button
                        className="btn btn-sm btn-block"
                        onClick={() => handleChallenge(f.id)}
                        style={{ background: 'var(--crimson)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <Swords size={13} /> Desafiar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
