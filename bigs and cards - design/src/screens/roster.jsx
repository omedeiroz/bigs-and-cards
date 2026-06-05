/* eslint-disable */
// ============================================================
// ROSTER — Gerenciador de cartas (2 variantes)
// ============================================================

const { useState: useRosterState } = React;

function RosterScreen({ variantIdx, goToScreen, openCardDetail }) {
  return variantIdx === 0
    ? <RosterGrid goToScreen={goToScreen} openCardDetail={openCardDetail} />
    : <RosterCodex goToScreen={goToScreen} openCardDetail={openCardDetail} />;
}

// -------- V1: Grid clean com filtros --------
function RosterGrid({ goToScreen, openCardDetail }) {
  const [filter, setFilter] = useRosterState('todas');
  const [sort, setSort] = useRosterState('custo');
  const cards = window.BIGS_DATA.CARDS;

  const filtered = cards.filter(c => filter === 'todas' || c.rarity === filter);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'custo') return a.cost - b.cost;
    if (sort === 'atk') return b.atk - a.atk;
    if (sort === 'nome') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="roster" goToScreen={goToScreen} />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
          <div>
            <div className="eyebrow">ROSTER · {cards.length} CARTAS</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>
              A GALERA <span style={{ color: 'var(--gold)' }}>INTEIRA</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 6 }}>Conhece quem você tem na mão. Clica numa carta pra ver tudo.</p>
          </div>
        </header>

        {/* filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--line-1)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['todas', 'comum', 'raro', 'épico'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={'pill ' + (filter === f ? 'pill-gold' : 'pill-ghost')} style={{ height: 30, fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>
                {f}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>ORDENAR:</span>
          <select className="input" style={{ width: 160, height: 32, fontSize: 12 }} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="custo">Custo (asc)</option>
            <option value="atk">Ataque (desc)</option>
            <option value="nome">Nome (A-Z)</option>
          </select>
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, justifyItems: 'center' }}>
          {sorted.map(c => (
            <window.CardTypoBold key={c.id} card={c} size="md" onClick={() => openCardDetail(c)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// -------- V2: "Codex" — lista + preview lateral --------
function RosterCodex({ goToScreen, openCardDetail }) {
  const cards = window.BIGS_DATA.CARDS;
  const [selectedId, setSelectedId] = useRosterState(cards[0].id);
  const selected = cards.find(c => c.id === selectedId);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="roster" goToScreen={goToScreen} />

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 420px', minHeight: '100vh' }}>
        {/* list */}
        <div style={{ padding: '28px 32px 80px', overflowY: 'auto', borderRight: '1px solid var(--line-1)' }}>
          <header style={{ marginBottom: 24 }}>
            <div className="eyebrow">CODEX · {cards.length} ENTRIES</div>
            <h1 className="display" style={{ fontSize: 48, marginTop: 6, lineHeight: 1 }}>O LIVRO DA GALERA</h1>
          </header>

          <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--line-2)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {/* header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px 60px 1fr 60px 60px 60px 90px', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line-2)' }}>
              {['#', 'CUSTO', 'NOME', 'ATK', 'DEF', 'HP', 'RARIDADE'].map((h, i) => (
                <span key={h} className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)', textAlign: i > 2 && i < 6 ? 'center' : 'left' }}>{h}</span>
              ))}
            </div>
            {cards.map((c, i) => (
              <div key={c.id} onClick={() => setSelectedId(c.id)} style={{
                display: 'grid', gridTemplateColumns: '40px 60px 1fr 60px 60px 60px 90px',
                alignItems: 'center', gap: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                background: selectedId === c.id ? `${c.accent}14` : 'transparent',
                borderBottom: i < cards.length - 1 ? '1px solid var(--line-1)' : 'none',
                borderLeft: selectedId === c.id ? `2px solid ${c.accent}` : '2px solid transparent',
                transition: 'all var(--dur-fast)',
              }}>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)' }}>{String(i + 1).padStart(2, '0')}</span>
                <span className="mono" style={{ fontSize: 13, color: 'var(--purple)', fontWeight: 700 }}>◆ {c.cost}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-1)' }}>{c.name}</div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: c.accent, marginTop: 1, textTransform: 'uppercase' }}>{c.tagline}</div>
                </div>
                <span style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--crimson)' }}>{c.atk}</span>
                <span style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--mint)' }}>{c.def}</span>
                <span style={{ textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--sapphire)' }}>{c.hp}</span>
                <span className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: c.rarity === 'épico' ? 'var(--gold)' : c.rarity === 'raro' ? 'var(--sapphire)' : 'var(--ink-3)', textAlign: 'right', textTransform: 'uppercase' }}>{c.rarity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* preview */}
        <div style={{ padding: '28px 28px 60px', background: 'var(--bg-2)', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>
          <div className="eyebrow" style={{ color: selected.accent }}>► {selected.code}</div>
          <h2 className="display" style={{ fontSize: 48, marginTop: 6, lineHeight: 1 }}>{selected.name}</h2>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6, fontStyle: 'italic' }}>"{selected.bio}"</p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '22px 0' }}>
            <window.CardTypoBold card={selected} size="sm" onClick={() => openCardDetail(selected)} focus />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)', textAlign: 'center' }}>
            <div><div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>ATK</div><div className="display" style={{ fontSize: 32, color: 'var(--crimson)' }}>{selected.atk}</div></div>
            <div><div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>DEF</div><div className="display" style={{ fontSize: 32, color: 'var(--mint)' }}>{selected.def}</div></div>
            <div><div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>HP</div><div className="display" style={{ fontSize: 32, color: 'var(--sapphire)' }}>{selected.hp}</div></div>
          </div>

          <div style={{ marginTop: 16 }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--gold)', fontWeight: 700 }}>► PASSIVA</div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>{selected.passive}</p>
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--purple)', fontWeight: 700 }}>► ESPECIAL · {selected.special.cost}♦</div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}><b>{selected.special.name}</b> — {selected.special.desc}</p>
          </div>

          <button onClick={() => openCardDetail(selected)} className="btn btn-ghost btn-block" style={{ marginTop: 18 }}>
            Ver detalhes completos →
          </button>
        </div>
      </div>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.roster = RosterScreen;
