/* eslint-disable */
// ============================================================
// MATCH SCREEN — 3 variantes de layout de tabuleiro
//   0: Clássico Hearthstone (horizontal, oponente em cima)
//   1: Split-screen (zonas paralelas lado a lado)
//   2: Compacto (centrado em foco, hand drawer)
// ============================================================

const { useState: useMatchState, useEffect: useMatchEffect } = React;

function MatchScreen({ variantIdx, goToScreen }) {
  if (variantIdx === 0) return <MatchClassic goToScreen={goToScreen} />;
  if (variantIdx === 1) return <MatchSplit goToScreen={goToScreen} />;
  return <MatchCompact goToScreen={goToScreen} />;
}

// ============================================================
// Shared state generator — same game state across all variants
// ============================================================
function useMatchState_Game() {
  // Oponente
  const opponent = {
    name: 'pepao_br',
    hp: 14,
    hpMax: 20,
    elixir: 6,
    elixirMax: 10,
    handCount: 3,
    deckCount: 4,
    board: [window.cardById('pepao'), window.cardById('davi')],
  };
  // Você
  const me = {
    name: 'voce',
    hp: 17,
    hpMax: 20,
    elixir: 8,
    elixirMax: 10,
    hand: [window.cardById('bigs'), window.cardById('pirula'), window.cardById('ian'), window.cardById('gustavo')],
    board: [window.cardById('gbzin'), window.cardById('hadez'), window.cardById('eric')],
  };
  const log = [
    { kind: 'sys',   text: 'partida iniciada · você joga primeiro' },
    { kind: 'me',    text: 'jogou Gbzin' },
    { kind: 'opp',   text: 'jogou Pepao' },
    { kind: 'me',    text: 'jogou Hadez · mercado +1 ATK' },
    { kind: 'opp',   text: 'jogou Davi · provoca' },
    { kind: 'me',    text: 'jogou Eric · vira o jogo nas próximas' },
    { kind: 'opp',   text: 'pepão big head → minigame iniciado' },
    { kind: 'sys',   text: 'sua vez · rodada 4 · 1:24' },
  ];
  return { opponent, me, log };
}

// ============================================================
// Shared mini-components
// ============================================================
function HPRing({ hp, hpMax, size = 64, color = 'var(--sapphire)' }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const pct = hp / hpMax;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={4} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="display" style={{ fontSize: size * 0.42, lineHeight: 1, color: 'var(--ink-1)' }}>{hp}</span>
        <span className="mono" style={{ fontSize: 8, color: 'var(--ink-4)', marginTop: -2 }}>/{hpMax}</span>
      </div>
    </div>
  );
}

function ElixirBar({ elixir, elixirMax, layout = 'horizontal' }) {
  const items = Array.from({ length: elixirMax }, (_, i) => i < elixir);
  return (
    <div style={{ display: 'flex', flexDirection: layout === 'vertical' ? 'column' : 'row', gap: 3, alignItems: 'center' }}>
      {items.map((on, i) => (
        <div key={i} style={{
          width: layout === 'vertical' ? 18 : 14,
          height: layout === 'vertical' ? 14 : 18,
          background: on ? 'radial-gradient(circle at 35% 30%, #D7A5FF, var(--purple) 70%)' : 'var(--surface-2)',
          border: `1px solid ${on ? 'var(--purple)' : 'var(--line-2)'}`,
          borderRadius: 2,
          boxShadow: on ? '0 0 6px var(--purple-glow), inset 0 -2px 3px rgba(0,0,0,0.4)' : 'none',
        }} />
      ))}
      <span className="mono" style={{ fontSize: 11, color: 'var(--purple)', marginLeft: 6, fontWeight: 700 }}>{elixir}/{elixirMax}</span>
    </div>
  );
}

function MatchTopBar({ goToScreen, round = 4, time = '1:24' }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '12px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(10, 9, 8, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--line-1)',
      zIndex: 100,
    }}>
      <button onClick={() => goToScreen('home')} className="btn btn-ghost btn-sm">
        <window.Icon name="X" size={12} /> Desistir
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-3)' }}>RODADA {round}</div>
        <div className="display" style={{ fontSize: 22, color: 'var(--gold)' }}>{time}</div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: '0.18em', color: 'var(--gold)' }}>► SUA VEZ</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button className="btn btn-ghost btn-sm"><window.Icon name="MessageSquare" size={12} /></button>
        <button className="btn btn-ghost btn-sm"><window.Icon name="Settings" size={12} /></button>
      </div>
    </div>
  );
}

