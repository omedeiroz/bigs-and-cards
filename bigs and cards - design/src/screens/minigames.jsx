/* eslint-disable */
// ============================================================
// MINIGAMES — 8 telas, 3 estados cada (READY · PLAY · RESULT)
//
// Shell compartilhado: top bar com trigger + nome, banners de
// jogador (oponente em cima, você embaixo), e um phase-switcher
// flutuante que NÃO faz parte do app real — é só pro protótipo
// permitir alternar entre os 3 estados sem lógica de jogo.
//
// Lógica de jogo ZERO aqui. Cada PLAY state mostra um snapshot
// realista (contadores no meio, animações CSS pra dar vida).
// Quem implementa a lógica conecta state real nessas mesmas
// estruturas visuais.
// ============================================================

const { useState: useMG, useEffect: useMGEffect, useRef: useMGRef } = React;

// ============================================================
// CONFIG — 8 minigames
// ============================================================
const MINIGAMES = [
  {
    id: 'teclado', name: 'Teclado Quente', type: 'QTE',
    desc: '4 teclas em 1.5s · primeiro a digitar certo vence',
    trigger: 'EMPATE DE ATK', triggerCtx: 'Davi 5 vs Bigs 5',
    accent: 'var(--crimson)', accentSoft: 'var(--crimson-soft)',
    winner: 'me', verdict: '+1 ATK no Bigs · Davi pula próxima jogada',
  },
  {
    id: 'choro', name: 'Segura o Choro', type: 'QTE',
    desc: 'Para a barra · mais perto do alvo dourado vence',
    trigger: 'PASSIVA DO PEPAO', triggerCtx: '30% rolou · ativada',
    accent: 'var(--gold)', accentSoft: 'var(--gold-soft)',
    winner: 'opp', verdict: 'Pepao aplica +1 dano bônus',
  },
  {
    id: 'reacao', name: 'Reação Pura', type: 'QTE',
    desc: 'Espera o verde · quem apertar primeiro vence',
    trigger: 'ESPECIAL · PEPÃO BIG HEAD', triggerCtx: '3 elixir · minigame à escolha',
    accent: 'var(--emerald)', accentSoft: 'var(--emerald-soft)',
    winner: 'me', verdict: 'Bigs pula a próxima jogada de cartas do Pepao',
  },
  {
    id: 'clique', name: 'Clique Frenético', type: 'QTE',
    desc: '5 segundos · mais cliques vence',
    trigger: 'EMPATE DE ATK', triggerCtx: 'Eric 3 vs Ian 3',
    accent: 'var(--sapphire)', accentSoft: 'var(--sapphire-soft)',
    winner: 'me', verdict: 'Eric aplica 100% do dano · Ian leva 3',
  },
  {
    id: 'blefe', name: 'Blefe', type: 'Leitura',
    desc: 'Cada um escolhe 1-5 em segredo · maior vence',
    trigger: 'COUNTER · Davi vs Pepao', triggerCtx: 'Davi escolheu o tipo',
    accent: 'var(--purple)', accentSoft: 'var(--purple-soft)',
    winner: 'opp', verdict: 'Pepao recupera +1 vida',
  },
  {
    id: 'paridade', name: 'Par ou Ímpar', type: 'Clássico',
    desc: 'Aposta par/ímpar · digita 1-10 · soma decide',
    trigger: 'EMPATE DE ATK', triggerCtx: 'Bigs 4 vs Hadez 4',
    accent: 'var(--mint)', accentSoft: 'var(--mint-soft)',
    winner: 'me', verdict: 'Bigs aplica 100% · Hadez leva 4',
  },
  {
    id: 'mira', name: 'Mira Louca', type: 'Precisão',
    desc: 'Alvo móvel · 3 cliques certos vencem',
    trigger: 'ESPECIAL · CHAMA PRA BRIGA', triggerCtx: 'Davi provoca Bigs',
    accent: 'var(--crimson)', accentSoft: 'var(--crimson-soft)',
    winner: 'me', verdict: 'Bigs escapa da provocação · ataca livre',
  },
  {
    id: 'jokenpo', name: 'Pedra Papel Tesoura', type: 'Estratégia',
    desc: 'Melhor de 3 · reveal simultâneo',
    trigger: 'EMPATE DE ATK', triggerCtx: 'Hadez 6 vs Rena 6',
    accent: 'var(--gold)', accentSoft: 'var(--gold-soft)',
    winner: 'opp', verdict: 'Rena aplica 100% · Hadez leva 6',
  },
];

// ============================================================
// PLAYERS — mock pra mostrar nos banners
// ============================================================
const PLAYERS = {
  me:  { name: 'Você',  card: 'Bigs',  hp: 18, hpMax: 24, accent: 'var(--gold)',    initial: 'V' },
  opp: { name: 'Pepao', card: 'Pepao', hp: 12, hpMax: 24, accent: 'var(--crimson)', initial: 'P' },
};

