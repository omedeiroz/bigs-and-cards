/* eslint-disable */
// ============================================================
// CHALLENGES — desafios enviados e recebidos (2 variantes)
// ============================================================

const { useState: useChalState } = React;

function ChallengesScreen({ variantIdx, goToScreen }) {
  return variantIdx === 0
    ? <ChallengesTabs goToScreen={goToScreen} />
    : <ChallengesInbox goToScreen={goToScreen} />;
}

// -------- V1: Tabs --------
function ChallengesTabs({ goToScreen }) {
  const [tab, setTab] = useChalState('recebidos');
  const ch = window.BIGS_DATA.CHALLENGES;
  const list = ch[tab];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="challenges" goToScreen={goToScreen} />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto', maxWidth: 980 }}>
        <header style={{ marginBottom: 28 }}>
          <div className="eyebrow">BATALHAS PENDENTES</div>
          <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>QUEM <span style={{ color: 'var(--crimson)' }}>CHAMOU</span> VOCÊ</h1>
          <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 6 }}>Aceita, recusa ou ignora. Tem 24h pra decidir.</p>
        </header>

        {/* tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--line-2)', marginBottom: 20 }}>
          {[
            { k: 'recebidos', l: 'Recebidos', n: ch.recebidos.length },
            { k: 'enviados',  l: 'Enviados',  n: ch.enviados.length },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              padding: '12px 24px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700,
              color: tab === t.k ? 'var(--gold)' : 'var(--ink-3)',
              borderBottom: tab === t.k ? '2px solid var(--gold)' : '2px solid transparent',
              marginBottom: -1,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {t.l}
              <span style={{ background: tab === t.k ? 'var(--gold-soft)' : 'var(--surface-3)', color: tab === t.k ? 'var(--gold)' : 'var(--ink-4)', padding: '2px 7px', borderRadius: 999, fontSize: 10 }}>{t.n}</span>
            </button>
          ))}
        </div>

        {/* list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(c => {
            const opponent = tab === 'recebidos' ? c.from : c.to;
            const friend = window.BIGS_DATA.FRIENDS.find(f => f.username === opponent);
            const main = friend ? window.cardById(friend.mainCard) : window.BIGS_DATA.CARDS[0];
            return (
              <div key={c.id} className="panel" style={{ padding: 18, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${main.accent} 0%, var(--bg-2) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>
                  {opponent[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>@{opponent}</span>
                    <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>· {c.when}</span>
                  </div>
                  {c.message && c.message !== '—' && (
                    <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, fontStyle: 'italic' }}>"{c.message}"</p>
                  )}
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: main.accent, marginTop: 4, textTransform: 'uppercase' }}>
                    MAIN: {main.name} · LV {friend?.level}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {tab === 'recebidos' ? (
                    <>
                      <button className="btn btn-sm btn-ghost">Recusar</button>
                      <button onClick={() => goToScreen('lobby')} className="btn btn-sm btn-primary">Aceitar →</button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-ghost">Cancelar</button>
                  )}
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>NADA POR AQUI · MANDA UM DESAFIO</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -------- V2: Split inbox + compose --------
function ChallengesInbox({ goToScreen }) {
  const ch = window.BIGS_DATA.CHALLENGES;
  const [selected, setSelected] = useChalState(ch.recebidos[0]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="challenges" goToScreen={goToScreen} />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', minHeight: '100vh' }}>
        {/* inbox */}
        <div style={{ borderRight: '1px solid var(--line-1)', overflowY: 'auto' }}>
          <header style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--line-1)' }}>
            <div className="eyebrow">INBOX · {ch.recebidos.length} NOVOS</div>
            <h1 className="display" style={{ fontSize: 32, marginTop: 4, lineHeight: 1 }}>Desafios</h1>
          </header>

          <div className="mono" style={{ padding: '12px 24px', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', background: 'var(--bg-2)' }}>► RECEBIDOS</div>
          {ch.recebidos.map(c => {
            const friend = window.BIGS_DATA.FRIENDS.find(f => f.username === c.from);
            const main = friend ? window.cardById(friend.mainCard) : window.BIGS_DATA.CARDS[0];
            const isSel = selected?.id === c.id;
            return (
              <button key={c.id} onClick={() => setSelected(c)} style={{
                display: 'flex', gap: 12, padding: '14px 24px',
                width: '100%', textAlign: 'left',
                background: isSel ? `${main.accent}14` : 'transparent',
                borderBottom: '1px solid var(--line-1)',
                borderLeft: isSel ? `2px solid ${main.accent}` : '2px solid transparent',
                cursor: 'pointer', alignItems: 'center',
              }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg, ${main.accent} 0%, var(--bg-2) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {c.from[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>@{c.from}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.message !== '—' ? c.message : 'sem mensagem'}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>{c.when}</span>
              </button>
            );
          })}

          <div className="mono" style={{ padding: '12px 24px', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', background: 'var(--bg-2)' }}>► ENVIADOS</div>
          {ch.enviados.map(c => (
            <button key={c.id} style={{
              display: 'flex', gap: 12, padding: '14px 24px',
              width: '100%', textAlign: 'left',
              background: 'transparent', cursor: 'pointer', alignItems: 'center',
              borderBottom: '1px solid var(--line-1)',
              opacity: 0.6,
            }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {c.to[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>→ @{c.to}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em' }}>AGUARDANDO · {c.when}</div>
              </div>
            </button>
          ))}
        </div>

        {/* detail */}
        {selected && (() => {
          const friend = window.BIGS_DATA.FRIENDS.find(f => f.username === selected.from);
          const main = friend ? window.cardById(friend.mainCard) : window.BIGS_DATA.CARDS[0];
          return (
            <div style={{ padding: '40px 48px', overflowY: 'auto' }}>
              <div className="eyebrow" style={{ color: main.accent }}>► CHALLENGER · {selected.when.toUpperCase()}</div>
              <h2 className="display" style={{ fontSize: 64, marginTop: 6, lineHeight: 1 }}>@{selected.from}</h2>

              {/* "vs" block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginTop: 32, padding: '28px 24px', background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-lg)' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 32, margin: '0 auto' }}>V</div>
                  <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700 }}>@voce</div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--gold)', marginTop: 2 }}>LV 19 · OURO III</div>
                </div>
                <div className="display" style={{ fontSize: 64, color: 'var(--crimson)', lineHeight: 1 }}>VS</div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${main.accent}, var(--bg-2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 32, margin: '0 auto' }}>
                    {selected.from[0].toUpperCase()}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 16, fontWeight: 700 }}>@{selected.from}</div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: main.accent, marginTop: 2 }}>LV {friend?.level} · MAIN: {main.name}</div>
                </div>
              </div>

              {selected.message && selected.message !== '—' && (
                <div style={{ marginTop: 20, padding: 18, background: 'var(--bg-2)', borderLeft: `3px solid ${main.accent}`, borderRadius: 6 }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)', marginBottom: 6 }}>MENSAGEM</div>
                  <p style={{ fontSize: 16, color: 'var(--ink-1)', fontStyle: 'italic', lineHeight: 1.5 }}>"{selected.message}"</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
                <button className="btn btn-ghost btn-lg" style={{ flex: 1 }}>Recusar</button>
                <button onClick={() => goToScreen('lobby')} className="btn btn-primary btn-lg" style={{ flex: 2 }}>
                  Aceitar e entrar no lobby →
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.challenges = ChallengesScreen;