function GameLog({ log, style }) {
  return (
    <div style={{
      background: 'rgba(10, 9, 8, 0.7)',
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--line-1)',
      borderRadius: 8,
      padding: 12,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      lineHeight: 1.6,
      ...style,
    }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', marginBottom: 6 }}>► LOG</div>
      {log.slice(-6).map((l, i) => (
        <div key={i} style={{
          color: l.kind === 'sys' ? 'var(--ink-4)' : l.kind === 'me' ? 'var(--gold)' : 'var(--crimson)',
          opacity: i === log.slice(-6).length - 1 ? 1 : 0.6,
        }}>
          {l.kind === 'sys' ? '◇ ' : l.kind === 'me' ? '› você ' : '‹ adv. '}{l.text}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// VARIANT 1 — CLASSIC (horizontal, opponent top)
// ============================================================
function MatchClassic({ goToScreen }) {
  const { opponent, me, log } = useMatchState_Game();
  const [selectedHandIdx, setSelectedHandIdx] = useMatchState(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 30%, #2a1b08 0%, var(--bg) 60%),
        linear-gradient(180deg, #1a0d05 0%, #0a0908 50%, #1a0d05 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <MatchTopBar goToScreen={goToScreen} />

      {/* central wood-table feel via subtle vignette */}
      <div style={{ position: 'absolute', inset: '60px 0 130px', background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(255, 201, 60, 0.04) 0%, transparent 70%)' }} />

      {/* OPPONENT bar */}
      <div style={{ position: 'absolute', top: 60, left: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <PlayerStrip player={opponent} avatar={window.cardById('pepao')} side="top" />
        {/* opponent hand back-of-cards */}
        <div style={{ display: 'flex', gap: -8 }}>
          {Array.from({ length: opponent.handCount }).map((_, i) => (
            <div key={i} style={{
              width: 50, height: 70,
              background: 'linear-gradient(135deg, #2a1b08 0%, #0a0908 100%)',
              border: '1px solid var(--gold)',
              borderRadius: 4,
              marginLeft: i === 0 ? 0 : -12,
              boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `rotate(${(i - 1) * 5}deg)`,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--gold)' }}>B</div>
            </div>
          ))}
        </div>
      </div>

      {/* OPPONENT board */}
      <div style={{ position: 'absolute', top: 180, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, padding: '20px 24px' }}>
        {opponent.board.map(c => (
          <div key={c.id} style={{ filter: 'brightness(0.95)' }}>
            <window.CardTypoBold card={c} size="sm" />
          </div>
        ))}
        {Array.from({ length: 3 - opponent.board.length }).map((_, i) => (
          <BoardSlot key={'opp-' + i} />
        ))}
      </div>

      {/* Center divider · "vs" + log */}
      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, pointerEvents: 'none' }}>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', maxWidth: 320 }} />
        <div style={{ pointerEvents: 'auto' }}>
          <GameLog log={log} style={{ width: 280 }} />
        </div>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', maxWidth: 320 }} />
      </div>

      {/* PLAYER board */}
      <div style={{ position: 'absolute', bottom: 280, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 16, padding: '20px 24px' }}>
        {me.board.map(c => (
          <window.CardTypoBold key={c.id} card={c} size="sm" focus />
        ))}
        {Array.from({ length: 3 - me.board.length }).map((_, i) => (
          <BoardSlot key={'me-' + i} active />
        ))}
      </div>

      {/* PLAYER bar */}
      <div style={{ position: 'absolute', bottom: 200, left: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <PlayerStrip player={me} avatar={window.cardById('bigs')} side="bottom" />
        <button className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 32px', fontSize: 16, boxShadow: 'var(--shadow-gold)' }}>
          Finalizar turno →
        </button>
      </div>

      {/* PLAYER hand */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 20px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 0, height: 200, pointerEvents: 'none' }}>
        {me.hand.map((c, i) => {
          const offset = i - (me.hand.length - 1) / 2;
          const sel = selectedHandIdx === i;
          const canPlay = c.cost <= me.elixir;
          return (
            <div key={c.id} style={{
              transform: `translateX(${offset * 90}px) translateY(${sel ? -50 : Math.abs(offset) * 10}px) rotate(${sel ? 0 : offset * 5}deg)`,
              transition: 'transform var(--dur-base) var(--ease-out)',
              pointerEvents: 'auto',
              zIndex: sel ? 20 : 10 - Math.abs(offset),
              cursor: canPlay ? 'pointer' : 'not-allowed',
            }} onClick={() => setSelectedHandIdx(sel ? null : i)}>
              <window.CardTypoBold card={c} size="sm" faded={!canPlay} focus={sel} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlayerStrip({ player, avatar, side }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', background: 'rgba(10,9,8,0.6)', backdropFilter: 'blur(12px)', border: '1px solid var(--line-1)', borderRadius: 12 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${avatar.accent}, var(--bg-2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20 }}>
        {player.name[0].toUpperCase()}
      </div>
      <div>
        <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{player.name}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-4)', marginTop: 2 }}>
          {player.hand?.length ?? player.handCount} mão · {player.deckCount ?? 6} deck
        </div>
      </div>
      <div style={{ width: 1, height: 32, background: 'var(--line-2)' }} />
      <HPRing hp={player.hp} hpMax={player.hpMax} size={52} color={side === 'top' ? 'var(--crimson)' : 'var(--sapphire)'} />
      <div style={{ width: 1, height: 32, background: 'var(--line-2)' }} />
      <ElixirBar elixir={player.elixir} elixirMax={player.elixirMax} />
    </div>
  );
}

function BoardSlot({ active }) {
  return (
    <div style={{
      width: 160, height: 224,
      border: `1.5px dashed ${active ? 'var(--gold)' : 'var(--line-2)'}`,
      borderRadius: 'var(--r-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: active ? 1 : 0.4,
    }}>
      <span className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: active ? 'var(--gold)' : 'var(--ink-4)' }}>
        {active ? '+ JOGAR' : 'VAZIO'}
      </span>
    </div>
  );
}

// ============================================================
// VARIANT 2 — SPLIT (vertical zones side-by-side)
// ============================================================
function MatchSplit({ goToScreen }) {
  const { opponent, me, log } = useMatchState_Game();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      <MatchTopBar goToScreen={goToScreen} />

      <div style={{ paddingTop: 60, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>
        {/* LEFT — opponent */}
        <SplitZone
          player={opponent}
          avatar={window.cardById('pepao')}
          isMe={false}
          background={`linear-gradient(180deg, ${window.cardById('pepao').accent}1A 0%, var(--bg) 50%)`}
        />

        {/* divider */}
        <div style={{ position: 'absolute', top: 60, bottom: 0, left: '50%', width: 1, background: 'linear-gradient(180deg, transparent, var(--gold) 50%, transparent)', transform: 'translateX(-50%)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
          <div className="display" style={{ fontSize: 64, color: 'var(--gold)', textShadow: '0 0 40px var(--gold-glow)', writingMode: 'vertical-rl', textOrientation: 'mixed' }}>VS</div>
        </div>

        {/* RIGHT — me */}
        <SplitZone
          player={me}
          avatar={window.cardById('bigs')}
          isMe
          background={`linear-gradient(180deg, var(--gold-soft) 0%, var(--bg) 50%)`}
        />
      </div>

      {/* Hand drawer bottom */}
      <div style={{ position: 'fixed', bottom: 0, left: '50%', right: 0, padding: '12px 20px 16px', background: 'rgba(10,9,8,0.9)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--gold)', borderLeft: '1px solid var(--gold)', borderTopLeftRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>► SUA MÃO · {me.hand.length} CARTAS</div>
          <button className="btn btn-primary btn-sm">Finalizar turno →</button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
          {me.hand.map(c => (
            <window.CardTypoBold key={c.id} card={c} size="sm" faded={c.cost > me.elixir} />
          ))}
        </div>
      </div>

      {/* Log floating */}
      <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 100 }}>
        <GameLog log={log} style={{ width: 280 }} />
      </div>
    </div>
  );
}

function SplitZone({ player, avatar, isMe, background }) {
  return (
    <div style={{ background, padding: '20px 32px 200px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'rgba(10,9,8,0.5)', border: '1px solid var(--line-2)', borderRadius: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg, ${avatar.accent}, var(--bg-2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, flexShrink: 0 }}>
          {player.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div className="display" style={{ fontSize: 24, lineHeight: 1 }}>{player.name}</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-4)', marginTop: 2, textTransform: 'uppercase' }}>
            {isMe ? 'VOCÊ' : 'OPONENTE'} · {player.hand?.length ?? player.handCount} mão
          </div>
        </div>
        <HPRing hp={player.hp} hpMax={player.hpMax} size={64} color={isMe ? 'var(--sapphire)' : 'var(--crimson)'} />
      </div>

      {/* elixir */}
      <div style={{ padding: '10px 16px', background: 'var(--surface-2)', border: '1px solid var(--line-2)', borderRadius: 8 }}>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)', marginBottom: 6 }}>ELIXIR</div>
        <ElixirBar elixir={player.elixir} elixirMax={player.elixirMax} />
      </div>

      {/* board */}
      <div className="eyebrow" style={{ marginTop: 8 }}>► TABULEIRO ({player.board.length}/3)</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {player.board.map(c => (
          <BoardCardRow key={c.id} card={c} isMe={isMe} />
        ))}
        {Array.from({ length: 3 - player.board.length }).map((_, i) => (
          <div key={'s-' + i} style={{ height: 90, border: '1.5px dashed var(--line-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.2em' }}>VAZIO</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BoardCardRow({ card, isMe }) {
  return (
    <div style={{
      padding: 12,
      background: `linear-gradient(90deg, ${card.accent}1A 0%, var(--surface) 60%)`,
      border: `1px solid ${card.accent}55`,
      borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 50, height: 64, background: `linear-gradient(135deg, ${card.accent}33, var(--bg-2))`, border: `1px solid ${card.accent}`, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="display" style={{ fontSize: 28, color: card.accent }}>{card.name[0]}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="display" style={{ fontSize: 20, lineHeight: 1 }}>{card.name}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.15em', color: card.accent, marginTop: 2, textTransform: 'uppercase' }}>{card.tagline}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--crimson)' }}>{card.atk}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--mint)' }}>{card.def}</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--sapphire)' }}>{card.hp}</span>
      </div>
    </div>
  );
}

// ============================================================
// VARIANT 3 — COMPACT (centered focus, hand as drawer)
// ============================================================
function MatchCompact({ goToScreen }) {
  const { opponent, me, log } = useMatchState_Game();
  const [handOpen, setHandOpen] = useMatchState(true);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1a0d05 0%, #0a0908 100%)', position: 'relative', overflow: 'hidden' }}>
      <MatchTopBar goToScreen={goToScreen} />

      {/* arena */}
      <div style={{ paddingTop: 80, paddingBottom: handOpen ? 280 : 80, transition: 'padding var(--dur-base)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px' }}>
          {/* opponent compact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', background: 'rgba(255, 61, 90, 0.06)', border: '1px solid var(--crimson-soft)', borderRadius: 12, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${window.cardById('pepao').accent}, var(--bg-2))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>P</div>
            <div style={{ flex: 1 }}>
              <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{opponent.name}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--crimson)', marginTop: 2 }}>● OPONENTE · {opponent.handCount} cartas</div>
            </div>
            <HPRing hp={opponent.hp} hpMax={opponent.hpMax} size={56} color="var(--crimson)" />
            <ElixirBar elixir={opponent.elixir} elixirMax={opponent.elixirMax} />
            <div style={{ display: 'flex', gap: -4 }}>
              {Array.from({ length: opponent.handCount }).map((_, i) => (
                <div key={i} style={{ width: 24, height: 34, background: 'var(--bg-2)', border: '1px solid var(--gold)', borderRadius: 2, marginLeft: i ? -8 : 0 }} />
              ))}
            </div>
          </div>

          {/* boards stacked */}
          <div className="eyebrow" style={{ color: 'var(--crimson)', textAlign: 'center', marginBottom: 12 }}>► TABULEIRO DO OPONENTE</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            {opponent.board.map(c => <window.CardTypoBold key={c.id} card={c} size="sm" />)}
            {Array.from({ length: 3 - opponent.board.length }).map((_, i) => <BoardSlot key={'osc' + i} />)}
          </div>

          {/* divider with log */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
            <div className="display" style={{ fontSize: 22, color: 'var(--gold)' }}>RODADA 4</div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
          </div>

          <div className="eyebrow" style={{ color: 'var(--gold)', textAlign: 'center', marginBottom: 12 }}>► SEU TABULEIRO</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            {me.board.map(c => <window.CardTypoBold key={c.id} card={c} size="sm" focus />)}
            {Array.from({ length: 3 - me.board.length }).map((_, i) => <BoardSlot key={'msc' + i} active />)}
          </div>

          {/* my stat bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', background: 'var(--gold-soft)', border: '1px solid var(--line-gold)', borderRadius: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22, color: 'var(--ink-on-gold)' }}>V</div>
            <div style={{ flex: 1 }}>
              <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{me.name}</div>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--gold)', marginTop: 2 }}>● SUA VEZ</div>
            </div>
            <HPRing hp={me.hp} hpMax={me.hpMax} size={56} color="var(--sapphire)" />
            <ElixirBar elixir={me.elixir} elixirMax={me.elixirMax} />
            <button onClick={() => setHandOpen(o => !o)} className="btn btn-ghost btn-sm">
              {handOpen ? 'Esconder mão ▾' : 'Abrir mão ▴'}
            </button>
            <button className="btn btn-primary">Finalizar turno →</button>
          </div>
        </div>
      </div>

      {/* hand drawer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 32px 20px',
        background: 'rgba(15, 12, 10, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '2px solid var(--gold)',
        transform: handOpen ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform var(--dur-base) var(--ease-out)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>► SUA MÃO · CLICA PRA JOGAR</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>{me.hand.length} CARTAS · DECK 5</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14 }}>
          {me.hand.map(c => (
            <window.CardTypoBold key={c.id} card={c} size="sm" faded={c.cost > me.elixir} />
          ))}
        </div>
      </div>

      {/* log */}
      <div style={{ position: 'fixed', top: 80, right: 16, zIndex: 40 }}>
        <GameLog log={log} style={{ width: 260 }} />
      </div>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.match = MatchScreen;
