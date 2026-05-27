/* eslint-disable */
// ============================================================
// PROFILE / HISTÓRICO — perfil do jogador + histórico de partidas (2 variantes)
// ============================================================

function ProfileScreen({ variantIdx, goToScreen, openCardDetail }) {
  return variantIdx === 0
    ? <ProfileStats goToScreen={goToScreen} openCardDetail={openCardDetail} />
    : <ProfileTimeline goToScreen={goToScreen} openCardDetail={openCardDetail} />;
}

// -------- V1: Stat-focused dashboard --------
function ProfileStats({ goToScreen, openCardDetail }) {
  const me = window.BIGS_DATA.ME;
  const matches = window.BIGS_DATA.MATCHES;
  const myMain = window.cardById(me.mainCard);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="profile" goToScreen={goToScreen} />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto' }}>
        {/* hero header */}
        <div className="panel" style={{ padding: 32, background: `linear-gradient(135deg, var(--gold-soft) 0%, var(--surface) 60%)`, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, bottom: -40, opacity: 0.1 }}>
            <div className="display" style={{ fontSize: 220, color: 'var(--gold)' }}>{me.username[0].toUpperCase()}</div>
          </div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 24, alignItems: 'center' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 42, color: 'var(--ink-on-gold)', boxShadow: '0 16px 40px var(--gold-glow)' }}>
              {me.username[0].toUpperCase()}
            </div>
            <div>
              <div className="eyebrow" style={{ color: 'var(--gold)' }}>► PERFIL</div>
              <h1 className="display" style={{ fontSize: 64, lineHeight: 0.95, marginTop: 4 }}>{me.username}</h1>
              <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                <span className="pill pill-gold">{me.rank} · {me.rankPoints} pts</span>
                <span className="pill pill-ghost">LEVEL {me.level}</span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em' }}>{me.tag}</span>
              </div>
            </div>
            <button className="btn btn-ghost"><window.Icon name="Pencil" size={12} /> Editar</button>
          </div>
        </div>

        {/* stat grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { l: 'PARTIDAS', v: me.wins + me.losses, c: 'var(--ink-1)', sub: 'jogadas' },
            { l: 'VITÓRIAS', v: me.wins, c: 'var(--emerald)', sub: `+${Math.round(me.wins / 5)} esse mês` },
            { l: 'WIN RATE', v: me.winRate + '%', c: 'var(--gold)', sub: 'acima da média' },
            { l: 'STREAK',   v: 3, c: 'var(--sapphire)', sub: 'vitórias seguidas' },
          ].map(s => (
            <div key={s.l} className="panel" style={{ padding: 20 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>{s.l}</div>
              <div className="display" style={{ fontSize: 56, color: s.c, lineHeight: 1, marginTop: 6, textShadow: `0 0 24px ${s.c}33` }}>{s.v}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-3)', marginTop: 6 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
          {/* match history */}
          <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
            <header style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--line-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 className="display" style={{ fontSize: 26 }}>HISTÓRICO</h3>
                <span className="mono" style={{ fontSize: 10, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>ÚLTIMAS {matches.length}</span>
              </div>
            </header>
            <div>
              {matches.map((m, i) => {
                const mvp = window.cardById(m.mvp);
                return (
                  <div key={m.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr auto auto 100px',
                    gap: 16, alignItems: 'center',
                    padding: '14px 24px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--line-1)',
                  }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 50, height: 32,
                      borderRadius: 4,
                      background: m.result === 'win' ? 'var(--emerald-soft)' : 'var(--crimson-soft)',
                      color: m.result === 'win' ? 'var(--emerald)' : 'var(--crimson)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 14,
                      letterSpacing: '0.05em',
                    }}>{m.result === 'win' ? 'WIN' : 'LOSS'}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>vs <span style={{ color: 'var(--ink-1)' }}>@{m.opponent}</span></div>
                      <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-4)', marginTop: 2 }}>
                        MVP: <span style={{ color: mvp.accent }}>{mvp.name}</span> · {m.rounds} rodadas · {m.duration}
                      </div>
                    </div>
                    <span className="display" style={{ fontSize: 18, color: 'var(--ink-2)' }}>{m.score}</span>
                    <span className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em' }}>{m.date}</span>
                    <button className="btn btn-sm btn-ghost">Ver →</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* main card + rank */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow">► CARTA MAIN</div>
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
                <window.CardTypoBold card={myMain} size="sm" onClick={() => openCardDetail(myMain)} focus />
              </div>
              <div style={{ marginTop: 14, padding: '12px 0', borderTop: '1px solid var(--line-2)' }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)' }}>WIN RATE COM ESSA CARTA</div>
                <div className="display" style={{ fontSize: 36, color: 'var(--gold)', lineHeight: 1, marginTop: 4 }}>74%</div>
              </div>
            </div>

            <div className="panel" style={{ padding: 20 }}>
              <div className="eyebrow">► PROGRESSO DE RANK</div>
              <div className="display" style={{ fontSize: 28, marginTop: 6, color: 'var(--gold)' }}>OURO III</div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.14em', marginTop: 4 }}>{me.rankPoints} / 1500</div>
              <div style={{ height: 8, background: 'var(--surface-3)', borderRadius: 999, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '83%', background: 'linear-gradient(90deg, var(--gold), var(--gold-hover))', borderRadius: 999 }} />
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.14em', marginTop: 6 }}>
                253 PTS PRA OURO II
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- V2: Timeline temporal --------
function ProfileTimeline({ goToScreen, openCardDetail }) {
  const me = window.BIGS_DATA.ME;
  const matches = window.BIGS_DATA.MATCHES;
  const myMain = window.cardById(me.mainCard);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <window.Sidebar active="profile" goToScreen={goToScreen} />

      <div style={{ flex: 1, padding: '28px 36px 80px', overflow: 'auto', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 36 }}>
        {/* LEFT — identity card */}
        <div>
          <div className="panel" style={{ padding: 24, textAlign: 'center', position: 'sticky', top: 28 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--crimson))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 52, color: 'var(--ink-on-gold)', margin: '0 auto', boxShadow: '0 20px 40px var(--gold-glow)' }}>
              {me.username[0].toUpperCase()}
            </div>
            <h2 className="display" style={{ fontSize: 36, marginTop: 14, lineHeight: 1 }}>{me.username}</h2>
            <div className="mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-3)', marginTop: 4 }}>{me.tag}</div>
            <div style={{ marginTop: 12 }}>
              <span className="pill pill-gold">{me.rank} · {me.rankPoints}</span>
            </div>

            <div style={{ marginTop: 22, padding: '16px 0', borderTop: '1px solid var(--line-2)', borderBottom: '1px solid var(--line-2)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div>
                <div className="mono" style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>LV</div>
                <div className="display" style={{ fontSize: 28, color: 'var(--ink-1)' }}>{me.level}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>WIN</div>
                <div className="display" style={{ fontSize: 28, color: 'var(--emerald)' }}>{me.wins}</div>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--ink-4)' }}>%</div>
                <div className="display" style={{ fontSize: 28, color: 'var(--gold)' }}>{me.winRate}</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--ink-4)', marginBottom: 8 }}>► MAIN</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <window.CardTypoBold card={myMain} size="sm" onClick={() => openCardDetail(myMain)} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — timeline */}
        <div>
          <header style={{ marginBottom: 28 }}>
            <div className="eyebrow">PARTIDAS</div>
            <h1 className="display" style={{ fontSize: 56, marginTop: 6, lineHeight: 1 }}>O FILME DA <span style={{ color: 'var(--gold)' }}>SUA CARREIRA</span></h1>
          </header>

          {/* timeline */}
          <div style={{ position: 'relative', paddingLeft: 28 }}>
            <div style={{ position: 'absolute', left: 8, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, var(--gold), var(--line-2))' }} />

            {matches.map((m, i) => {
              const isWin = m.result === 'win';
              const mvp = window.cardById(m.mvp);
              return (
                <div key={m.id} style={{ position: 'relative', marginBottom: 18 }}>
                  <div style={{
                    position: 'absolute',
                    left: -25, top: 18,
                    width: 16, height: 16,
                    borderRadius: '50%',
                    background: isWin ? 'var(--emerald)' : 'var(--crimson)',
                    border: '3px solid var(--bg)',
                    boxShadow: `0 0 0 2px ${isWin ? 'var(--emerald)' : 'var(--crimson)'}, 0 0 12px ${isWin ? 'var(--emerald)' : 'var(--crimson)'}66`,
                  }} />

                  <div className="panel" style={{
                    padding: 18,
                    borderLeft: `3px solid ${isWin ? 'var(--emerald)' : 'var(--crimson)'}`,
                    background: `linear-gradient(90deg, ${isWin ? 'var(--emerald-soft)' : 'var(--crimson-soft)'} 0%, var(--surface) 30%)`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                          <span className="display" style={{ fontSize: 22, color: isWin ? 'var(--emerald)' : 'var(--crimson)' }}>{isWin ? 'VITÓRIA' : 'DERROTA'}</span>
                          <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>vs <b style={{ color: 'var(--ink-1)' }}>@{m.opponent}</b></span>
                        </div>
                        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--ink-4)', marginTop: 4 }}>
                          {m.date.toUpperCase()} · {m.rounds} RODADAS · {m.duration}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="display" style={{ fontSize: 28, color: 'var(--ink-1)', lineHeight: 1 }}>{m.score}</div>
                        <div className="mono" style={{ fontSize: 9, letterSpacing: '0.14em', color: isWin ? 'var(--emerald)' : 'var(--crimson)', marginTop: 4 }}>
                          {isWin ? '+28 PTS' : '-28 PTS'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--line-1)' }}>
                      <div style={{ width: 28, height: 36, background: `linear-gradient(135deg, ${mvp.accent}55, var(--bg-2))`, border: `1px solid ${mvp.accent}`, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, color: mvp.accent }}>
                        {mvp.name[0]}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                        MVP: <b style={{ color: mvp.accent }}>{mvp.name}</b> · "{mvp.tagline}"
                      </div>
                      <div style={{ flex: 1 }} />
                      <button className="btn btn-sm btn-ghost">Replay →</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.profile = ProfileScreen;
