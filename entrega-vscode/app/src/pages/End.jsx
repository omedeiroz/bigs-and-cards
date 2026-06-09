// ============================================================
// End — tela de resultado da partida
// Drop-in: app/src/pages/End.jsx (substitui o placeholder "EM BREVE")
//
// COMO RECEBE OS DADOS:
//  - Resultado da batalha via location.state (passado pelo Match no game over):
//      { result: 'win'|'loss'|'draw', score, rounds, duration,
//        opponent, matchType: 'ranked'|'casual', mvp (cardId), stats: [{l,v}] }
//  - Rank delta via useSocket().rankUpdate (evento `rank:update`):
//      { delta, newPts, isWin, rank }  — só em partidas ranqueadas
//  Ver IMPLEMENTAR.md pra o trecho de navegação no Match.jsx.
// ============================================================
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cardById } from '../data/cards'
import { useSocket } from '../context/SocketContext'
import RankDelta from '../components/RankDelta'

function MvpPortrait({ cardId, accent }) {
  const data = cardById(cardId) || {}
  return (
    <div style={{
      width: 168, height: 236, borderRadius: 12, flexShrink: 0,
      background: 'var(--surface-2)', border: `2px solid ${data.accent || accent}`,
      position: 'relative', overflow: 'hidden',
      boxShadow: `0 12px 40px -8px rgba(0,0,0,0.7)`,
    }}>
      <div className="display" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, color: data.accent || 'var(--ink-3)', opacity: 0.35 }}>
        {(data.name || '?')[0].toUpperCase()}
      </div>
      <img src={`/cards/${cardId}.png`} alt={data.name || cardId} onError={e => { e.currentTarget.style.display = 'none' }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.9) 100%)' }} />
      <div className="mono" style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 11, letterSpacing: '0.14em', color: '#fff', fontWeight: 700, textShadow: '0 1px 3px #000' }}>
        {(data.name || cardId).toUpperCase()}
      </div>
    </div>
  )
}

// fallback caso o usuário abra /end direto (sem state da partida)
const FALLBACK = {
  result: 'win', score: '—', rounds: 0, duration: '0:00',
  opponent: 'oponente', matchType: 'casual', mvp: 'bigs',
  stats: [
    { l: 'CARTAS JOGADAS', v: 0 }, { l: 'ESPECIAIS USADAS', v: 0 },
    { l: 'DANO INFLIGIDO', v: 0 }, { l: 'MINIGAMES GANHOS', v: 0 },
  ],
}

