/* eslint-disable */
// ============================================================
// AUTH SCREEN — Login + Cadastro (2 variantes)
// ============================================================

const { useState: useAuthState } = React;

function AuthScreen({ variantIdx, goToScreen }) {
  return variantIdx === 0 ? <AuthSplit goToScreen={goToScreen} /> : <AuthCentered goToScreen={goToScreen} />;
}

// -------- V1: Split-screen com showcase de cartas --------
function AuthSplit({ goToScreen }) {
  const [mode, setMode] = useAuthState('login'); // login | register
  const cards = ['bigs', 'pirula', 'davi'].map(window.cardById);

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr' }}>
      {/* LEFT — showcase */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1108 0%, #0a0908 60%)',
        position: 'relative',
        overflow: 'hidden',
        padding: 48,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        {/* logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--gold)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 24, color: 'var(--ink-on-gold)',
            transform: 'rotate(-6deg)',
            boxShadow: '0 8px 20px var(--gold-glow)',
          }}>B</div>
          <div>
            <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>BIGS & CARDS</div>
            <div className="mono" style={{ fontSize: 9, letterSpacing: '0.2em', color: 'var(--ink-3)', marginTop: 2 }}>v0.1 · BETA FECHADO</div>
          </div>
        </div>

        {/* tagline + cards */}
        <div>
          <div className="eyebrow" style={{ color: 'var(--gold)' }}>► O JOGO DA GALERA</div>
          <h1 className="display" style={{ fontSize: 84, color: 'var(--ink-1)', marginTop: 14, lineHeight: 0.92 }}>
            VAI ENCARAR<br />A PARADA?
          </h1>
          <p style={{ marginTop: 18, fontSize: 17, color: 'var(--ink-2)', maxWidth: 480, lineHeight: 1.55 }}>
            10 cartas. 20 de HP. Elixir pra queimar. Você e a galera no tabuleiro — só que agora é todo mundo contra todo mundo, e a zoeira tá no log de partida.
          </p>

          {/* 3 cards floating */}
          <div style={{ display: 'flex', marginTop: 36, gap: -20, position: 'relative', height: 260 }}>
            {cards.map((c, i) => (
              <div key={c.id} style={{
                position: 'absolute',
                left: i * 130,
                top: i === 1 ? -10 : 0,
                transform: `rotate(${(i - 1) * 6}deg)`,
                zIndex: i === 1 ? 3 : 1,
              }}>
                <window.CardTypoBold card={c} size="sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--ink-4)' }}>
          ◇ PRIVATE LOBBY · CONVITE ONLY · FRIENDS LIST CURATED ◇
        </div>
      </div>

      {/* RIGHT — form */}
      <div style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid var(--line-2)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1,
                padding: '14px 0',
                fontFamily: 'var(--font-mono)',
                fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700,
                color: mode === m ? 'var(--gold)' : 'var(--ink-3)',
                borderBottom: mode === m ? '2px solid var(--gold)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all var(--dur-fast) var(--ease-out)',
              }}>
                {m === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            ))}
          </div>

          <h2 className="display" style={{ fontSize: 40, lineHeight: 1 }}>
            {mode === 'login' ? 'Bora jogar' : 'Cria a conta'}
          </h2>
          <p style={{ marginTop: 8, color: 'var(--ink-3)', fontSize: 14 }}>
            {mode === 'login' ? 'Manda o login pra cair direto no lobby.' : 'Username, email, senha. Sem firula.'}
          </p>

          <form style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={(e) => { e.preventDefault(); goToScreen('home'); }}>
            {mode === 'register' && (
              <div>
                <label className="label">Username</label>
                <input className="input" placeholder="ex: gbzin01" defaultValue="" />
              </div>
            )}
            <div>
              <label className="label">{mode === 'login' ? 'Email ou username' : 'Email'}</label>
              <input className="input" placeholder={mode === 'login' ? 'voce@email.com ou @user' : 'voce@email.com'} defaultValue={mode==='login' ? 'voce@bigs.cards' : ''} />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" defaultValue="••••••••" />
            </div>

            {mode === 'login' && (
              <button type="button" style={{ alignSelf: 'flex-start', fontSize: 12, color: 'var(--ink-3)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                esqueci a senha
              </button>
            )}

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 8 }}>
              {mode === 'login' ? 'Entrar →' : 'Criar conta →'}
            </button>
          </form>

          <div className="mono" style={{ marginTop: 40, fontSize: 10, letterSpacing: '0.18em', color: 'var(--ink-4)', textAlign: 'center' }}>
            AO ENTRAR · VOCÊ CONCORDA EM TOMAR LAVADA
          </div>
        </div>
      </div>
    </div>
  );
}

