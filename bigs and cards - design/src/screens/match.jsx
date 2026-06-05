/* eslint-disable */
// ============================================================
// MATCH SCREEN — 3 variantes de layout de tabuleiro
//   0: Clássico Hearthstone (INTERATIVO — hover, jogar, comprar)
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
    board: [window.cardById('gbzin'), window.cardById('hadez')],
  };
  const log = [
    { kind: 'sys',   text: 'partida iniciada · você joga primeiro' },
    { kind: 'me',    text: 'jogou Gbzin' },
    { kind: 'opp',   text: 'jogou Pepao' },
    { kind: 'me',    text: 'jogou Hadez · mercado +1 ATK' },
    { kind: 'opp',   text: 'jogou Davi · provoca' },
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
          transition: 'all var(--dur-base) var(--ease-out)',
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
// Flyer — flying card overlay (position:fixed, animated via WAAPI)
// Drives every "card going somewhere" animation: play, draw, return.
// ============================================================
const FLY_CARD_W = 160;
function rectToFly(rect) { return { left: rect.left, top: rect.top, width: rect.width }; }
function deckTargetRect(el, scale = 0.42) {
  const r = el.getBoundingClientRect();
  const w = FLY_CARD_W * scale;
  const h = (FLY_CARD_W * 224 / 160) * scale;
  return { left: r.left + r.width / 2 - w / 2, top: r.top + r.height / 2 - h / 2, width: w };
}

function Flyer({ flyer, onDone }) {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) { onDone(flyer); return; }
    const startScale = (flyer.from.width || FLY_CARD_W) / FLY_CARD_W;
    const endScale = (flyer.to.width || FLY_CARD_W) / FLY_CARD_W;
    const dx = flyer.to.left - flyer.from.left;
    const dy = flyer.to.top - flyer.from.top;
    const lift = flyer.lift != null ? flyer.lift : 100;
    const peak = Math.max(startScale, endScale) * 1.05;
    const anim = el.animate([
      { transform: `translate(0px,0px) scale(${startScale}) rotate(${flyer.fromRot || 0}deg)`, opacity: 1, offset: 0 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(${peak}) rotate(0deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(${endScale}) rotate(0deg)`, opacity: flyer.fadeOut ? 0 : 1, offset: 1 },
    ], { duration: flyer.dur || 560, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' });
    anim.onfinish = () => onDone(flyer);
    return () => { try { anim.cancel(); } catch (e) {} };
  }, []);
  return (
    <div ref={ref} style={{
      position: 'fixed', left: flyer.from.left, top: flyer.from.top,
      width: FLY_CARD_W, zIndex: 9999, pointerEvents: 'none', transformOrigin: 'top left',
      filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.7))',
    }}>
      {flyer.content}
    </div>
  );
}

// ============================================================
// BoardCardSlot — a card sitting on the player's board.
// Hover lifts + glows; X-corner returns it to the deck.
// ============================================================
const BOARD_W = 132;
const BOARD_H = 185;
const BOARD_SCALE = BOARD_W / 160;
function BoardCardSlot({ card, mine, landed, onReturn }) {
  const [h, setH] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{ position: 'relative', width: BOARD_W, height: BOARD_H, transition: 'transform 180ms var(--ease-out)', transform: h ? 'translateY(-7px)' : 'none', cursor: mine ? 'default' : 'default' }}
    >
      <div style={{ transformOrigin: 'top left', transform: `scale(${BOARD_SCALE})`, filter: mine ? 'none' : 'brightness(0.95)' }}>
        <window.CardTypoBold card={card} size="sm" focus={h} />
      </div>
      {landed && (
        <div style={{
          position: 'absolute', inset: -6, borderRadius: 'var(--r-md)',
          border: '2px solid var(--gold)', boxShadow: '0 0 28px var(--gold-glow)',
          pointerEvents: 'none', animation: 'bcLand 520ms var(--ease-out) forwards',
        }} />
      )}
      {mine && onReturn && (
        <button
          onClick={(e) => { e.stopPropagation(); onReturn(); }}
          title="Recolher pro deck"
          style={{
            position: 'absolute', top: 4, right: 4,
            width: 22, height: 22, borderRadius: 6,
            background: 'rgba(10,9,8,0.88)', border: '1px solid var(--line-gold)',
            color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, lineHeight: 1, opacity: h ? 1 : 0,
            transition: 'opacity 150ms var(--ease-out)', cursor: 'pointer',
          }}
        >↩</button>
      )}
    </div>
  );
}

// ============================================================
// VARIANT 1 — CLASSIC (INTERACTIVE)
// ============================================================
function MatchClassic({ goToScreen }) {
  const G = useMatchState_Game();
  const [hand, setHand] = useMatchState(G.me.hand);
  const [myBoard, setMyBoard] = useMatchState(G.me.board);
  const [oppBoard] = useMatchState(G.opponent.board);
  const [elixir, setElixir] = useMatchState(G.me.elixir);
  const [deckCount, setDeckCount] = useMatchState(6);
  const [graveyard, setGraveyard] = useMatchState(2);
  const [log, setLog] = useMatchState(G.log);
  const [hoverIdx, setHoverIdx] = useMatchState(null);
  const [flyers, setFlyers] = useMatchState([]);
  const [drawId, setDrawId] = useMatchState(null);
  const [landedSlot, setLandedSlot] = useMatchState(null);
  const [round, setRound] = useMatchState(4);

  const handRefs = React.useRef({});
  const slotRefs = React.useRef({});
  const deckRef = React.useRef(null);
  const seq = React.useRef(1000);
  const pendingDraw = React.useRef(null);

  const drawPool = window.BIGS_DATA.CARDS;
  const oppTurnLines = ['comprou carta', 'passou o turno', 'jogou Davi · provoca', 'subiu o mercado', 'guardou elixir'];
  const oppTurn = React.useRef(0);

  const addLog = (kind, text) => setLog(l => [...l.slice(-12), { kind, text }]);
  const removeFlyer = (f) => setFlyers(fs => fs.filter(x => x.id !== f.id));

  // ---------- PLAY: hand -> first empty board slot ----------
  function playCard(i) {
    const card = hand[i];
    if (!card) return;
    if (card.cost > elixir) { addLog('sys', `${card.name}: elixir insuficiente`); return; }
    const slotIdx = myBoard.length;
    if (slotIdx > 2) { addLog('sys', 'tabuleiro cheio (3/3)'); return; }
    const handEl = handRefs.current[card.id];
    const slotEl = slotRefs.current[slotIdx];
    if (!handEl || !slotEl) return;
    const from = rectToFly(handEl.getBoundingClientRect());
    const to = rectToFly(slotEl.getBoundingClientRect());
    setHoverIdx(null);
    setHand(h => h.filter((_, idx) => idx !== i));
    setElixir(e => Math.max(0, e - card.cost));
    const id = ++seq.current;
    setFlyers(fs => [...fs, {
      id, from, to, lift: 140,
      content: <window.CardTypoBold card={card} size="sm" focus />,
      kind: 'play', card, slotIdx,
    }]);
  }

  // ---------- DRAW: deck -> hand (FLIP: append hidden, then fly) ----------
  function drawCard() {
    if (deckCount <= 0) { addLog('sys', 'deck vazio'); return; }
    if (hand.length >= 7) { addLog('sys', 'mão cheia (7)'); return; }
    const base = drawPool[Math.floor(Math.random() * drawPool.length)];
    const inst = { ...base, id: base.id + '_' + (++seq.current) };
    setDeckCount(d => d - 1);
    setDrawId(inst.id);
    setHand(h => [...h, inst]);
    pendingDraw.current = inst;
  }
  React.useLayoutEffect(() => {
    if (!pendingDraw.current) return;
    const inst = pendingDraw.current;
    pendingDraw.current = null;
    const handEl = handRefs.current[inst.id];
    const deckEl = deckRef.current;
    if (!handEl || !deckEl) { setDrawId(null); return; }
    const to = rectToFly(handEl.getBoundingClientRect());
    const from = deckTargetRect(deckEl, 0.42);
    const id = ++seq.current;
    setFlyers(fs => [...fs, {
      id, from, to, lift: 70, dur: 480,
      content: <window.CardTypoBold card={inst} size="sm" />,
      kind: 'draw', card: inst,
    }]);
  });

  // ---------- RETURN: board card -> deck ----------
  function returnCard(k) {
    const card = myBoard[k];
    const slotEl = slotRefs.current[k];
    const deckEl = deckRef.current;
    if (!card || !slotEl || !deckEl) return;
    const from = rectToFly(slotEl.getBoundingClientRect());
    const to = deckTargetRect(deckEl, 0.42);
    setMyBoard(b => b.filter((_, idx) => idx !== k));
    const id = ++seq.current;
    setFlyers(fs => [...fs, {
      id, from, to, lift: 110, fadeOut: true,
      content: <window.CardTypoBold card={card} size="sm" />,
      kind: 'return', card,
    }]);
  }

  function onFlyerDone(f) {
    if (f.kind === 'play') {
      setMyBoard(b => [...b, f.card]);
      setLandedSlot(f.slotIdx);
      setTimeout(() => setLandedSlot(s => (s === f.slotIdx ? null : s)), 560);
      addLog('me', `jogou ${f.card.name}`);
    } else if (f.kind === 'draw') {
      setDrawId(id => (id === f.card.id ? null : id));
      addLog('me', `comprou carta`);
    } else if (f.kind === 'return') {
      setDeckCount(d => d + 1);
      addLog('me', `recolheu ${f.card.name} pro deck`);
    }
    removeFlyer(f);
  }

  // ---------- FINISH TURN ----------
  function finishTurn() {
    addLog('me', 'finalizou o turno');
    addLog('opp', oppTurnLines[oppTurn.current % oppTurnLines.length]);
    oppTurn.current += 1;
    setRound(r => r + 1);
    setElixir(G.me.elixirMax);
    setTimeout(() => drawCard(), 240);
  }

  const HAND_SPACING = 96;

  return (
    <div style={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 28%, #2a1b08 0%, var(--bg) 60%),
        linear-gradient(180deg, #1a0d05 0%, #0a0908 50%, #1a0d05 100%)
      `,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes bcLand { 0% { opacity: 0.95; transform: scale(0.7); } 100% { opacity: 0; transform: scale(1.28); } }
        .bc-hand-card { transition: transform 220ms var(--ease-out), filter 220ms var(--ease-out); will-change: transform; }
        .bc-deck { transition: transform 140ms var(--ease-out), box-shadow 140ms var(--ease-out); }
        .bc-deck:hover { transform: translateY(-4px) scale(1.04); }
        .bc-deck:active { transform: translateY(-1px) scale(1.0); }
      `}</style>

      <MatchTopBar goToScreen={goToScreen} round={round} />

      <div style={{ position: 'absolute', inset: '60px 0 0', background: 'radial-gradient(ellipse 70% 50% at 50% 52%, rgba(255, 201, 60, 0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* OPPONENT bar */}
      <div style={{ position: 'absolute', top: 60, left: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        <PlayerStrip player={G.opponent} avatar={window.cardById('pepao')} side="top" />
        <div style={{ display: 'flex' }}>
          {Array.from({ length: G.opponent.handCount }).map((_, i) => (
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
      <div style={{ position: 'absolute', top: 122, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, padding: '0 24px', height: BOARD_H }}>
        {Array.from({ length: 3 }).map((_, k) => {
          const c = oppBoard[k];
          return (
            <div key={'opp' + k} style={{ width: BOARD_W, height: BOARD_H }}>
              {c ? <BoardCardSlot card={c} mine={false} /> : <BoardSlot />}
            </div>
          );
        })}
      </div>

      {/* Center divider + round marker */}
      <div style={{ position: 'absolute', top: 332, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, pointerEvents: 'none' }}>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, var(--line-gold), transparent)', maxWidth: 360 }} />
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.24em', color: 'var(--gold)', border: '1px solid var(--line-gold)', borderRadius: 999, padding: '5px 14px', background: 'rgba(10,9,8,0.7)', whiteSpace: 'nowrap' }}>◆ RODADA {round}</div>
        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, transparent, var(--line-gold), transparent)', maxWidth: 360 }} />
      </div>

      {/* Game log — left, vertically centered */}
      <div style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 30 }}>
        <GameLog log={log} style={{ width: 250 }} />
      </div>

      {/* PLAYER board */}
      <div style={{ position: 'absolute', bottom: 318, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 20, padding: '0 24px', height: BOARD_H }}>
        {Array.from({ length: 3 }).map((_, k) => {
          const c = myBoard[k];
          return (
            <div key={'me' + k} ref={el => { slotRefs.current[k] = el; }} style={{ width: BOARD_W, height: BOARD_H }}>
              {c
                ? <BoardCardSlot card={c} mine landed={landedSlot === k} onReturn={() => returnCard(k)} />
                : <BoardSlot active={k === myBoard.length} />}
            </div>
          );
        })}
      </div>

      {/* PLAYER bar */}
      <div style={{ position: 'absolute', bottom: 244, left: 24, right: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, zIndex: 20 }}>
        <PlayerStrip player={{ ...G.me, hand, deckCount }} avatar={window.cardById('bigs')} side="bottom" />
        <button onClick={finishTurn} className="btn btn-primary btn-lg" style={{ height: 56, padding: '0 32px', fontSize: 16, boxShadow: 'var(--shadow-gold)' }}>
          Finalizar turno →
        </button>
      </div>

      {/* DECK PILE (draw) — bottom right */}
      <div className="bc-deck" ref={deckRef} onClick={drawCard} title="Comprar carta"
        style={{
          position: 'absolute', right: 28, bottom: 28, zIndex: 40,
          width: 96, height: 134, cursor: deckCount > 0 ? 'pointer' : 'not-allowed',
          opacity: deckCount > 0 ? 1 : 0.5,
        }}>
        {/* stacked backs */}
        {[3, 2, 1, 0].map(d => (
          <div key={d} style={{
            position: 'absolute', inset: 0,
            transform: `translate(${d * 3}px, ${-d * 3}px)`,
            background: 'linear-gradient(150deg, #2a1b08 0%, #100a05 100%)',
            border: '1px solid var(--gold)', borderRadius: 8,
            boxShadow: d === 0 ? '0 10px 24px -8px rgba(0,0,0,0.8), 0 0 18px -4px var(--gold-glow)' : '0 4px 10px rgba(0,0,0,0.5)',
            display: d === 0 ? 'flex' : 'block',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {d === 0 && <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--gold)', opacity: 0.85 }}>B</div>}
          </div>
        ))}
        <div style={{ position: 'absolute', top: -10, left: -10, width: 28, height: 28, borderRadius: '50%', background: 'var(--gold)', color: 'var(--ink-on-gold)', fontFamily: 'var(--font-display)', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5, boxShadow: 'var(--shadow-sm)' }}>{deckCount}</div>
        <div style={{ position: 'absolute', bottom: -22, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--gold)' }}>COMPRAR</div>
      </div>

      {/* GRAVEYARD count — discreet, opposite deck */}
      <div style={{ position: 'absolute', left: 28, bottom: 34, zIndex: 40, display: 'flex', alignItems: 'center', gap: 8, opacity: 0.7 }}>
        <div style={{ width: 36, height: 50, border: '1px dashed var(--line-3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink-4)' }}>{graveyard}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>DESCARTE</div>
      </div>

      {/* PLAYER hand — Hearthstone-style hover */}
      <div
        onMouseLeave={() => setHoverIdx(null)}
        style={{ position: 'absolute', bottom: -8, left: 0, right: 0, height: 220, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', pointerEvents: 'none' }}
      >
        {hand.map((c, i) => {
          const n = hand.length;
          const offset = i - (n - 1) / 2;
          const isHover = hoverIdx === i;
          const canPlay = c.cost <= elixir;
          let tx = offset * HAND_SPACING;
          let ty = Math.abs(offset) * 16;
          let rot = offset * 4;
          let scale = 1;
          let z = 10 + i;
          if (hoverIdx != null) {
            if (isHover) { ty = -150; rot = 0; scale = 1.5; z = 100; }
            else { tx += (i < hoverIdx ? -52 : 52); z = 10 + i; }
          }
          return (
            <div
              key={c.id}
              ref={el => { handRefs.current[c.id] = el; }}
              className="bc-hand-card"
              onMouseEnter={() => setHoverIdx(i)}
              onClick={() => playCard(i)}
              style={{
                position: 'absolute', bottom: 0,
                transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rot}deg) scale(${scale})`,
                transformOrigin: 'bottom center',
                zIndex: z,
                pointerEvents: 'auto',
                cursor: canPlay ? 'pointer' : 'not-allowed',
                opacity: c.id === drawId ? 0 : 1,
                filter: isHover
                  ? `drop-shadow(0 24px 36px rgba(0,0,0,0.7)) drop-shadow(0 0 24px ${canPlay ? c.accent : 'rgba(0,0,0,0)'}99)`
                  : 'none',
              }}
            >
              <window.CardTypoBold card={c} size="sm" faded={!canPlay} focus={isHover} />
              {/* play affordance shown on hover */}
              {isHover && (
                <div style={{
                  position: 'absolute', top: -30, left: '50%', transform: 'translateX(-50%)',
                  fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em',
                  color: canPlay ? 'var(--gold)' : 'var(--crimson)', whiteSpace: 'nowrap',
                  background: 'rgba(10,9,8,0.9)', padding: '4px 10px', borderRadius: 999,
                  border: `1px solid ${canPlay ? 'var(--line-gold)' : 'var(--crimson-soft)'}`,
                }}>{canPlay ? '▲ CLIQUE PRA JOGAR' : `● PRECISA ${c.cost} ELIXIR`}</div>
              )}
            </div>
          );
        })}
        {hand.length === 0 && (
          <div className="mono" style={{ position: 'absolute', bottom: 80, fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>
            MÃO VAZIA · COMPRE UMA CARTA →
          </div>
        )}
      </div>

      {/* FLYERS overlay */}
      {flyers.map(f => <Flyer key={f.id} flyer={f} onDone={onFlyerDone} />)}
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

function BoardSlot({ active, w = 132, h = 185 }) {
  return (
    <div style={{
      width: w, height: h,
      border: `1.5px dashed ${active ? 'var(--gold)' : 'var(--line-2)'}`,
      borderRadius: 'var(--r-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: active ? 1 : 0.4,
      background: active ? 'var(--gold-soft)' : 'transparent',
      transition: 'all var(--dur-base) var(--ease-out)',
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
            <div style={{ display: 'flex' }}>
              {Array.from({ length: opponent.handCount }).map((_, i) => (
                <div key={i} style={{ width: 24, height: 34, background: 'var(--bg-2)', border: '1px solid var(--gold)', borderRadius: 2, marginLeft: i ? -8 : 0 }} />
              ))}
            </div>
          </div>

          {/* boards stacked */}
          <div className="eyebrow" style={{ color: 'var(--crimson)', textAlign: 'center', marginBottom: 12 }}>► TABULEIRO DO OPONENTE</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
            {opponent.board.map(c => <window.CardTypoBold key={c.id} card={c} size="sm" />)}
            {Array.from({ length: 3 - opponent.board.length }).map((_, i) => <BoardSlot key={'osc' + i} w={160} h={224} />)}
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
            {Array.from({ length: 3 - me.board.length }).map((_, i) => <BoardSlot key={'msc' + i} active w={160} h={224} />)}
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