export default function End() {
  const navigate = useNavigate()
  const location = useLocation()
  const { rankUpdate, clearRankUpdate } = useSocket()

  const data = location.state || FALLBACK
  const isWin = data.result === 'win'
  const isDraw = data.result === 'draw'
  const accent = isDraw ? 'var(--gold)' : isWin ? 'var(--emerald)' : 'var(--crimson)'
  const glow = isDraw ? 'var(--gold-glow)' : isWin ? 'rgba(138,226,52,0.5)' : 'var(--crimson-glow)'
  const ghost = isDraw ? 'EMPATE' : isWin ? 'WIN' : 'LOSS'
  const headline = isDraw ? 'EMPATE' : isWin ? 'VITÓRIA!' : 'DERROTA'
  const mvp = cardById(data.mvp) || cardById('bigs')

  // limpa o rank delta ao sair, pra não reaparecer na próxima tela
  useEffect(() => () => clearRankUpdate?.(), [])

  return (
    <div style={{
      minHeight: '100vh',
      background: isWin
        ? 'radial-gradient(ellipse 80% 60% at 50% 36%, rgba(138,226,52,0.14) 0%, var(--bg) 68%)'
        : isDraw
        ? 'radial-gradient(ellipse 80% 60% at 50% 36%, rgba(255,201,60,0.12) 0%, var(--bg) 68%)'
        : 'radial-gradient(ellipse 80% 60% at 50% 36%, rgba(255,61,90,0.11) 0%, var(--bg) 68%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 460, color: accent, opacity: 0.05, lineHeight: 0.8, letterSpacing: '-0.04em', pointerEvents: 'none', userSelect: 'none' }}>
        {ghost}
      </div>

      <div style={{ position: 'relative', maxWidth: 940, margin: '0 auto', padding: '56px 32px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: accent }}>
            ► PARTIDA FINALIZADA · {data.duration} · {data.rounds} RODADAS · {data.matchType === 'ranked' ? 'RANQUEADA ★' : 'CASUAL ◇'}
          </div>
          <h1 className="display" style={{ fontSize: 168, lineHeight: 0.88, marginTop: 14, color: accent, textShadow: `0 0 80px ${glow}`, letterSpacing: '-0.03em' }}>
            {headline}
          </h1>
          <p style={{ fontSize: 19, color: 'var(--ink-2)', marginTop: 10, lineHeight: 1.4 }}>
            {isDraw
              ? <>Deu zebra — empate com <b style={{ color: 'var(--ink-1)' }}>@{data.opponent}</b>. Desempata na revanche.</>
              : isWin
              ? <>Você lavou o <b style={{ color: 'var(--ink-1)' }}>@{data.opponent}</b>. Mostra pra ele.</>
              : <>O <b style={{ color: 'var(--ink-1)' }}>@{data.opponent}</b> te pegou dessa vez. Volta da próxima.</>}
          </p>
          <div className="display" style={{ fontSize: 60, color: 'var(--ink-1)', marginTop: 16, lineHeight: 1 }}>{data.score}</div>
        </div>

        {/* MVP */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44, marginTop: 40, padding: 28, background: 'var(--surface)', border: `1px solid ${accent}`, borderRadius: 14, boxShadow: '0 8px 24px -8px rgba(0,0,0,0.7)' }}>
          <MvpPortrait cardId={data.mvp} accent={accent} />
          <div style={{ flex: 1, maxWidth: 380 }}>
            <div className="eyebrow" style={{ color: accent }}>► {isWin ? 'MVP DA PARTIDA' : 'MVP DO ADVERSÁRIO'}</div>
            <h2 className="display" style={{ fontSize: 52, marginTop: 6, lineHeight: 0.95 }}>{mvp.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, fontStyle: 'italic' }}>"{mvp.bio}"</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <span className="pill pill-crimson">{mvp.atk} ATK</span>
              <span className="pill pill-mint">{mvp.def} DEF</span>
              <span className="pill pill-sapphire">{mvp.hp} HP</span>
            </div>
          </div>
        </div>

        {/* stats + rank */}
        <div style={{ display: 'grid', gridTemplateColumns: rankUpdate ? '1.4fr 1fr' : '1fr', gap: 16, marginTop: 16 }}>
          <div className="panel" style={{ padding: 24 }}>
            <div className="eyebrow">► NÚMEROS DA BATALHA</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18, marginTop: 16 }}>
              {(data.stats || []).map(s => (
                <div key={s.l}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>{s.l}</div>
                  <div className="display" style={{ fontSize: 34, color: 'var(--ink-1)', lineHeight: 1, marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          {rankUpdate && <RankDelta rankUpdate={rankUpdate} />}
        </div>

        {!rankUpdate && data.matchType !== 'ranked' && (
          <div className="mono" style={{ textAlign: 'center', marginTop: 14, fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>
            ◇ PARTIDA CASUAL — NÃO ALTERA SEU RANK
          </div>
        )}

        {/* actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 30, justifyContent: 'center' }}>
          <button onClick={() => navigate('/profile')} className="btn btn-ghost btn-lg">Ver histórico</button>
          <button onClick={() => navigate('/leaderboard')} className="btn btn-ghost btn-lg">Ver placar</button>
          <button onClick={() => navigate('/home')} className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 32px', fontSize: 15 }}>
            {isWin ? 'Jogar de novo (no embalo)' : 'Quero a revanche'} →
          </button>
        </div>
      </div>
    </div>
  )
}
