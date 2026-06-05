/* eslint-disable */
// ============================================================
// FRIENDS — lista + busca (2 variantes)
// ============================================================

const { useState: useFriendsState } = React;

function FriendsScreen({ variantIdx, goToScreen }) {
  return variantIdx === 0
    ? <FriendsList goToScreen={goToScreen} />
    : <FriendsCards goToScreen={goToScreen} />;
}

// -------- V1: Lista densa estilo Discord --------
function FriendsList({ goToScreen }) {
  const [query, setQuery] = useFriendsState('');
  const [filter, setFilter] = useFriendsState('todos');
  const friends = window.BIGS_DATA.FRIENDS;

  const filtered = friends.filter(f => {
    if (query && !f.username.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === 'online' && f.status === 'offline') return false;
    if (filter === 'jogando' && f.status !== 'jogando') return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="friends" goToScreen={goToScreen} />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <div className="eyebrow">{friends.filter(f => f.status !== 'offline').length} / {friends.length} ONLINE</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>A <span style={{ color: 'var(--gold)' }}>GALERA</span></h1>
          </div>
          <button className="btn btn-primary"><window.Icon name="UserPlus" size={14} /> Adicionar amigo</button>
        </header>

        {/* search + filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <window.Icon name="Search" size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
            <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Procura por @username..." style={{ paddingLeft: 38 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: 3 }}>
            {[
              { k: 'todos', l: 'Todos' },
              { k: 'online', l: 'Online' },
              { k: 'jogando', l: 'Em partida' },
            ].map(t => (
              <button key={t.k} onClick={() => setFilter(t.k)} style={{
                height: 32, padding: '0 14px',
                borderRadius: 4,
                background: filter === t.k ? 'var(--surface-3)' : 'transparent',
                color: filter === t.k ? 'var(--ink-1)' : 'var(--ink-3)',
                fontSize: 12, fontWeight: 600,
                transition: 'all var(--dur-fast)',
              }}>{t.l}</button>
            ))}
          </div>
        </div>

        {/* table */}
        <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 100px 200px', gap: 12, alignItems: 'center', padding: '12px 20px', background: 'var(--bg-2)', borderBottom: '1px solid var(--line-2)' }}>
            {['', 'USUÁRIO', 'LEVEL', 'W/L', 'CARTA MAIN', 'AÇÕES'].map(h => (
              <span key={h} className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>{h}</span>
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--ink-4)' }}>Nenhum amigo nesse filtro.</div>
          )}
          {filtered.map((f, i) => {
            const main = window.cardById(f.mainCard);
            const isPlaying = f.status === 'jogando';
            return (
              <div key={f.id} style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 100px 200px', gap: 12,
                alignItems: 'center', padding: '14px 20px',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--line-1)' : 'none',
                transition: 'background var(--dur-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${main.accent} 0%, var(--bg-2) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
                    {f.username[0].toUpperCase()}
                  </div>
                  <div style={{ position: 'absolute', right: -2, bottom: -2, width: 10, height: 10, borderRadius: '50%', background: f.status === 'online' ? 'var(--emerald)' : f.status === 'jogando' ? 'var(--gold)' : 'var(--ink-4)', border: '2px solid var(--surface)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{f.username}</div>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: f.status === 'jogando' ? 'var(--gold)' : f.status === 'online' ? 'var(--emerald)' : 'var(--ink-4)', textTransform: 'uppercase' }}>
                    {f.status === 'jogando' ? '◆ EM PARTIDA' : f.status === 'online' ? '● ONLINE' : '○ ' + f.lastSeen}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 13, color: 'var(--ink-2)' }}>LV {f.level}</span>
                <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  <span style={{ color: 'var(--emerald)' }}>{f.wins}</span>/<span style={{ color: 'var(--crimson)' }}>{f.losses}</span>
                </span>
                <span style={{ fontSize: 12, color: main.accent, fontWeight: 600 }}>{main.name}</span>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm btn-ghost"><window.Icon name="MessageSquare" size={12} /></button>
                  <button className="btn btn-sm btn-primary" disabled={isPlaying} style={{ opacity: isPlaying ? 0.4 : 1 }} onClick={() => goToScreen('challenges')}>
                    Desafiar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// -------- V2: Cards grandes --------
function FriendsCards({ goToScreen }) {
  const [query, setQuery] = useFriendsState('');
  const friends = window.BIGS_DATA.FRIENDS;
  const filtered = friends.filter(f => !query || f.username.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="friends" goToScreen={goToScreen} />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        <header style={{ marginBottom: 24 }}>
          <div className="eyebrow">PARCEIROS DE LAVADA</div>
          <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>QUEM TÁ NA <span style={{ color: 'var(--gold)' }}>ÁREA</span></h1>
        </header>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div style={{ flex: 1, position: 'relative', maxWidth: 480 }}>
            <window.Icon name="Search" size={14} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }} />
            <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Busca por @user..." style={{ paddingLeft: 38 }} />
          </div>
          <button className="btn btn-primary"><window.Icon name="UserPlus" size={14} /> Adicionar</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(f => {
            const main = window.cardById(f.mainCard);
            const wr = Math.round((f.wins / (f.wins + f.losses)) * 100);
            return (
              <div key={f.id} className="panel" style={{
                padding: 20, position: 'relative',
                background: `linear-gradient(180deg, ${main.accent}11 0%, var(--surface) 50%)`,
                transition: 'transform var(--dur-fast)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                {/* status dot */}
                <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.status === 'online' ? 'var(--emerald)' : f.status === 'jogando' ? 'var(--gold)' : 'var(--ink-4)' }} />
                  <span className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{f.status}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${main.accent} 0%, var(--bg-2) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 22 }}>
                    {f.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{f.username}</div>
                    <div className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: main.accent, marginTop: 2 }}>{f.tag}</div>
                  </div>
                </div>

                {/* stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, padding: '12px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>LV</div>
                    <div className="display" style={{ fontSize: 22, color: 'var(--ink-1)' }}>{f.level}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>WIN%</div>
                    <div className="display" style={{ fontSize: 22, color: 'var(--gold)' }}>{wr}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>MAIN</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: main.accent, marginTop: 6 }}>{main.name}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
                  <button className="btn btn-sm btn-ghost" style={{ flex: 1 }}><window.Icon name="MessageSquare" size={12} /> Msg</button>
                  <button onClick={() => goToScreen('challenges')} className="btn btn-sm btn-primary" disabled={f.status === 'jogando'} style={{ flex: 1, opacity: f.status === 'jogando' ? 0.4 : 1 }}>
                    Desafiar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.friends = FriendsScreen;