// ============================================================
// SHELL
// ============================================================
function MinigamesScreen({ variantIdx, goToScreen }) {
  const mg = MINIGAMES[variantIdx] || MINIGAMES[0];
  const [phase, setPhase] = useMG('play'); // ready · play · result

  // Resetar pra "play" quando trocar de minigame
  useMGEffect(() => { setPhase('play'); }, [variantIdx]);

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at center, ${mg.accentSoft.replace('var(--', '').replace('-soft)', '')} -40%, var(--bg) 55%), linear-gradient(180deg, #16100b 0%, #0a0908 100%)`,
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      color: 'var(--ink-1)',
    }} data-screen-label={`11 Minigame · ${mg.name}`}>
      {/* radial glow accent */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(900px 500px at 50% 45%, ${mg.accent}1F, transparent 70%)`,
      }} />

      <MGTopBar mg={mg} goToScreen={goToScreen} />

      {/* opponent banner */}
      <div style={{ position: 'relative', zIndex: 2, padding: '80px 32px 0' }}>
        <PlayerBanner player={PLAYERS.opp} side="opp" />
      </div>

      {/* stage */}
      <div style={{
        position: 'relative', zIndex: 2,
        padding: '24px 32px',
        minHeight: 'calc(100vh - 320px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: 1100 }}>
          {phase === 'ready'  && <MGReady mg={mg} />}
          {phase === 'play'   && <MGPlay mg={mg} />}
          {phase === 'result' && <MGResult mg={mg} />}
        </div>
      </div>

      {/* me banner */}
      <div style={{ position: 'relative', zIndex: 2, padding: '0 32px 96px' }}>
        <PlayerBanner player={PLAYERS.me} side="me" />
      </div>

      <PhaseSwitcher phase={phase} setPhase={setPhase} mg={mg} />
    </div>
  );
}

// ============================================================
// TOP BAR — trigger + nome do minigame
// ============================================================
function MGTopBar({ mg, goToScreen }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      padding: '20px 32px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'linear-gradient(180deg, rgba(10,9,8,0.9) 0%, transparent 100%)',
    }}>
      <button onClick={() => goToScreen('match', 0)} className="btn btn-ghost btn-sm" style={{ background: 'rgba(15,12,10,0.7)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em' }}>← VOLTAR PRA PARTIDA</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span className="pill pill-crimson" style={{ background: 'rgba(255,61,90,0.18)' }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--crimson)', boxShadow: '0 0 8px var(--crimson)' }} />
          MINIGAME ATIVO
        </span>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>
          ► {mg.trigger}  <span style={{ color: 'var(--ink-4)' }}>·</span>  {mg.triggerCtx}
        </div>
      </div>

      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>
        TIPO: <span style={{ color: 'var(--ink-2)' }}>{mg.type.toUpperCase()}</span>
      </div>
    </div>
  );
}

// ============================================================
// PLAYER BANNER — slimmer version of match's player bar
// ============================================================
function PlayerBanner({ player, side }) {
  const isMe = side === 'me';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 20,
      padding: '14px 20px',
      background: isMe ? 'var(--gold-soft)' : 'rgba(255, 61, 90, 0.06)',
      border: `1px solid ${isMe ? 'var(--line-gold)' : 'var(--crimson-soft)'}`,
      borderRadius: 12,
      maxWidth: 1100, margin: '0 auto',
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        background: `linear-gradient(135deg, ${player.accent}, var(--bg-2))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: 18, color: isMe ? 'var(--ink-on-gold)' : 'var(--ink-1)',
        boxShadow: 'var(--shadow-sm)',
      }}>{player.initial}</div>
      <div style={{ flex: 1 }}>
        <div className="display" style={{ fontSize: 20, lineHeight: 1 }}>{player.name}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: player.accent, marginTop: 4 }}>
          ● {isMe ? 'JOGA POR VOCÊ' : 'OPONENTE'} · CARTA: {player.card.toUpperCase()}
        </div>
      </div>
      <HPInline hp={player.hp} hpMax={player.hpMax} accent={player.accent} />
    </div>
  );
}

function HPInline({ hp, hpMax, accent }) {
  const pct = hp / hpMax;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>HP</div>
      <div style={{ width: 140, height: 8, background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: `${pct * 100}%`, height: '100%', background: accent, boxShadow: `0 0 12px ${accent}` }} />
      </div>
      <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: accent, minWidth: 50 }}>
        {hp}<span style={{ color: 'var(--ink-4)', fontSize: 10 }}>/{hpMax}</span>
      </div>
    </div>
  );
}

