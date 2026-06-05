/* eslint-disable */
// ============================================================
// HOME SCREEN — dashboard pós-login (2 variantes)
// ============================================================

const { useState: useHomeState } = React;

function HomeScreen({ variantIdx, goToScreen, openCardDetail }) {
  return variantIdx === 0
    ? <HomeSidebar goToScreen={goToScreen} openCardDetail={openCardDetail} />
    : <HomeHero goToScreen={goToScreen} openCardDetail={openCardDetail} />;
}

// -------- Shared sidebar --------
function Sidebar({ active, goToScreen }) {
  const items = [
    { id: 'home', label: 'Início',     icon: 'Home' },
    { id: 'roster', label: 'Cartas',   icon: 'LayoutGrid' },
    { id: 'friends', label: 'Amigos',  icon: 'Users' },
    { id: 'challenges', label: 'Desafios', icon: 'Swords', badge: 3 },
    { id: 'profile', label: 'Perfil',  icon: 'User' },
  ];

  return (
    <aside style={{
      width: 240, padding: '24px 16px',
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--line-1)',
      display: 'flex', flexDirection: 'column',
      gap: 8,
      minHeight: '100vh',
    }}>
      {/* logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px 20px', borderBottom: '1px solid var(--line-1)', marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, background: 'var(--gold)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-on-gold)' }}>B</div>
        <div>
          <div className="display" style={{ fontSize: 16, lineHeight: 1 }}>BIGS & CARDS</div>
          <div className="mono" style={{ fontSize: 8, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>BETA</div>
        </div>
      </div>

      {items.map(it => (
        <button key={it.id} onClick={() => goToScreen(it.id)} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px',
          borderRadius: 8,
          background: active === it.id ? 'var(--gold-soft)' : 'transparent',
          color: active === it.id ? 'var(--gold)' : 'var(--ink-2)',
          fontSize: 14, fontWeight: 600,
          textAlign: 'left',
          transition: 'all var(--dur-fast)',
          position: 'relative',
        }}
        onMouseEnter={(e) => { if (active !== it.id) e.currentTarget.style.background = 'var(--surface-2)'; }}
        onMouseLeave={(e) => { if (active !== it.id) e.currentTarget.style.background = 'transparent'; }}
        >
          <window.Icon name={it.icon} size={16} />
          <span style={{ flex: 1 }}>{it.label}</span>
          {it.badge && (
            <span style={{ background: 'var(--crimson)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999, fontFamily: 'var(--font-mono)' }}>{it.badge}</span>
          )}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* user mini */}
      <div className="panel-2" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold) 0%, var(--crimson) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)' }}>V</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>@voce</div>
          <div className="mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--gold)' }}>OURO III · 1247</div>
        </div>
      </div>
    </aside>
  );
}

