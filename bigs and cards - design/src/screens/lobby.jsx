/* eslint-disable */
// ============================================================
// LOBBY — sala de espera pré-partida (2 variantes)
// ============================================================

const { useState: useLobbyState } = React;

function LobbyScreen({ variantIdx, goToScreen }) {
  return variantIdx === 0
    ? <LobbyMirror goToScreen={goToScreen} />
    : <LobbyArena goToScreen={goToScreen} />;
}

// -------- V1: Espelhado (você esquerda · oponente direita) --------
function LobbyMirror({ goToScreen }) {
  const [iReady, setIReady] = useLobbyState(false);
  const me = window.BIGS_DATA.ME;
  const opp = window.BIGS_DATA.FRIENDS[1]; // pepao_br
  const myMain = window.cardById(me.mainCard);
  const oppMain = window.cardById(opp.mainCard);

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* dramatic background */}
      <div style={{ position: 'absolute', inset: 0, background: `
        radial-gradient(ellipse 60% 50% at 25% 50%, ${myMain.accent}22 0%, transparent 50%),
        radial-gradient(ellipse 60% 50% at 75% 50%, ${oppMain.accent}22 0%, transparent 50%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)
      ` }} />

      {/* top bar */}
      <header style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--line-1)', background: 'rgba(10,9,8,0.6)', backdropFilter: 'blur(20px)' }}>
        <button onClick={() => goToScreen('home')} className="btn btn-ghost btn-sm">← Sair do lobby</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="eyebrow">LOBBY · PARTIDA AMISTOSA</div>
          <span className="pill pill-gold mono">CÓDIGO: BGS-7H2K</span>
        </div>
        <button className="btn btn-ghost btn-sm"><window.Icon name="Settings" size={12} /> Regras</button>
      </header>

      {/* main */}
      <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, padding: '60px 40px', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        {/* ME */}
        <PlayerCard
          name={me.username}
          tag={me.tag}
          level={me.level}
          rank={me.rank}
          mainCard={myMain}
          ready={iReady}
          onReady={() => setIReady(r => !r)}
          isMe
        />

        {/* VS */}
        <div style={{ textAlign: 'center' }}>
          <div className="display" style={{ fontSize: 140, color: 'var(--gold)', lineHeight: 0.8, letterSpacing: '-0.03em', textShadow: '0 0 60px var(--gold-glow)' }}>VS</div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: '0.22em', color: 'var(--ink-3)', marginTop: 14 }}>BEST OF 1 · 20 HP · 10 ELIXIR MÁX</div>
          <div style={{ marginTop: 24, padding: 14, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 8 }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>AMBOS PRONTOS PRA COMEÇAR</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'center' }}>
              <span style={{ width: 28, height: 4, background: iReady ? 'var(--emerald)' : 'var(--surface-3)', borderRadius: 2 }} />
              <span style={{ width: 28, height: 4, background: 'var(--emerald)', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* OPPONENT */}
        <PlayerCard
          name={opp.username}
          tag={opp.tag}
          level={opp.level}
          rank="OURO II"
          mainCard={oppMain}
          ready
        />
      </div>

      {/* bottom action */}
      <div style={{ position: 'relative', zIndex: 2, padding: '20px 40px', borderTop: '1px solid var(--line-1)', background: 'rgba(10,9,8,0.7)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', gap: 12 }}>
        <button onClick={() => goToScreen('match')} className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 48px', fontSize: 16 }}>
          {iReady ? '✓ Pronto · começando...' : 'Bora pra cima!'}  →
        </button>
      </div>
    </div>
  );
}

function PlayerCard({ name, tag, level, rank, mainCard, ready, onReady, isMe }) {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${mainCard.accent}1A 0%, var(--surface) 60%)`,
      border: ready ? `2px solid var(--emerald)` : `1px solid var(--line-2)`,
      borderRadius: 'var(--r-lg)',
      padding: 32,
      textAlign: 'center',
      position: 'relative',
      transition: 'all var(--dur-base)',
      boxShadow: ready ? '0 0 0 1px var(--emerald), 0 16px 40px -16px rgba(138, 226, 52, 0.4)' : 'var(--shadow-md)',
    }}>
      {ready && (
        <div style={{ position: 'absolute', top: 16, right: 16 }}>
          <span className="pill pill-emerald" style={{ background: 'var(--emerald)', color: 'var(--ink-on-gold)', fontWeight: 700 }}>✓ PRONTO</span>
        </div>
      )}

      <div style={{ width: 88, height: 88, borderRadius: '50%', background: `linear-gradient(135deg, ${mainCard.accent}, var(--bg-2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 40, margin: '0 auto' }}>
        {name[0].toUpperCase()}
      </div>
      <h2 className="display" style={{ fontSize: 36, marginTop: 14, lineHeight: 1 }}>{name}</h2>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-3)', marginTop: 4 }}>{tag} · LV {level}</div>
      <div className="pill pill-gold" style={{ marginTop: 10 }}>{rank}</div>

      <div style={{ margin: '24px 0', display: 'flex', justifyContent: 'center' }}>
        <window.CardTypoBold card={mainCard} size="sm" />
      </div>

      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)', marginBottom: 10 }}>MAIN CARD</div>

      {isMe && (
        <button onClick={onReady} className={ready ? 'btn btn-ghost btn-lg btn-block' : 'btn btn-primary btn-lg btn-block'}>
          {ready ? '✓ Pronto (cancelar)' : 'Estou pronto'}
        </button>
      )}
    </div>
  );
}