// ============================================================
// PHASE SWITCHER — protótipo-only
// ============================================================
function PhaseSwitcher({ phase, setPhase, mg }) {
  const phases = [
    { id: 'ready',  label: 'READY',  hint: '3 · 2 · 1' },
    { id: 'play',   label: 'PLAY',   hint: 'em jogo' },
    { id: 'result', label: 'RESULT', hint: mg.winner === 'me' ? 'você venceu' : 'oponente venceu' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 76, left: '50%', transform: 'translateX(-50%)',
      zIndex: 900,
      display: 'flex', gap: 6, alignItems: 'center',
      background: 'rgba(15, 12, 10, 0.92)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--line-2)',
      borderRadius: 999,
      padding: 6,
      boxShadow: 'var(--shadow-md)',
    }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)', padding: '0 10px' }}>
        FASE
      </div>
      {phases.map(p => (
        <button key={p.id} onClick={() => setPhase(p.id)} style={{
          height: 30, padding: '0 14px', borderRadius: 999,
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.14em',
          background: phase === p.id ? 'var(--gold-soft)' : 'transparent',
          color: phase === p.id ? 'var(--gold)' : 'var(--ink-3)',
          border: phase === p.id ? '1px solid var(--gold)' : '1px solid transparent',
          transition: 'all var(--dur-fast) var(--ease-out)',
        }}>
          {p.label}
          <span style={{ color: 'var(--ink-4)', marginLeft: 6, fontWeight: 400 }}>· {p.hint}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// READY PHASE (shared)
// ============================================================
function MGReady({ mg }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div className="eyebrow" style={{ color: mg.accent, marginBottom: 24, fontSize: 12 }}>
        ◆◆◆ MINIGAME EM 3 SEGUNDOS ◆◆◆
      </div>
      <div className="display" style={{
        fontSize: 96, lineHeight: 0.9,
        background: `linear-gradient(180deg, var(--ink-1), ${mg.accent})`,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: 16,
      }}>
        {mg.name}
      </div>
      <div style={{ fontSize: 18, color: 'var(--ink-2)', maxWidth: 560, margin: '0 auto 40px' }}>
        {mg.desc}
      </div>

      {/* countdown ring */}
      <div style={{
        width: 200, height: 200, margin: '0 auto',
        borderRadius: '50%',
        border: `3px solid ${mg.accent}`,
        boxShadow: `0 0 48px ${mg.accent}66, inset 0 0 32px ${mg.accent}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div className="display" style={{
          fontSize: 140, lineHeight: 1, color: mg.accent,
          textShadow: `0 0 24px ${mg.accent}`,
        }}>3</div>
        <div style={{
          position: 'absolute', inset: -12,
          borderRadius: '50%',
          border: `1px dashed ${mg.accent}`,
          opacity: 0.4,
          animation: 'mg-spin 8s linear infinite',
        }} />
      </div>

      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.2em', color: 'var(--ink-4)', marginTop: 32 }}>
        ► PREPARA · {mg.type.toUpperCase()} · BOA SORTE
      </div>

      <style>{`@keyframes mg-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ============================================================
// RESULT PHASE (shared)
// ============================================================
function MGResult({ mg }) {
  const youWin = mg.winner === 'me';
  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div className="eyebrow" style={{
        color: youWin ? 'var(--emerald)' : 'var(--crimson)',
        marginBottom: 16, fontSize: 12,
      }}>
        ◆ MINIGAME ENCERRADO ◆
      </div>
      <div className="display" style={{
        fontSize: 140, lineHeight: 0.9,
        color: youWin ? 'var(--emerald)' : 'var(--crimson)',
        textShadow: `0 0 48px ${youWin ? 'rgba(138,226,52,0.5)' : 'rgba(255,61,90,0.5)'}`,
        marginBottom: 16,
      }}>
        {youWin ? 'VITÓRIA' : 'DERROTA'}
      </div>
      <div style={{
        fontSize: 18, color: 'var(--ink-2)', maxWidth: 560, margin: '0 auto 40px',
        fontFamily: 'var(--font-display-2)', fontWeight: 600,
      }}>
        {youWin ? 'Manda bala. ' : 'Levou. '}{mg.verdict}.
      </div>

      {/* scoreboard */}
      <div style={{
        display: 'inline-flex', gap: 0, alignItems: 'stretch',
        background: 'var(--surface-2)', border: '1px solid var(--line-2)',
        borderRadius: 14, overflow: 'hidden', minWidth: 480,
      }}>
        <ResultSlot player={PLAYERS.me} winner={mg.winner === 'me'} mg={mg} side="me" />
        <div style={{ width: 1, background: 'var(--line-2)' }} />
        <ResultSlot player={PLAYERS.opp} winner={mg.winner === 'opp'} mg={mg} side="opp" />
      </div>

      <div style={{ marginTop: 32, display: 'inline-flex', gap: 12 }}>
        <button className="btn btn-ghost btn-sm">Revanche</button>
        <button className="btn btn-primary">Continuar partida →</button>
      </div>
    </div>
  );
}

function ResultSlot({ player, winner, mg, side }) {
  // Mock score per minigame
  const scores = {
    teclado:   { me: '4/4 · 0.94s', opp: '3/4 · 1.20s' },
    choro:     { me: '64% (alvo 67%)', opp: '69% (alvo 67%)' },
    reacao:    { me: '187ms', opp: '232ms' },
    clique:    { me: '42 cliques', opp: '36 cliques' },
    blefe:     { me: '3', opp: '5' },
    paridade:  { me: '7 · PAR', opp: '8 · ÍMPAR' },
    mira:      { me: '3/3 · 4.2s', opp: '2/3' },
    jokenpo:   { me: '1 round', opp: '2 rounds' },
  };
  return (
    <div style={{
      flex: 1, padding: '24px 28px', textAlign: 'left',
      background: winner ? 'rgba(138,226,52,0.06)' : 'transparent',
      borderTop: winner ? '2px solid var(--emerald)' : '2px solid transparent',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>
          {side === 'me' ? 'VOCÊ' : 'OPONENTE'}
        </div>
        {winner && (
          <span className="pill pill-emerald" style={{ background: 'rgba(138,226,52,0.18)' }}>VENCEDOR</span>
        )}
      </div>
      <div className="display" style={{ fontSize: 28, marginBottom: 4 }}>{player.name}</div>
      <div className="mono" style={{ fontSize: 12, color: winner ? 'var(--emerald)' : 'var(--ink-3)', letterSpacing: '0.04em' }}>
        {scores[mg.id]?.[side] || '—'}
      </div>
    </div>
  );
}

// ============================================================
// PLAY ROUTER
// ============================================================
function MGPlay({ mg }) {
  switch (mg.id) {
    case 'teclado':  return <PlayTecladoQuente mg={mg} />;
    case 'choro':    return <PlaySeguraOChoro mg={mg} />;
    case 'reacao':   return <PlayReacaoPura mg={mg} />;
    case 'clique':   return <PlayCliqueFrenetico mg={mg} />;
    case 'blefe':    return <PlayBlefe mg={mg} />;
    case 'paridade': return <PlayParOuImpar mg={mg} />;
    case 'mira':     return <PlayMiraLouca mg={mg} />;
    case 'jokenpo':  return <PlayJokenpo mg={mg} />;
    default: return null;
  }
}

// Stage wrapper para todos os play states
function PlayStage({ mg, label, timer, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="display" style={{ fontSize: 32, color: mg.accent }}>{mg.name}</div>
        {timer && (
          <span className="pill" style={{ background: `${mg.accent}22`, color: mg.accent, border: `1px solid ${mg.accent}55` }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: mg.accent, animation: 'mg-pulse 0.8s infinite' }} />
            {timer}
          </span>
        )}
        {label && (
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>{label}</div>
        )}
      </div>
      {children}
      <style>{`
        @keyframes mg-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes mg-pulse-soft { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.04); } }
        @keyframes mg-slide-x { 0%, 100% { left: 0%; } 50% { left: 100%; } }
        @keyframes mg-target-move { 0%   { left: 12%; top: 22%; } 25%  { left: 78%; top: 35%; } 50%  { left: 56%; top: 70%; } 75%  { left: 22%; top: 58%; } 100% { left: 12%; top: 22%; } }
        @keyframes mg-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.2; } }
        @keyframes mg-key-fall { 0% { transform: translateY(-8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ============================================================
// 1 · TECLADO QUENTE
// ============================================================
function PlayTecladoQuente({ mg }) {
  const seq = ['Q', 'W', 'A', 'S'];
  const oppTyped = 2;
  const meTyped  = 3;
  return (
    <PlayStage mg={mg} timer="1.50s" label="DIGITA A SEQUÊNCIA — RÁPIDO">
      {/* sequência alvo */}
      <div style={{ display: 'flex', gap: 12 }}>
        {seq.map((k, i) => (
          <KeyCap key={i} letter={k} highlight />
        ))}
      </div>

      {/* timer bar */}
      <div style={{ width: 480, height: 4, background: 'var(--bg-2)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ width: '42%', height: '100%', background: mg.accent, boxShadow: `0 0 12px ${mg.accent}` }} />
      </div>

      {/* duas trilhas — oponente em cima, você embaixo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 540 }}>
        <PlayerTrack name="Pepao" side="opp" accent="var(--crimson)">
          <div style={{ display: 'flex', gap: 8 }}>
            {seq.map((k, i) => (
              <KeyCap key={i} letter={k} small state={i < oppTyped ? 'ok' : 'pending'} />
            ))}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--crimson)', letterSpacing: '0.14em' }}>{oppTyped}/4</div>
        </PlayerTrack>
        <PlayerTrack name="Você" side="me" accent="var(--gold)">
          <div style={{ display: 'flex', gap: 8 }}>
            {seq.map((k, i) => (
              <KeyCap key={i} letter={k} small state={i < meTyped ? 'ok' : i === meTyped ? 'next' : 'pending'} />
            ))}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.14em' }}>{meTyped}/4</div>
        </PlayerTrack>
      </div>
    </PlayStage>
  );
}

function KeyCap({ letter, small, highlight, state = 'idle' }) {
  const colors = {
    idle:    { bg: 'var(--surface-2)', border: 'var(--line-2)',  ink: 'var(--ink-1)', glow: 'none' },
    ok:      { bg: 'var(--gold-soft)', border: 'var(--gold)',     ink: 'var(--gold)',  glow: '0 0 16px var(--gold-glow)' },
    next:    { bg: 'var(--surface-3)', border: 'var(--gold)',     ink: 'var(--gold)',  glow: `0 0 0 3px var(--gold-soft)` },
    pending: { bg: 'var(--bg-2)',      border: 'var(--line-1)',   ink: 'var(--ink-4)', glow: 'none' },
  };
  const c = colors[state] || colors.idle;
  const size = small ? 44 : 72;
  return (
    <div style={{
      width: size, height: size,
      background: highlight ? 'linear-gradient(180deg, var(--surface-3), var(--surface-2))' : c.bg,
      border: `2px solid ${highlight ? 'var(--gold)' : c.border}`,
      borderRadius: small ? 8 : 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontWeight: 700, fontSize: small ? 18 : 32,
      color: highlight ? 'var(--gold)' : c.ink,
      boxShadow: highlight
        ? '0 4px 0 rgba(0,0,0,0.4), inset 0 -3px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 24px var(--gold-glow)'
        : c.glow,
      transition: 'all var(--dur-fast) var(--ease-out)',
      animation: state === 'next' ? 'mg-pulse-soft 0.6s infinite' : 'none',
    }}>{letter}</div>
  );
}

function PlayerTrack({ name, side, accent, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 14px',
      background: side === 'me' ? 'rgba(255,201,60,0.04)' : 'rgba(255,61,90,0.04)',
      border: `1px solid ${side === 'me' ? 'var(--line-gold)' : 'var(--crimson-soft)'}`,
      borderRadius: 10,
    }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: accent, minWidth: 64 }}>
        {side === 'me' ? '▶' : '◀'} {name.toUpperCase()}
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// 2 · SEGURA O CHORO
// ============================================================
function PlaySeguraOChoro({ mg }) {
  return (
    <PlayStage mg={mg} label="PARA A BARRA NA ZONA DOURADA">
      {/* bar */}
      <div style={{ width: 720, position: 'relative' }}>
        {/* tick scale */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {[0, 25, 50, 75, 100].map(n => (
            <div key={n} className="mono" style={{ fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>{n}</div>
          ))}
        </div>
        <div style={{
          width: '100%', height: 56, background: 'var(--bg-2)',
          border: '1px solid var(--line-2)', borderRadius: 8,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* tick marks */}
          {Array.from({ length: 21 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', top: 0, bottom: 0, left: `${(i / 20) * 100}%`,
              width: 1, background: 'var(--line-1)',
            }} />
          ))}
          {/* target zone 60-72% */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0,
            left: '60%', width: '12%',
            background: 'var(--gold-soft)',
            borderLeft: '2px solid var(--gold)', borderRight: '2px solid var(--gold)',
            boxShadow: 'inset 0 0 16px var(--gold-glow)',
          }} />
          {/* moving indicator */}
          <div style={{
            position: 'absolute', top: -4, bottom: -4, width: 4,
            background: 'var(--ink-1)',
            boxShadow: '0 0 16px var(--ink-1)',
            animation: 'mg-slide-x 1.2s var(--ease-in-out) infinite alternate',
            transform: 'translateX(-2px)',
          }} />
          {/* opp stopped marker — 47% */}
          <Marker pct={47} label="Pepao" color="var(--crimson)" side="top" />
          {/* my hover marker — 66% */}
          <Marker pct={66} label="Você" color="var(--gold)" side="bottom" />
        </div>
      </div>

      {/* PARA buttons */}
      <div style={{ display: 'flex', gap: 32 }}>
        <ParaButton name="Pepao" accent="var(--crimson)" pressed at="47%" />
        <ParaButton name="Você" accent="var(--gold)" pressed={false} prompt="ESPACE PARA PARAR" />
      </div>
    </PlayStage>
  );
}

function Marker({ pct, label, color, side }) {
  const top = side === 'top';
  return (
    <div style={{
      position: 'absolute', left: `${pct}%`,
      [top ? 'top' : 'bottom']: '-22px',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      {!top && <div style={{ width: 2, height: 14, background: color }} />}
      <div className="mono" style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
        padding: '2px 6px', background: 'var(--bg)', border: `1px solid ${color}`,
        color, borderRadius: 4,
      }}>{label.toUpperCase()} · {pct}%</div>
      {top && <div style={{ width: 2, height: 14, background: color }} />}
    </div>
  );
}

function ParaButton({ name, accent, pressed, at, prompt }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-4)', marginBottom: 6 }}>
        {name.toUpperCase()}
      </div>
      <button style={{
        height: 64, padding: '0 36px',
        background: pressed ? `${accent}33` : accent,
        border: `2px solid ${accent}`,
        color: pressed ? accent : 'var(--bg)',
        fontFamily: 'var(--font-display)',
        fontSize: 28, letterSpacing: '0.04em',
        borderRadius: 12,
        boxShadow: pressed ? 'none' : `0 6px 0 rgba(0,0,0,0.3), 0 0 24px ${accent}55`,
        cursor: pressed ? 'default' : 'pointer',
        opacity: pressed ? 0.6 : 1,
      }}>
        {pressed ? `PAROU · ${at}` : 'PARA!'}
      </button>
      {prompt && (
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-3)', marginTop: 8 }}>
          {prompt}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 3 · REAÇÃO PURA
// ============================================================
function PlayReacaoPura({ mg }) {
  return (
    <PlayStage mg={mg} label="QUANDO FICAR VERDE — APERTA">
      <div style={{
        width: 720, height: 320,
        background: 'var(--emerald)',
        borderRadius: 20,
        boxShadow: '0 0 80px rgba(138,226,52,0.6), inset 0 0 80px rgba(0,0,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        animation: 'mg-pulse-soft 0.5s ease-out infinite',
      }}>
        <div className="display" style={{ fontSize: 180, color: 'var(--bg)', textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>
          VAI!
        </div>
        {/* corner timer */}
        <div className="mono" style={{
          position: 'absolute', top: 16, left: 16,
          fontSize: 11, letterSpacing: '0.18em',
          padding: '6px 10px', background: 'rgba(10,9,8,0.7)', borderRadius: 4,
          color: 'var(--emerald)',
        }}>
          ⏱ 187 ms
        </div>
      </div>

      {/* RTs board */}
      <div style={{ display: 'flex', gap: 24 }}>
        <RTCard name="Você" accent="var(--gold)" rt={187} hit />
        <RTCard name="Pepao" accent="var(--crimson)" rt={null} hit={false} />
      </div>

      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-3)' }}>
        ◆ apertar antes da hora = penalidade ◆
      </div>
    </PlayStage>
  );
}

function RTCard({ name, accent, rt, hit }) {
  return (
    <div style={{
      width: 200, padding: 16,
      background: hit ? `${accent}11` : 'var(--surface-2)',
      border: `1px solid ${hit ? accent : 'var(--line-2)'}`,
      borderRadius: 10,
      textAlign: 'center',
    }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-4)', marginBottom: 6 }}>
        {name.toUpperCase()}
      </div>
      <div className="display" style={{ fontSize: 36, color: hit ? accent : 'var(--ink-3)' }}>
        {hit ? `${rt}` : '—'}
        <span style={{ fontSize: 14, color: 'var(--ink-4)', marginLeft: 4 }}>{hit ? 'ms' : ''}</span>
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: hit ? accent : 'var(--ink-4)', marginTop: 6 }}>
        {hit ? '● APERTOU' : '○ AGUARDANDO'}
      </div>
    </div>
  );
}

// ============================================================
// 4 · CLIQUE FRENÉTICO
// ============================================================
function PlayCliqueFrenetico({ mg }) {
  return (
    <PlayStage mg={mg} timer="2.4s restantes" label="MAIS CLIQUES VENCE">
      {/* timer ring */}
      <CountdownRing total={5} remaining={2.4} accent={mg.accent} />

      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-end' }}>
        <ClickPad name="Pepao" accent="var(--crimson)" count={36} />
        <div className="display" style={{ fontSize: 48, color: 'var(--ink-3)', alignSelf: 'center' }}>VS</div>
        <ClickPad name="Você" accent="var(--gold)" count={42} highlight />
      </div>
    </PlayStage>
  );
}

function CountdownRing({ total, remaining, accent }) {
  const pct = remaining / total;
  const r = 60, c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 140, height: 140 }}>
      <svg width={140} height={140} viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--line-2)" strokeWidth="6" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={accent} strokeWidth="6"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div className="display" style={{ fontSize: 42, color: accent, lineHeight: 1 }}>{remaining.toFixed(1)}</div>
        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>SEGUNDOS</div>
      </div>
    </div>
  );
}

function ClickPad({ name, accent, count, highlight }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)', marginBottom: 8 }}>
        {name.toUpperCase()}
      </div>
      <div className="display" style={{ fontSize: 80, lineHeight: 0.9, color: accent, marginBottom: 8, textShadow: highlight ? `0 0 24px ${accent}` : 'none' }}>
        {count}
      </div>
      <button style={{
        width: 200, height: 200, borderRadius: '50%',
        background: `radial-gradient(circle, ${accent} 0%, ${accent}99 100%)`,
        border: `3px solid ${accent}`,
        color: 'var(--bg)',
        fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '0.04em',
        boxShadow: `0 8px 0 rgba(0,0,0,0.3), 0 0 48px ${accent}66`,
        cursor: 'pointer',
        animation: highlight ? 'mg-pulse-soft 0.4s infinite' : 'none',
      }}>
        CLICAR
      </button>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-3)', marginTop: 10 }}>
        {highlight ? 'BARRA DE ESPAÇO' : 'OUTRO PLAYER'}
      </div>
    </div>
  );
}

// ============================================================
// 5 · BLEFE
// ============================================================
function PlayBlefe({ mg }) {
  return (
    <PlayStage mg={mg} label="ESCOLHA 1 A 5 — EM SEGREDO">
      <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
        <BlefeCard name="Pepao" accent="var(--crimson)" chosen />
        <div className="display" style={{ fontSize: 64, color: 'var(--ink-3)' }}>?</div>
        <BlefeCard name="Você" accent="var(--gold)" chosen={false} />
      </div>

      {/* keypad pra você */}
      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--gold)', marginBottom: 12 }}>
          ▶ ESCOLHE SEU NÚMERO
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[1, 2, 3, 4, 5].map(n => (
            <KeypadBtn key={n} value={n} selected={n === 3} accent="var(--gold)" />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="pill pill-crimson">PEPAO: BLOQUEADO</span>
        <span className="pill pill-gold">VOCÊ: 3 (PROVISÓRIO)</span>
      </div>
    </PlayStage>
  );
}

function BlefeCard({ name, accent, chosen }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)', marginBottom: 8 }}>
        {name.toUpperCase()}
      </div>
      <div style={{
        width: 160, height: 220,
        background: chosen
          ? `linear-gradient(160deg, ${accent}, var(--bg-2) 80%)`
          : 'linear-gradient(160deg, var(--surface-3), var(--surface-2))',
        border: `2px solid ${chosen ? accent : 'var(--line-2)'}`,
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        boxShadow: chosen ? `0 12px 32px -8px ${accent}66` : 'var(--shadow-md)',
      }}>
        <div className="display" style={{
          fontSize: 120, color: chosen ? 'rgba(0,0,0,0.7)' : 'var(--ink-3)',
          textShadow: chosen ? '0 4px 0 rgba(0,0,0,0.2)' : 'none',
        }}>?</div>
        {/* decoração */}
        <div style={{
          position: 'absolute', inset: 8,
          border: `1px dashed ${chosen ? 'rgba(0,0,0,0.3)' : 'var(--line-2)'}`,
          borderRadius: 8,
        }} />
        <div className="mono" style={{
          position: 'absolute', top: 12, left: 12,
          fontSize: 9, letterSpacing: '0.18em',
          color: chosen ? 'rgba(0,0,0,0.5)' : 'var(--ink-4)',
        }}>BLEFE</div>
        <div className="mono" style={{
          position: 'absolute', bottom: 12, right: 12,
          fontSize: 9, letterSpacing: '0.18em',
          color: chosen ? 'rgba(0,0,0,0.5)' : 'var(--ink-4)',
        }}>1-5</div>
      </div>
      <div className="mono" style={{
        fontSize: 10, letterSpacing: '0.14em',
        color: chosen ? 'var(--emerald)' : 'var(--ink-4)', marginTop: 10,
      }}>
        {chosen ? '● ESCOLHIDO' : '○ PENDENTE'}
      </div>
    </div>
  );
}

function KeypadBtn({ value, selected, accent }) {
  return (
    <button style={{
      width: 56, height: 56,
      background: selected ? accent : 'var(--surface-2)',
      border: `2px solid ${selected ? accent : 'var(--line-2)'}`,
      borderRadius: 10,
      fontFamily: 'var(--font-display)', fontSize: 28,
      color: selected ? 'var(--bg)' : 'var(--ink-1)',
      boxShadow: selected ? `0 0 24px ${accent}66` : 'none',
      cursor: 'pointer',
      transition: 'all var(--dur-fast) var(--ease-out)',
    }}>{value}</button>
  );
}

// ============================================================
// 6 · PAR OU ÍMPAR
// ============================================================
function PlayParOuImpar({ mg }) {
  return (
    <PlayStage mg={mg} label="APOSTAS FEITAS · DIGITA SEU NÚMERO">
      {/* bets row */}
      <div style={{ display: 'flex', gap: 16 }}>
        <BetTag name="Pepao" accent="var(--crimson)" bet="ÍMPAR" />
        <div className="display" style={{ fontSize: 32, color: 'var(--ink-3)', alignSelf: 'center' }}>VS</div>
        <BetTag name="Você" accent="var(--gold)" bet="PAR" highlight />
      </div>

      {/* keypad 1-10 */}
      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--gold)', marginBottom: 12 }}>
          ▶ SEU NÚMERO (1 - 10)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 56px)', gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
            <KeypadBtn key={n} value={n} selected={n === 4} accent="var(--mint)" />
          ))}
        </div>
      </div>

      {/* equation */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 24px',
        background: 'var(--surface-2)', border: '1px solid var(--line-2)',
        borderRadius: 12,
        fontFamily: 'var(--font-display)', fontSize: 32,
      }}>
        <span style={{ color: 'var(--gold)' }}>4</span>
        <span style={{ color: 'var(--ink-3)' }}>+</span>
        <span style={{ color: 'var(--crimson)' }}>?</span>
        <span style={{ color: 'var(--ink-3)' }}>=</span>
        <span style={{ color: 'var(--ink-4)' }}>?</span>
        <span className="mono" style={{ fontSize: 11, letterSpacing: '0.16em', color: 'var(--ink-3)', marginLeft: 12 }}>
          AGUARDANDO PEPAO
        </span>
      </div>
    </PlayStage>
  );
}

function BetTag({ name, accent, bet, highlight }) {
  return (
    <div style={{
      padding: 16, minWidth: 220,
      background: highlight ? `${accent}11` : 'var(--surface-2)',
      border: `2px solid ${highlight ? accent : 'var(--line-2)'}`,
      borderRadius: 14,
      textAlign: 'center',
      boxShadow: highlight ? `0 0 24px ${accent}33` : 'none',
    }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-4)', marginBottom: 6 }}>
        {name.toUpperCase()}
      </div>
      <div className="display" style={{ fontSize: 40, color: accent, lineHeight: 1 }}>
        {bet}
      </div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-4)', marginTop: 6 }}>
        APOSTA BLOQUEADA
      </div>
    </div>
  );
}

// ============================================================
// 7 · MIRA LOUCA
// ============================================================
function PlayMiraLouca({ mg }) {
  return (
    <PlayStage mg={mg} label="ALVO MOVENDO · 3 HITS VENCEM">
      {/* hit counter top */}
      <div style={{ display: 'flex', gap: 64, alignItems: 'center' }}>
        <HitDots name="Pepao" accent="var(--crimson)" hits={1} />
        <HitDots name="Você" accent="var(--gold)" hits={2} highlight />
      </div>

      {/* scope stage */}
      <div style={{
        width: 720, height: 360,
        background: `
          radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%),
          linear-gradient(180deg, var(--bg-2), var(--bg))
        `,
        border: `2px solid var(--line-2)`,
        borderRadius: 14,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(var(--line-1) 1px, transparent 1px),
            linear-gradient(90deg, var(--line-1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.3,
        }} />
        {/* crosshair lines */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--crimson)', opacity: 0.3 }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: 'var(--crimson)', opacity: 0.3 }} />

        {/* target — animated */}
        <div style={{
          position: 'absolute', width: 64, height: 64,
          animation: 'mg-target-move 3.4s var(--ease-in-out) infinite',
          transform: 'translate(-50%, -50%)',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3px solid var(--crimson)',
            boxShadow: '0 0 24px var(--crimson)',
          }} />
          <div style={{
            position: 'absolute', inset: 14, borderRadius: '50%',
            border: '2px solid var(--crimson)',
            opacity: 0.5,
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--crimson)',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 12px var(--crimson)',
          }} />
        </div>

        {/* HUD reticle */}
        <div className="mono" style={{ position: 'absolute', top: 12, left: 12, fontSize: 9, letterSpacing: '0.16em', color: 'var(--crimson)' }}>
          ◎ SCOPE · 4.2s
        </div>
        <div className="mono" style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-3)' }}>
          CLICK TO FIRE
        </div>

        {/* recent hit ping */}
        <div style={{
          position: 'absolute', left: '24%', top: '38%',
          width: 32, height: 32, borderRadius: '50%',
          border: '2px solid var(--emerald)',
          opacity: 0.5,
        }} />
        <div style={{
          position: 'absolute', left: '24%', top: '38%',
          transform: 'translate(-50%, -50%)',
          width: 4, height: 4, borderRadius: '50%',
          background: 'var(--emerald)',
        }} />
      </div>
    </PlayStage>
  );
}

function HitDots({ name, accent, hits, highlight }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)', marginBottom: 6 }}>
        {name.toUpperCase()}
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{
            width: 20, height: 20, borderRadius: '50%',
            background: i < hits ? accent : 'transparent',
            border: `2px solid ${i < hits ? accent : 'var(--line-2)'}`,
            boxShadow: i < hits && highlight ? `0 0 12px ${accent}` : 'none',
          }} />
        ))}
      </div>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: accent, marginTop: 6 }}>
        {hits}/3
      </div>
    </div>
  );
}

// ============================================================
// 8 · PEDRA PAPEL TESOURA
// ============================================================
function PlayJokenpo({ mg }) {
  return (
    <PlayStage mg={mg} label="MELHOR DE 3 · ROUND 2/3">
      {/* round indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <RoundDot state="me" />
        <RoundDot state="active" />
        <RoundDot state="pending" />
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-3)', marginLeft: 8 }}>
          VOCÊ 1 · PEPAO 0
        </div>
      </div>

      {/* dueling cards */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <JokenpoCard name="Pepao" accent="var(--crimson)" pick={null} side="opp" />
        <div className="display" style={{ fontSize: 80, color: mg.accent, textShadow: `0 0 32px ${mg.accent}` }}>VS</div>
        <JokenpoCard name="Você" accent="var(--gold)" pick="papel" side="me" />
      </div>

      {/* picker */}
      <div style={{ textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)', marginBottom: 12 }}>
          ◆ TROCA TUA ESCOLHA ATÉ O TIMER ZERAR ◆
        </div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <JokenpoPickBtn label="PEDRA" selected={false} />
          <JokenpoPickBtn label="PAPEL" selected={true} />
          <JokenpoPickBtn label="TESOURA" selected={false} />
        </div>
      </div>
    </PlayStage>
  );
}

function RoundDot({ state }) {
  const styles = {
    me:      { bg: 'var(--gold)', border: 'var(--gold)', glow: '0 0 12px var(--gold-glow)' },
    opp:     { bg: 'var(--crimson)', border: 'var(--crimson)', glow: '0 0 12px var(--crimson-glow)' },
    active:  { bg: 'transparent', border: 'var(--ink-1)', glow: 'none', animation: 'mg-pulse-soft 0.6s infinite' },
    pending: { bg: 'transparent', border: 'var(--line-2)', glow: 'none' },
  };
  const s = styles[state];
  return (
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      background: s.bg, border: `2px solid ${s.border}`,
      boxShadow: s.glow,
      animation: s.animation || 'none',
    }} />
  );
}

function JokenpoCard({ name, accent, pick, side }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)', marginBottom: 8 }}>
        {name.toUpperCase()}
      </div>
      <div style={{
        width: 200, height: 240,
        background: pick
          ? `linear-gradient(180deg, ${accent}22, var(--surface-2))`
          : 'linear-gradient(180deg, var(--surface-3), var(--surface-2))',
        border: `2px solid ${pick ? accent : 'var(--line-2)'}`,
        borderRadius: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: pick ? `0 16px 40px -12px ${accent}88` : 'var(--shadow-md)',
        position: 'relative',
      }}>
        {pick ? (
          <>
            <div style={{ fontSize: 60, lineHeight: 1, marginBottom: 8 }}>
              <JokenpoShape kind={pick} accent={accent} />
            </div>
            <div className="display" style={{ fontSize: 22, color: accent, letterSpacing: '0.05em' }}>
              {pick.toUpperCase()}
            </div>
          </>
        ) : (
          <>
            <div className="display" style={{ fontSize: 120, color: 'var(--ink-3)', lineHeight: 1 }}>?</div>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)', marginTop: 8 }}>
              ESCOLHENDO
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function JokenpoShape({ kind, accent }) {
  // SVG icons sem emoji
  if (kind === 'pedra') return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <defs><radialGradient id="rock" cx="0.35" cy="0.35"><stop offset="0" stopColor={accent} stopOpacity="0.9" /><stop offset="1" stopColor={accent} stopOpacity="0.3" /></radialGradient></defs>
      <circle cx="32" cy="34" r="22" fill="url(#rock)" stroke={accent} strokeWidth="2" />
      <circle cx="26" cy="28" r="4" fill={accent} opacity="0.5" />
    </svg>
  );
  if (kind === 'papel') return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke={accent} strokeWidth="2.5">
      <path d="M 12 14 L 44 14 L 52 22 L 52 52 L 12 52 Z" fill={`${accent}22`} />
      <path d="M 44 14 L 44 22 L 52 22" />
      <line x1="18" y1="30" x2="46" y2="30" opacity="0.6" />
      <line x1="18" y1="38" x2="46" y2="38" opacity="0.6" />
      <line x1="18" y1="46" x2="38" y2="46" opacity="0.6" />
    </svg>
  );
  if (kind === 'tesoura') return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="18" cy="46" r="8" fill={`${accent}22`} />
      <circle cx="46" cy="46" r="8" fill={`${accent}22`} />
      <line x1="24" y1="40" x2="50" y2="14" />
      <line x1="40" y1="40" x2="14" y2="14" />
    </svg>
  );
  return null;
}

function JokenpoPickBtn({ label, selected }) {
  const key = label.toLowerCase();
  return (
    <button style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '14px 22px',
      background: selected ? 'var(--gold-soft)' : 'var(--surface-2)',
      border: `2px solid ${selected ? 'var(--gold)' : 'var(--line-2)'}`,
      borderRadius: 12,
      color: selected ? 'var(--gold)' : 'var(--ink-2)',
      fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.04em',
      cursor: 'pointer',
      boxShadow: selected ? '0 0 24px var(--gold-glow)' : 'none',
      transition: 'all var(--dur-fast) var(--ease-out)',
    }}>
      <JokenpoShape kind={key} accent={selected ? 'var(--gold)' : 'var(--ink-3)'} />
      {label}
    </button>
  );
}

// ============================================================
// REGISTER
// ============================================================
window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.minigames = MinigamesScreen;