// -------- V1: Sidebar + grid de painéis --------
function HomeSidebar({ goToScreen, openCardDetail }) {
  const me = window.BIGS_DATA.ME;
  const onlineFriends = window.BIGS_DATA.FRIENDS.filter(f => f.status !== 'offline').slice(0, 5);
  const recentMatches = window.BIGS_DATA.MATCHES.slice(0, 4);
  const myMain = window.cardById(me.mainCard);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active="home" goToScreen={goToScreen} />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        {/* page header */}
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div className="eyebrow">SEXTA · 22:14 · 8 ONLINE</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 8, lineHeight: 1 }}>E aí, <span style={{ color: 'var(--gold)' }}>voce</span></h1>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 6 }}>Última partida: ganhou 20–8 do @pepao_br. Boa.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => goToScreen('challenges')} className="btn btn-ghost">
              <window.Icon name="Bell" size={14} /> 3 desafios
            </button>
            <button onClick={() => goToScreen('lobby')} className="btn btn-primary btn-lg">
              <window.Icon name="Swords" size={16} /> Jogar agora
            </button>
          </div>
        </header>

        {/* main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { l: 'VITÓRIAS', v: 47, color: 'var(--emerald)' },
                { l: 'DERROTAS', v: 22, color: 'var(--crimson)' },
                { l: 'WIN %',    v: '68%', color: 'var(--gold)' },
                { l: 'LEVEL',    v: 19, color: 'var(--sapphire)' },
              ].map(s => (
                <div key={s.l} className="panel-2" style={{ padding: 16 }}>
                  <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>{s.l}</div>
                  <div className="display" style={{ fontSize: 36, color: s.color, marginTop: 4, lineHeight: 1 }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* Quick play matchmaking card */}
            <div className="panel" style={{ padding: 28, background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-2) 100%)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -40, top: -40, opacity: 0.08 }}>
                <div className="display" style={{ fontSize: 200, color: 'var(--gold)' }}>BIG</div>
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--gold)' }}>► RANQUEADA</div>
                  <h2 className="display" style={{ fontSize: 44, marginTop: 8, lineHeight: 1 }}>QUER A LAVADA?</h2>
                  <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8, maxWidth: 380 }}>
                    Matchmaking automático em ~30s. A galera tá rachando, vai por mim.
                  </p>
                  <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                    <button onClick={()=>goToScreen('lobby')} className="btn btn-primary btn-lg">Jogar ranqueada</button>
                    <button onClick={()=>goToScreen('friends')} className="btn btn-ghost">Convidar amigo</button>
                  </div>
                </div>
                <window.CardTypoBold card={myMain} size="sm" />
              </div>
            </div>

            {/* Recent matches */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 22 }}>ÚLTIMAS PARTIDAS</h3>
                <button onClick={()=>goToScreen('profile')} className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--gold)' }}>VER TUDO →</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentMatches.map((m, i) => (
                  <div key={m.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr auto auto 80px',
                    alignItems: 'center', gap: 16,
                    padding: '12px 4px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line-1)',
                  }}>
                    <span className="display" style={{ fontSize: 18, color: m.result === 'win' ? 'var(--emerald)' : 'var(--crimson)' }}>
                      {m.result === 'win' ? 'WIN' : 'LOSS'}
                    </span>
                    <span style={{ fontSize: 14 }}>vs <span style={{ fontWeight: 700 }}>@{m.opponent}</span></span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{m.score}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-4)', letterSpacing: '0.06em' }}>{m.duration}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em', textAlign: 'right' }}>{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* online friends */}
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <h3 className="display" style={{ fontSize: 22 }}>NA ÁREA <span style={{ color: 'var(--emerald)' }}>·</span></h3>
                <button onClick={()=>goToScreen('friends')} className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--gold)' }}>VER {window.BIGS_DATA.FRIENDS.length} →</button>
              </div>
              {onlineFriends.map((f, i) => (
                <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderTop: i === 0 ? 'none' : '1px solid var(--line-1)' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${window.cardById(f.mainCard).accent} 0%, var(--bg-2) 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>
                      {f.username[0].toUpperCase()}
                    </div>
                    <div style={{ position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: '50%', background: f.status === 'jogando' ? 'var(--gold)' : 'var(--emerald)', border: '2px solid var(--surface)' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{f.username}</div>
                    <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: f.status === 'jogando' ? 'var(--gold)' : 'var(--ink-4)', textTransform: 'uppercase' }}>{f.status === 'jogando' ? 'EM PARTIDA' : 'ONLINE · LV ' + f.level}</div>
                  </div>
                  <button className="btn btn-sm btn-ghost" disabled={f.status === 'jogando'} style={{ opacity: f.status === 'jogando' ? 0.4 : 1 }}>
                    Desafiar
                  </button>
                </div>
              ))}
            </div>

            {/* daily card / featured */}
            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow" style={{ color: 'var(--purple)' }}>► CARTA DO DIA</div>
              <h3 className="display" style={{ fontSize: 22, marginTop: 6 }}>HOJE É <span style={{ color: window.cardById('pirula').accent }}>PIRULA</span></h3>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8, marginBottom: 16 }}>
                +10% de chance de aparecer no mulligan. Aproveita pra fazer aquele all-in.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <window.CardTypoBold card={window.cardById('pirula')} size="sm" onClick={() => openCardDetail(window.cardById('pirula'))} focus />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- V2: Top nav + hero --------
