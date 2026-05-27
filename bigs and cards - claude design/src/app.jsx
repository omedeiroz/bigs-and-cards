/* eslint-disable */
// ============================================================
// Prototype shell — handles screen navigation + variant switching.
// Renders a top nav bar (screens), and each screen renders its
// own variant switcher inside (passed via props).
// ============================================================

const { useState, useEffect, useRef, useMemo } = React;

const SCREENS = [
  { id: 'auth',       label: 'Login / Cadastro',  variants: ['A', 'B'] },
  { id: 'home',       label: 'Home',              variants: ['A', 'B'] },
  { id: 'roster',     label: 'Cartas',            variants: ['A', 'B'] },
  { id: 'card-detail',label: 'Carta — detalhe',   variants: ['Tipográfica', 'Foto overlay', 'Dupla-face'] },
  { id: 'friends',    label: 'Amigos',            variants: ['A', 'B'] },
  { id: 'challenges', label: 'Desafios',          variants: ['A', 'B'] },
  { id: 'lobby',      label: 'Lobby',             variants: ['A', 'B'] },
  { id: 'match',      label: 'Partida',           variants: ['Clássico', 'Split', 'Compacto'] },
  { id: 'end',        label: 'Fim de partida',    variants: ['Vitória', 'Derrota'] },
  { id: 'profile',    label: 'Perfil / Histórico',variants: ['A', 'B'] },
  { id: 'minigames',  label: 'Minigames',         variants: ['Teclado Quente', 'Segura o Choro', 'Reação Pura', 'Clique Frenético', 'Blefe', 'Par ou Ímpar', 'Mira Louca', 'Pedra Papel Tesoura'] },
];

function getInitialHash() {
  const h = window.location.hash.replace(/^#/, '');
  const [screen, variant] = h.split('/');
  return { screen: screen || 'auth', variantIdx: parseInt(variant) || 0 };
}

function App() {
  const init = getInitialHash();
  const [screenId, setScreenId] = useState(init.screen);
  const [variantIdx, setVariantIdx] = useState(init.variantIdx);
  const [navOpen, setNavOpen] = useState(false);
  const [detailCard, setDetailCard] = useState(null); // for the card detail modal opened from elsewhere

  // Persist via hash
  useEffect(() => {
    window.location.hash = `${screenId}/${variantIdx}`;
  }, [screenId, variantIdx]);

  // React to back/forward
  useEffect(() => {
    const onHash = () => {
      const { screen, variantIdx } = getInitialHash();
      setScreenId(screen);
      setVariantIdx(variantIdx);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const screen = SCREENS.find(s => s.id === screenId) || SCREENS[0];

  const ScreenComponent = window.SCREEN_COMPONENTS?.[screenId];

  const goToScreen = (id, v = 0) => {
    setScreenId(id);
    setVariantIdx(v);
    setNavOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }} data-screen-label={`${SCREENS.findIndex(s=>s.id===screenId)+1} ${screen.label}`}>
      {/* Floating proto-nav */}
      <ProtoNav
        screens={SCREENS}
        currentScreen={screen}
        variantIdx={variantIdx}
        onScreenChange={(id) => goToScreen(id, 0)}
        onVariantChange={setVariantIdx}
        navOpen={navOpen}
        setNavOpen={setNavOpen}
      />

      {/* Active screen */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {ScreenComponent ? (
          <ScreenComponent
            variantIdx={variantIdx}
            goToScreen={goToScreen}
            openCardDetail={(card) => setDetailCard(card)}
          />
        ) : (
          <PlaceholderScreen label={screen.label} />
        )}
      </main>

      {/* Card detail modal (global) */}
      {detailCard && window.CardDetailModal && (
        <window.CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />
      )}
    </div>
  );
}

// ============================================================
// Proto-nav (floating bottom bar)
// ============================================================
function ProtoNav({ screens, currentScreen, variantIdx, onScreenChange, onVariantChange, navOpen, setNavOpen }) {
  const idx = screens.findIndex(s => s.id === currentScreen.id);
  return (
    <div style={{
      position: 'fixed',
      bottom: 16, left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      background: 'rgba(15, 12, 10, 0.92)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--line-2)',
      borderRadius: 999,
      padding: 6,
      boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-sans)',
    }}>
      <button
        onClick={() => setNavOpen(o => !o)}
        style={{
          height: 36, padding: '0 14px',
          borderRadius: 999,
          background: navOpen ? 'var(--gold)' : 'var(--surface-3)',
          color: navOpen ? 'var(--ink-on-gold)' : 'var(--ink-1)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}
        title="Lista de telas"
      >
        <span style={{ opacity: 0.5 }}>{String(idx + 1).padStart(2,'0')}/{screens.length}</span>
        <span>{currentScreen.label}</span>
        <span style={{ transform: navOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', display: 'inline-block' }}>▾</span>
      </button>

      {currentScreen.variants && currentScreen.variants.length > 0 && (
        <div style={{ display: 'flex', gap: 2, padding: '0 4px', borderLeft: '1px solid var(--line-2)', marginLeft: 4 }}>
          {currentScreen.variants.map((v, i) => (
            <button
              key={i}
              onClick={() => onVariantChange(i)}
              style={{
                height: 32, padding: '0 12px',
                borderRadius: 999,
                background: variantIdx === i ? 'var(--gold-soft)' : 'transparent',
                color: variantIdx === i ? 'var(--gold)' : 'var(--ink-3)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 700,
                border: variantIdx === i ? '1px solid var(--gold)' : '1px solid transparent',
                transition: 'all var(--dur-fast) var(--ease-out)',
              }}
            >{v}</button>
          ))}
        </div>
      )}

      {navOpen && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: 0, right: 0,
          background: 'rgba(15, 12, 10, 0.96)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--line-2)',
          borderRadius: 16,
          padding: 10,
          boxShadow: 'var(--shadow-lg)',
          minWidth: 380,
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', textTransform: 'uppercase', padding: '6px 10px 10px' }}>
            BIGS & CARDS · PROTÓTIPO · {screens.length} TELAS
          </div>
          {screens.map((s, i) => (
            <button
              key={s.id}
              onClick={() => onScreenChange(s.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                background: s.id === currentScreen.id ? 'var(--gold-soft)' : 'transparent',
                color: s.id === currentScreen.id ? 'var(--gold)' : 'var(--ink-2)',
                transition: 'all var(--dur-fast) var(--ease-out)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { if (s.id !== currentScreen.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
              onMouseLeave={(e) => { if (s.id !== currentScreen.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 12 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.1em' }}>{String(i+1).padStart(2,'0')}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</span>
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)', letterSpacing: '0.16em' }}>
                {s.variants.length} VAR
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Placeholder screen
// ============================================================
function PlaceholderScreen({ label }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div className="eyebrow">EM CONSTRUÇÃO</div>
      <div className="display" style={{ fontSize: 64, color: 'var(--ink-2)' }}>{label}</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.2em' }}>
        ◇  PLACEHOLDER  ◇
      </div>
    </div>
  );
}

window.App = App;
window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