// -------- V2: Centered minimal --------
function AuthCentered({ goToScreen }) {
  const [mode, setMode] = useAuthState('login');
  const cards = window.BIGS_DATA.CARDS;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      {/* faded cards in background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', opacity: 0.18 }}>
        {cards.map((c, i) => {
          const positions = [
            { x: 5, y: 8, r: -14 }, { x: 85, y: 6, r: 11 },
            { x: 12, y: 64, r: 8 }, { x: 80, y: 60, r: -9 },
            { x: 45, y: -3, r: 4 }, { x: 4, y: 36, r: 18 },
            { x: 88, y: 32, r: -16 }, { x: 35, y: 75, r: -7 },
            { x: 55, y: 80, r: 13 }, { x: 65, y: 38, r: 6 },
          ];
          const p = positions[i % positions.length];
          return (
            <div key={c.id} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: `rotate(${p.r}deg)` }}>
              <window.CardTypoBold card={c} size="sm" />
            </div>
          );
        })}
      </div>

      <div className="panel" style={{ position: 'relative', width: '100%', maxWidth: 440, padding: 40, background: 'var(--surface)', boxShadow: 'var(--shadow-lg)' }}>
        {/* logo block */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56,
            background: 'var(--gold)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: 36, color: 'var(--ink-on-gold)',
            boxShadow: '0 12px 32px var(--gold-glow)',
          }}>B</div>
          <div className="display" style={{ fontSize: 28, marginTop: 14 }}>BIGS & CARDS</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.22em', color: 'var(--ink-4)', marginTop: 4 }}>
            10 CARTAS · 1 VITÓRIA · 0 MOLE
          </div>
        </div>

        {/* segmented */}
        <div style={{ display: 'flex', background: 'var(--bg-2)', borderRadius: 'var(--r-sm)', padding: 3, marginBottom: 24, border: '1px solid var(--line-1)' }}>
          {[{k:'login',l:'Entrar'},{k:'register',l:'Criar conta'}].map(t => (
            <button key={t.k} onClick={()=>setMode(t.k)} style={{
              flex: 1, height: 34, borderRadius: 4,
              background: mode === t.k ? 'var(--surface-2)' : 'transparent',
              color: mode === t.k ? 'var(--ink-1)' : 'var(--ink-3)',
              fontSize: 12, fontWeight: 600,
              boxShadow: mode === t.k ? 'var(--shadow-xs)' : 'none',
              transition: 'all var(--dur-fast)',
            }}>{t.l}</button>
          ))}
        </div>

        <form onSubmit={(e)=>{e.preventDefault();goToScreen('home');}} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'register' && (
            <div><label className="label">Username</label><input className="input" placeholder="gbzin01" /></div>
          )}
          <div><label className="label">{mode === 'login' ? 'Email / @user' : 'Email'}</label><input className="input" defaultValue={mode==='login'?'voce@bigs.cards':''} placeholder="voce@email.com" /></div>
          <div><label className="label">Senha</label><input className="input" type="password" defaultValue="••••••••" /></div>
          <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ marginTop: 12 }}>
            {mode === 'login' ? 'Entrar no lobby' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  );
}

window.SCREEN_COMPONENTS = window.SCREEN_COMPONENTS || {};
window.SCREEN_COMPONENTS.auth = AuthScreen;