function HomeHero({ goToScreen, openCardDetail }) {
  const me = window.BIGS_DATA.ME;
  const onlineFriends = window.BIGS_DATA.FRIENDS.filter(f => f.status !== 'offline').slice(0, 6);
  const featuredCards = ['bigs', 'pirula', 'davi', 'pepao'].map(window.cardById);

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Top nav */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 32,
        padding: '18px 40px',
        borderBottom: '1px solid var(--line-1)',
        background: 'var(--bg-2)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--gold)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--ink-on-gold)' }}>B</div>
          <span className="display" style={{ fontSize: 18 }}>BIGS & CARDS</span>
        </div>
        <nav style={{ display: 'flex', gap: 24, flex: 1 }}>
          {[
            { id: 'home', l: 'Início' },
            { id: 'roster', l: 'Cartas' },
            { id: 'friends', l: 'Amigos' },
            { id: 'challenges', l: 'Desafios' },
            { id: 'profile', l: 'Perfil' },
          ].map(it => (
            <button key={it.id} onClick={() => goToScreen(it.id)} style={{
              fontSize: 13, fontWeight: 600,
              color: it.id === 'home' ? 'var(--ink-1)' : 'var(--ink-3)',
              padding: '6px 0',
              borderBottom: it.id === 'home' ? '2px solid var(--gold)' : '2px solid transparent',
            }}>{it.l}</button>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button className="btn btn-ghost btn-sm"><window.Icon name="Bell" size={14} /> 3</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--gold)', textAlign: 'right' }}>
              <div>OURO III</div>
              <div style={{ fontSize: 9, color: 'var(--ink-4)' }}>1247 PTS</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--ink-on-gold)' }}>V</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '48px 40px 0', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>► SEXTA À NOITE · 8 ONLINE</div>
            <h1 className="display" style={{ fontSize: 92, lineHeight: 0.92, marginTop: 12 }}>
              VAI <span style={{ color: 'var(--gold)' }}>ENCARAR</span><br />OU VAI <span style={{ textDecoration: 'line-through', color: 'var(--ink-3)' }}>CHORAR</span>?
            </h1>
            <p style={{ fontSize: 17, color: 'var(--ink-2)', marginTop: 18, maxWidth: 520, lineHeight: 1.5 }}>
              Sequência: 3 vitórias seguidas. Próxima ranqueada vale +28 pontos. Bora?
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
              <button onClick={() => goToScreen('lobby')} className="btn btn-primary btn-lg" style={{ height: 52, padding: '0 28px', fontSize: 15 }}>
                <window.Icon name="Swords" size={18} /> Jogar ranqueada
              </button>
              <button onClick={() => goToScreen('friends')} className="btn btn-ghost btn-lg" style={{ height: 52 }}>
                Convidar amigo
              </button>
            </div>
          </div>

          {/* Hero cards fan */}
          <div style={{ position: 'relative', height: 420, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {featuredCards.map((c, i) => {
              const offset = i - (featuredCards.length - 1) / 2;
              return (
                <div key={c.id} style={{
                  position: 'absolute',
                  transform: `translateX(${offset * 70}px) translateY(${Math.abs(offset) * 16}px) rotate(${offset * 7}deg)`,
                  zIndex: 10 - Math.abs(offset),
                }}>
                  <window.CardTypoBold card={c} size="md" onClick={() => openCardDetail(c)} focus={i === 1} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom strip */}
      <section style={{ padding: '48px 40px', borderTop: '1px solid var(--line-1)', marginTop: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 40, maxWidth: 1280, margin: '0 auto' }}>
          {/* stats */}
          <div>
            <div className="eyebrow">SEUS NÚMEROS</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 14 }}>
              {[
                { l: 'VITÓRIAS', v: '47', c: 'var(--emerald)' },
                { l: 'DERROTAS', v: '22', c: 'var(--crimson)' },
                { l: 'WIN %',    v: '68', c: 'var(--gold)', sub: '%' },
                { l: 'SEQUÊNCIA',v: '3',  c: 'var(--sapphire)', sub: ' WINS' },
              ].map(s => (
                <div key={s.l} style={{ borderLeft: '2px solid var(--line-2)', paddingLeft: 16 }}>
                  <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>{s.l}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                    <div className="display" style={{ fontSize: 64, color: s.c, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.v}</div>
                    {s.sub && <div className="mono" style={{ fontSize: 14, color: s.c }}>{s.sub}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* online */}
          <div>
            <div className="eyebrow">QUEM TÁ ONLINE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {onlineFriends.map(f => (
                <button key={f.id} onClick={()=>goToScreen('friends')} className="pill pill-ghost" style={{ padding: '6px 10px', textTransform: 'none' }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: f.status === 'jogando' ? 'var(--gold)' : 'var(--emerald)' }} />
                  @{f.username}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.home = HomeScreen;
window.Sidebar = Sidebar;
