/* eslint-disable */
// ============================================================
// END SCREEN — Fim de partida (Vitória / Derrota)
// ============================================================

function EndScreen({ variantIdx, goToScreen }) {
  const isWin = variantIdx === 0;
  const data = {
    win: isWin,
    score: isWin ? '20–8' : '7–20',
    rounds: isWin ? 7 : 6,
    duration: '4:32',
    opponent: 'pepao_br',
    mvp: window.cardById(isWin ? 'bigs' : 'pepao'),
    rankBefore: 1247,
    rankAfter: isWin ? 1275 : 1219,
    rankDelta: isWin ? +28 : -28,
    stats: [
      { l: 'CARTAS JOGADAS', v: isWin ? 8 : 6 },
      { l: 'ESPECIAIS USADAS', v: isWin ? 3 : 1 },
      { l: 'DANO INFLIGIDO', v: isWin ? 24 : 11 },
      { l: 'COUNTERS ATIVADOS', v: isWin ? 2 : 1 },
    ],
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: isWin
        ? 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 201, 60, 0.18) 0%, var(--bg) 70%)'
        : 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255, 61, 90, 0.12) 0%, var(--bg) 70%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* huge bg word */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: 480,
        color: isWin ? 'rgba(255, 201, 60, 0.06)' : 'rgba(255, 61, 90, 0.05)',
        lineHeight: 0.8,
        letterSpacing: '-0.04em',
        pointerEvents: 'none',
      }}>
        {isWin ? 'WIN' : 'LOSS'}
      </div>

      <div style={{ position: 'relative', maxWidth: 900, margin: '0 auto', padding: '60px 32px', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* header */}
        <div style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: isWin ? 'var(--gold)' : 'var(--crimson)' }}>
            ► PARTIDA FINALIZADA · {data.duration} · {data.rounds} RODADAS
          </div>
          <h1 className="display" style={{
            fontSize: 180, lineHeight: 0.9,
            marginTop: 16,
            color: isWin ? 'var(--gold)' : 'var(--crimson)',
            textShadow: isWin ? '0 0 80px var(--gold-glow)' : '0 0 80px var(--crimson-glow)',
            letterSpacing: '-0.03em',
          }}>
            {isWin ? 'VITÓRIA!' : 'DERROTA'}
          </h1>
          <p style={{ fontSize: 20, color: 'var(--ink-2)', marginTop: 12, lineHeight: 1.4 }}>
            {isWin
              ? <>Você lavou o <b style={{ color: 'var(--ink-1)' }}>@{data.opponent}</b>. Mostra pra ele.</>
              : <>O <b style={{ color: 'var(--ink-1)' }}>@{data.opponent}</b> te pegou dessa vez. Volta da próxima.</>}
          </p>
          <div className="display" style={{ fontSize: 64, color: 'var(--ink-1)', marginTop: 20, lineHeight: 1 }}>
            {data.score}
          </div>
        </div>

        {/* MVP card */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 48, marginTop: 48, padding: 32, background: 'var(--surface)', border: `1px solid ${isWin ? 'var(--gold)' : 'var(--crimson)'}`, borderRadius: 'var(--r-lg)' }}>
          <window.CardTypoBold card={data.mvp} size="md" focus />
          <div style={{ flex: 1, maxWidth: 360 }}>
            <div className="eyebrow" style={{ color: isWin ? 'var(--gold)' : 'var(--crimson)' }}>
              ► {isWin ? 'MVP DA PARTIDA' : 'MVP DO ADVERSÁRIO'}
            </div>
            <h2 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 0.95 }}>{data.mvp.name}</h2>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, fontStyle: 'italic' }}>"{data.mvp.bio}"</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <span className="pill pill-crimson">{data.mvp.atk} ATK</span>
              <span className="pill pill-mint">{data.mvp.def} DEF</span>
              <span className="pill pill-sapphire">{data.mvp.hp} HP</span>
            </div>
          </div>
        </div>

        {/* stats + rank */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginTop: 16 }}>
          <div className="panel" style={{ padding: 24 }}>
            <div className="eyebrow">► NÚMEROS DA PARTIDA</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 14 }}>
              {data.stats.map(s => (
                <div key={s.l}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>{s.l}</div>
                  <div className="display" style={{ fontSize: 36, color: 'var(--ink-1)', lineHeight: 1, marginTop: 4 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel" style={{ padding: 24, textAlign: 'center', background: isWin ? 'linear-gradient(180deg, var(--gold-soft) 0%, var(--surface) 70%)' : 'linear-gradient(180deg, var(--crimson-soft) 0%, var(--surface) 70%)' }}>
            <div className="eyebrow" style={{ color: isWin ? 'var(--gold)' : 'var(--crimson)' }}>► RANK</div>
            <div className="display" style={{ fontSize: 24, marginTop: 8, color: 'var(--gold)' }}>OURO III</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 8, letterSpacing: '0.14em' }}>{data.rankBefore} → {data.rankAfter}</div>
            <div className="display" style={{ fontSize: 56, color: isWin ? 'var(--emerald)' : 'var(--crimson)', marginTop: 10, lineHeight: 1 }}>
              {data.rankDelta > 0 ? '+' : ''}{data.rankDelta}
            </div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)', marginTop: 4 }}>PONTOS</div>
          </div>
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'center' }}>
          <button onClick={() => goToScreen('profile')} className="btn btn-ghost btn-lg">Ver histórico</button>
          <button onClick={() => goToScreen('home')} className="btn btn-ghost btn-lg">Voltar pra home</button>
          <button onClick={() => goToScreen('lobby')} className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 32px', fontSize: 15 }}>
            {isWin ? 'Jogar de novo (no embalo)' : 'Quero a revanche'} →
          </button>
        </div>
      </div>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.end = EndScreen;
