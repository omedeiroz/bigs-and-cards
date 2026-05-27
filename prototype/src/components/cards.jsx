/* eslint-disable */
// ============================================================
// Card components — 3 variants
//   - CardTypoBold: placeholder de retrato + tipografia forte
//   - CardPhotoOverlay: foto real + stats sobrepostos (FUT-ish)
//   - CardDoubleFaced: frente tipográfica, verso com retrato
// All variants take the same shape `{ card, size?, onClick?, focus?, faded? }`
// ============================================================

const { useState } = React;

// -------- shared bits --------
function CostGem({ cost, size = 36 }) {
  return (
    <div style={{
      width: size, height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)',
      fontSize: size * 0.55,
      color: '#fff',
      background: 'radial-gradient(circle at 35% 30%, #D7A5FF 0%, #B17BFF 45%, #6E3CFA 100%)',
      borderRadius: '50%',
      border: '2px solid #1A1108',
      boxShadow: '0 0 0 1.5px var(--purple), 0 4px 12px var(--purple-glow), inset 0 -3px 6px rgba(0,0,0,0.4)',
      letterSpacing: '-0.02em',
    }}>{cost}</div>
  );
}

function StatBlock({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color, lineHeight: 1, textShadow: `0 0 12px ${color}66` }}>{value}</span>
    </div>
  );
}

function rarityBadge(rarity) {
  const map = {
    'comum':  { color: 'var(--ink-3)', label: 'COMUM' },
    'raro':   { color: 'var(--sapphire)', label: 'RARO' },
    'épico':  { color: 'var(--gold)', label: 'ÉPICO' },
    'lendário': { color: 'var(--crimson)', label: 'LENDÁRIO' },
  };
  return map[rarity] || map.comum;
}

// -------- Variant 1: TypoBold (placeholder de retrato + tipo forte) --------
function CardTypoBold({ card, size = 'md', onClick, focus, faded }) {
  const sizes = {
    sm: { w: 160, h: 224, name: 24, accent: 11 },
    md: { w: 220, h: 308, name: 34, accent: 13 },
    lg: { w: 280, h: 392, name: 44, accent: 15 },
  };
  const s = sizes[size] || sizes.md;
  const rb = rarityBadge(card.rarity);

  return (
    <div onClick={onClick} style={{
      width: s.w, height: s.h,
      background: 'linear-gradient(180deg, var(--surface-2) 0%, var(--surface) 100%)',
      border: `1.5px solid ${card.rarity === 'épico' ? 'var(--gold)' : card.rarity === 'raro' ? 'var(--sapphire)' : 'var(--line-3)'}`,
      borderRadius: 'var(--r-md)',
      padding: 10,
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      cursor: onClick ? 'pointer' : 'default',
      opacity: faded ? 0.45 : 1,
      transform: focus ? 'translateY(-4px)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)',
      boxShadow: focus ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      flexShrink: 0,
    }}>
      {/* top row: cost + rarity */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <CostGem cost={card.cost} size={s.w * 0.16} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: s.accent - 2,
          letterSpacing: '0.18em', color: rb.color, textTransform: 'uppercase',
          padding: '4px 6px', border: `1px solid ${rb.color}40`, borderRadius: 3,
          background: `${rb.color}10`,
        }}>{rb.label}</span>
      </div>

      {/* portrait placeholder area with giant glyph */}
      <div style={{
        flex: 1,
        margin: '8px 0',
        background: `linear-gradient(135deg, ${card.accent}22 0%, transparent 60%), var(--bg-2)`,
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--r-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* big initial */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: s.w * 0.95,
          color: `${card.accent}28`,
          lineHeight: 0.8,
          letterSpacing: '-0.05em',
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -45%)',
        }}>{card.name[0]}</div>
        {/* mono code overlay */}
        <div style={{ position: 'absolute', bottom: 8, right: 8, fontFamily: 'var(--font-mono)', fontSize: 9, color: card.accent, letterSpacing: '0.1em' }}>
          [{card.code}]
        </div>
        <div style={{ position: 'absolute', top: 8, left: 8, fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-4)', letterSpacing: '0.2em' }}>
          NO PORTRAIT
        </div>
      </div>

      {/* name + tagline */}
      <div style={{ padding: '2px 2px 6px' }}>
        <div className="display" style={{ fontSize: s.name, color: 'var(--ink-1)', letterSpacing: '-0.01em' }}>{card.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: card.accent, textTransform: 'uppercase', marginTop: 2 }}>
          ▸ {card.tagline}
        </div>
      </div>

      {/* stats triad */}
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 4px',
        borderTop: '1px solid var(--line-2)',
        background: 'var(--bg-2)',
        borderRadius: '0 0 8px 8px',
        margin: '0 -10px -10px',
      }}>
        <StatBlock label="ATK" value={card.atk} color="var(--crimson)" />
        <StatBlock label="DEF" value={card.def} color="var(--mint)" />
        <StatBlock label="HP"  value={card.hp}  color="var(--sapphire)" />
      </div>
    </div>
  );
}