// -------- V2: Arena com chat lateral --------
function LobbyArena({ goToScreen }) {
  const me = window.BIGS_DATA.ME;
  const opp = window.BIGS_DATA.FRIENDS[1];
  const myMain = window.cardById(me.mainCard);
  const oppMain = window.cardById(opp.mainCard);

  const messages = [
    { who: 'pepao_br', text: 'eai bigs, vamos ver no que dá' },
    { who: 'voce', text: 'prepara o lencinho' },
    { who: 'pepao_br', text: 'kkkkk vem' },
    { who: 'sys', text: 'pepao_br está pronto.' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', minHeight: '100vh' }}>
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 80% 60% at 50% 40%, var(--gold-soft) 0%, transparent 50%)` }} />

        <div style={{ position: 'relative', padding: '40px 48px', display: 'flex', flexDirection: 'column', height: '100vh' }}>
          <button onClick={() => goToScreen('home')} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>← Sair</button>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>► LOBBY · BGS-7H2K · BEST OF 1</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 60 }}>
              {/* me */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 40, margin: '0 auto', boxShadow: '0 0 0 3px var(--bg), 0 0 0 4px var(--gold)' }}>V</div>
                <div className="display" style={{ fontSize: 38, marginTop: 12, lineHeight: 1 }}>{me.username}</div>
                <div className="pill pill-emerald" style={{ marginTop: 8 }}>✓ PRONTO</div>
              </div>

              <div className="display" style={{ fontSize: 120, color: 'var(--ink-3)', lineHeight: 0.8, letterSpacing: '-0.04em' }}>×</div>

              {/* opp */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 96, height: 96, borderRadius: '50%', background: `linear-gradient(135deg, ${oppMain.accent}, var(--bg-2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 40, margin: '0 auto', boxShadow: `0 0 0 3px var(--bg), 0 0 0 4px ${oppMain.accent}` }}>P</div>
                <div className="display" style={{ fontSize: 38, marginTop: 12, lineHeight: 1 }}>{opp.username}</div>
                <div className="pill pill-emerald" style={{ marginTop: 8 }}>✓ PRONTO</div>
              </div>
            </div>

            {/* main cards */}
            <div style={{ display: 'flex', gap: 60, marginTop: 16 }}>
              <window.CardTypoBold card={myMain} size="md" />
              <window.CardTypoBold card={oppMain} size="md" />
            </div>
          </div>

          <button onClick={() => goToScreen('match')} className="btn btn-primary btn-lg" style={{ height: 64, fontSize: 18, letterSpacing: '0.05em' }}>
            ⚡ COMEÇAR A PARTIDA
          </button>
        </div>
      </div>

      {/* chat */}
      <aside style={{ background: 'var(--bg-2)', borderLeft: '1px solid var(--line-1)', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--line-1)' }}>
          <div className="eyebrow">CHAT DO LOBBY</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Pré-partida</div>
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {messages.map((m, i) => {
            if (m.who === 'sys') return (
              <div key={i} className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-4)', textAlign: 'center', padding: '4px 0' }}>
                ● {m.text}
              </div>
            );
            const isMe = m.who === 'voce';
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <span className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-4)', marginBottom: 2 }}>@{m.who}</span>
                <div style={{
                  background: isMe ? 'var(--gold-soft)' : 'var(--surface-2)',
                  border: `1px solid ${isMe ? 'var(--line-gold)' : 'var(--line-2)'}`,
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 13,
                  maxWidth: '85%',
                }}>{m.text}</div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--line-1)' }}>
          <input className="input" placeholder="provoca o cara..." />
        </div>
      </aside>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.lobby = LobbyScreen;
