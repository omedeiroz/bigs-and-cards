# IMPLEMENTAR — 3 telas novas (End · Rank Delta · Leaderboard)

Arquivos prontos pra colar no repo `bigs-and-cards`. Tudo usa as suas convenções:
`react-router-dom`, `lucide-react`, fetch com `Bearer ${token}`, `cardById`, e as
classes/tokens do seu CSS (`--gold`, `.display`, `.eyebrow`, `.panel`, etc).

> **Visualizar antes:** abra `Telas Novas.html` (na raiz deste pacote) no navegador
> pra ver as 3 telas com dados mock e um switcher no topo. É só pra preview — os
> arquivos reais são os de baixo.

---

## 1. Arquivos novos (copiar)

| De (neste pacote) | Para (no repo) |
| --- | --- |
| `app/src/components/RankBadge.jsx` | `app/src/components/RankBadge.jsx` |
| `app/src/components/RankDelta.jsx` | `app/src/components/RankDelta.jsx` |
| `app/src/pages/End.jsx`            | `app/src/pages/End.jsx` *(substitui o placeholder)* |
| `app/src/pages/Leaderboard.jsx`    | `app/src/pages/Leaderboard.jsx` |

Nenhuma dependência nova — `lucide-react` e `react-router-dom` já estão no projeto.

---

## 2. Rota do Leaderboard — `app/src/App.jsx`

Adicione o import e a rota (privada, igual às outras):

```diff
  import End from './pages/End'
+ import Leaderboard from './pages/Leaderboard'
  import Profile from './pages/Profile'
```

```diff
  <Route path="/end"         element={<PrivateRoute><End /></PrivateRoute>} />
+ <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
  <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />
```

---

## 3. Item no menu — `app/src/components/Sidebar.jsx`

Importe o ícone `Trophy` e adicione o item de nav:

```diff
- import { Home, LayoutGrid, Users, Swords, User } from 'lucide-react'
+ import { Home, LayoutGrid, Users, Swords, User, Trophy } from 'lucide-react'

- const ICONS = { Home, LayoutGrid, Users, Swords, User }
+ const ICONS = { Home, LayoutGrid, Users, Swords, User, Trophy }

  const NAV_ITEMS = [
    { id: '/home',       label: 'Início',    icon: 'Home' },
    { id: '/roster',     label: 'Cartas',    icon: 'LayoutGrid' },
    { id: '/friends',    label: 'Amigos',    icon: 'Users' },
    { id: '/challenges', label: 'Desafios',  icon: 'Swords' },
+   { id: '/leaderboard',label: 'Placar',    icon: 'Trophy' },
    { id: '/profile',    label: 'Perfil',    icon: 'User' },
  ]
```

---

## 4. Navegar pro /end no fim da partida — `app/src/pages/Match.jsx`

Hoje a partida encerra num **overlay inline**. Pra usar a tela dedicada, navegue
pra `/end` passando o resultado no `state` quando o jogo acabar.

O `End.jsx` lê **duas fontes**:
- **`location.state`** → resultado da batalha (você monta no Match);
- **`useSocket().rankUpdate`** → o `{ delta, newPts, isWin, rank }` que o server já
  emite via `rank:update` (em ranqueada). O End consome do contexto sozinho — **você
  não precisa repassar o rank**.

### 4a. Detecte o fim e navegue

No `Match.jsx`, dentro do handler que recebe o estado do jogo (onde hoje você decide
mostrar o overlay de vitória/derrota), troque por uma navegação. Exemplo — ajuste os
nomes dos campos pro shape real do seu `game:state`:

```jsx
function onState(s) {
  setState(s)
  setSelected(null)
  setSpecialAim(null)

  // >>> fim de jogo: vai pra tela de resultado
  if (s.status === 'finished') {
    const iWon  = s.winnerId === user.id
    const isDraw = s.winnerId == null
    const me  = s.players.find(p => p.id === user.id)
    const opp = s.players.find(p => p.id !== user.id)

    navigate('/end', {
      replace: true,
      state: {
        result: isDraw ? 'draw' : iWon ? 'win' : 'loss',
        score: `${me?.hp ?? 0}–${opp?.hp ?? 0}`,   // ou o placar que você usar
        rounds: s.round ?? 0,
        duration: formatDuration(s.startedAt),       // helper seu (mm:ss)
        opponent: opp?.username ?? 'oponente',
        matchType: match?.type ?? 'casual',          // 'ranked' | 'casual'
        mvp: s.mvpCardId ?? me?.board?.[0]?.cardId ?? 'bigs',
        stats: [
          { l: 'CARTAS JOGADAS',   v: me?.stats?.cardsPlayed   ?? 0 },
          { l: 'ESPECIAIS USADAS', v: me?.stats?.specialsUsed  ?? 0 },
          { l: 'DANO INFLIGIDO',   v: me?.stats?.damageDealt   ?? 0 },
          { l: 'MINIGAMES GANHOS', v: me?.stats?.minigamesWon  ?? 0 },
        ],
      },
    })
  }
}
```

> Campos como `stats`, `mvpCardId` e `startedAt` dependem do que o seu `game.js`
> devolve. Onde não existir, mande `0`/um fallback — o End degrada bem (já tem
> `FALLBACK` interno). O importante é mandar `result`, `opponent`, `score`,
> `matchType` e `mvp`.

### 4b. (Opcional) MVP de verdade

Se o server ainda não calcula MVP, um critério simples no client: a carta sua que
causou mais dano, ou a de maior custo no seu board. Por ora qualquer `cardId` válido
funciona — o End busca via `cardById`.

### 4c. Imagens do MVP

O `End.jsx` mostra o retrato do MVP via `/cards/${cardId}.png` (mesmo padrão do
`Match.jsx`), com fallback pra inicial da carta. Já funciona com os PNGs em
`app/public/cards/`.

---

## 5. Como o Rank Delta chega na tela

1. Partida ranqueada termina → `server/src/socket.js` aplica `applyMatchResult`
   (win +15..25 / loss −15..20) e emite `rank:update` com `{ delta, newPts, isWin, rank }`.
2. `SocketContext` já escuta esse evento e guarda em `rankUpdate`.
3. `End.jsx` lê `useSocket().rankUpdate` e renderiza `<RankDelta />` automaticamente
   (com badge do tier, contador animado, barra de progresso da divisão).
4. Ao desmontar, `End` chama `clearRankUpdate()` pra não vazar pra próxima tela.

Em **casual** não há `rank:update` → o End esconde o painel de rank e mostra
"◇ PARTIDA CASUAL — NÃO ALTERA SEU RANK". Nada a fazer.

> ⚠️ Confira que o server emite `rank:update` pro socket **antes** de o cliente sair
> da sala da partida — senão o evento chega depois que o End montou. Se houver corrida,
> emita o `rank:update` junto do `game:state { status: 'finished' }`.

---

## 6. Leaderboard — nada a fazer no server

A rota `GET /api/users/leaderboard` já devolve o shape certo
(`{ id, username, rankPoints, wins, losses, position, rank }`, top 50, só
`rankedUnlocked`). O `Leaderboard.jsx` faz o fetch, monta pódio (top 3) + lista
(4..50) e destaca a sua linha comparando `p.id === user.id`.

---

## 7. Checklist

- [ ] Copiar os 4 arquivos
- [ ] App.jsx: import + rota `/leaderboard`
- [ ] Sidebar.jsx: ícone `Trophy` + item "Placar"
- [ ] Match.jsx: `navigate('/end', { state })` no fim do jogo
- [ ] Testar ranqueada (vê o +/− pts) e casual (sem rank)
- [ ] Conferir que `rank:update` é emitido no fim da partida ranqueada

Notas de design: paleta de tiers idêntica à do `RankBadge` que já existe inline no
`Home.jsx` (pode trocar pela importação deste componente pra centralizar). Tudo
desktop-first, igual ao resto do app.