// -------- Variant 2: PhotoOverlay (foto real + stats sobrepostos) --------
function CardPhotoOverlay({ card, size = 'md', onClick, focus, faded }) {
  const sizes = {
    sm: { w: 160, h: 224, name: 18 },
    md: { w: 220, h: 308, name: 26 },
    lg: { w: 280, h: 392, name: 32 },
  };
  const s = sizes[size] || sizes.md;
  const rb = rarityBadge(card.rarity);

  return (
    <div onClick={onClick} style={{
      width: s.w, height: s.h,
      background: `linear-gradient(180deg, ${card.accent}33 0%, var(--surface) 50%, var(--bg) 100%)`,
      border: `1.5px solid ${card.rarity === 'épico' ? 'var(--gold)' : card.rarity === 'raro' ? 'var(--sapphire)' : 'var(--line-3)'}`,
      borderRadius: 'var(--r-md)',
      padding: 0,
      position: 'relative',
      cursor: onClick ? 'pointer' : 'default',
      opacity: faded ? 0.45 : 1,
      transform: focus ? 'translateY(-4px) scale(1.02)' : 'none',
      transition: 'all var(--dur-base) var(--ease-out)',
      boxShadow: focus ? `var(--shadow-lg), 0 0 0 1px ${card.accent}80` : 'var(--shadow-sm)',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* "photo" backdrop — simulated with gradient + radial silhouette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 50% 35%, ${card.accent}88 0%, ${card.accent}33 30%, transparent 65%),
          radial-gradient(ellipse 80% 60% at 50% 100%, var(--bg) 0%, transparent 50%),
          linear-gradient(180deg, #2a1d12 0%, #0d0905 100%)
        `,
      }} />
      {/* silhouette letter */}
      <div style={{
        position: 'absolute',
        top: '20%', left: '50%',
        transform: 'translateX(-50%)',
        fontFamily: 'var(--font-display)',
        fontSize: s.w * 1.4,
        color: 'rgba(0,0,0,0.6)',
        textShadow: `0 0 60px ${card.accent}`,
        letterSpacing: '-0.05em',
        lineHeight: 0.8,
      }}>{card.name[0]}</div>

      {/* PHOTO placeholder text */}
      <div style={{
        position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
        fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)',
      }}>[ FOTO ]</div>

      {/* top-left cost */}
      <div style={{ position: 'absolute', top: 8, left: 8 }}>
        <CostGem cost={card.cost} size={s.w * 0.18} />
      </div>

      {/* top-right rarity strip */}
      <div style={{
        position: 'absolute', top: 12, right: 0,
        background: rb.color, color: '#1A1108',
        fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
        letterSpacing: '0.2em',
        padding: '3px 8px',
        clipPath: 'polygon(8px 0, 100% 0, 100% 100%, 0 100%)',
      }}>{rb.label}</div>

      {/* bottom info bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 12px 8px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 30%)',
      }}>
        <div className="display" style={{ fontSize: s.name, color: 'var(--ink-1)', lineHeight: 1 }}>{card.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: card.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>
          ▸ {card.tagline}
        </div>
        {/* stats inline */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          marginTop: 8, paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--crimson)' }}>{card.atk}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--mint)' }}>{card.def}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-4)' }}>·</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--sapphire)' }}>{card.hp}</span>
          <span style={{ flex: 1 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-4)', letterSpacing: '0.18em' }}>
            {card.code}
          </span>
        </div>
      </div>
    </div>
  );
}

// -------- Variant 3: DoubleFaced (flip on hover/click) --------
function CardDoubleFaced({ card, size = 'md', onClick, focus, faded, defaultFlipped }) {
  const [flipped, setFlipped] = useState(defaultFlipped || false);
  const sizes = {
    sm: { w: 160, h: 224, name: 22 },
    md: { w: 220, h: 308, name: 32 },
    lg: { w: 280, h: 392, name: 42 },
  };
  const s = sizes[size] || sizes.md;
  const rb = rarityBadge(card.rarity);

  return (
    <div
      onClick={(e) => { setFlipped(f => !f); onClick && onClick(e); }}
      style={{
        width: s.w, height: s.h,
        perspective: 1200,
        opacity: faded ? 0.45 : 1,
        cursor: 'pointer',
        flexShrink: 0,
        transform: focus ? 'translateY(-4px)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-out)',
      }}
    >
      <div style={{
        width: '100%', height: '100%',
        position: 'relative',
        transformStyle: 'preserve-3d',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 500ms cubic-bezier(0.65, 0, 0.35, 1)',
      }}>
        {/* FRONT — tipográfico */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          background: 'var(--surface-2)',
          border: `1.5px solid ${card.rarity === 'épico' ? 'var(--gold)' : card.rarity === 'raro' ? 'var(--sapphire)' : 'var(--line-3)'}`,
          borderRadius: 'var(--r-md)',
          padding: 14,
          display: 'flex', flexDirection: 'column',
          boxShadow: focus ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        }}>
          {/* corner accents */}
          <div style={{ position: 'absolute', top: -1, left: -1, width: 16, height: 16, borderTop: `2px solid ${card.accent}`, borderLeft: `2px solid ${card.accent}`, borderTopLeftRadius: 'var(--r-md)' }} />
          <div style={{ position: 'absolute', top: -1, right: -1, width: 16, height: 16, borderTop: `2px solid ${card.accent}`, borderRight: `2px solid ${card.accent}`, borderTopRightRadius: 'var(--r-md)' }} />
          <div style={{ position: 'absolute', bottom: -1, left: -1, width: 16, height: 16, borderBottom: `2px solid ${card.accent}`, borderLeft: `2px solid ${card.accent}`, borderBottomLeftRadius: 'var(--r-md)' }} />
          <div style={{ position: 'absolute', bottom: -1, right: -1, width: 16, height: 16, borderBottom: `2px solid ${card.accent}`, borderRight: `2px solid ${card.accent}`, borderBottomRightRadius: 'var(--r-md)' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: rb.color, textTransform: 'uppercase' }}>{rb.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--ink-3)' }}>[{card.code}]</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '14px 0' }}>
            <div style={{ marginBottom: 12 }}>
              <CostGem cost={card.cost} size={s.w * 0.2} />
            </div>
            <div className="display" style={{ fontSize: s.name, color: 'var(--ink-1)', letterSpacing: '-0.01em' }}>{card.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: card.accent, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 4 }}>
              {card.tagline}
            </div>
            <div style={{ marginTop: 14, width: 32, height: 1, background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)` }} />
            <p style={{ marginTop: 12, fontSize: 11, color: 'var(--ink-3)', maxWidth: '85%', lineHeight: 1.4, fontStyle: 'italic' }}>"{card.bio}"</p>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'space-around',
            paddingTop: 10,
            borderTop: '1px solid var(--line-2)',
          }}>
            <StatBlock label="ATK" value={card.atk} color="var(--crimson)" />
            <StatBlock label="DEF" value={card.def} color="var(--mint)" />
            <StatBlock label="HP"  value={card.hp}  color="var(--sapphire)" />
          </div>

          <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--ink-4)', letterSpacing: '0.2em' }}>
            ◇ CLIQUE PRA VIRAR ◇
          </div>
        </div>

        {/* BACK — retrato */}
        <div style={{
          position: 'absolute', inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: `linear-gradient(180deg, #1a1108 0%, #0a0908 100%)`,
          border: `1.5px solid ${card.accent}`,
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
          boxShadow: focus ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${card.accent}66 0%, ${card.accent}22 35%, transparent 70%)`,
          }} />
          <div style={{
            position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
            fontFamily: 'var(--font-display)', fontSize: s.w * 1.6, color: 'rgba(0,0,0,0.5)',
            textShadow: `0 0 80px ${card.accent}`,
            lineHeight: 0.8,
          }}>{card.name[0]}</div>
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)' }}>[ FOTO ]</div>
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '14px 12px',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.9) 50%)',
          }}>
            <div className="display" style={{ fontSize: s.name * 0.85, color: 'var(--ink-1)' }}>{card.name}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: card.accent, letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 3 }}>
              ▸ {card.tagline}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--crimson)' }}>{card.atk}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--mint)' }}>{card.def}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--sapphire)' }}>{card.hp}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default card (used by other screens) defaults to TypoBold
const BigCard = CardTypoBold;

Object.assign(window, { CardTypoBold, CardPhotoOverlay, CardDoubleFaced, CostGem, StatBlock, BigCard });
