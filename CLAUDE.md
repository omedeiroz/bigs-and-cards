# Bigs & Cards — Contexto do Projeto

Jogo de cartas estilo Hearthstone onde as cartas representam pessoas reais do grupo de amigos do Arthur. Cada carta tem stats, passiva, especial, counter e duos baseados na personalidade de cada um.

---

## Stack

**Frontend** — `app/`
- React + Vite (JavaScript, não TypeScript)
- react-router-dom para roteamento
- lucide-react para ícones
- Sem CSS framework — tudo inline styles + classes utilitárias do `tokens.css`
- Proxy Vite: `/api` → `http://localhost:3001`

**Backend** — `server/`
- Node.js + Express
- Prisma 5 (não usar v6+, quebrou a sintaxe do datasource)
- PostgreSQL via Neon (serverless)
- JWT com 7 dias de expiração (`bigs_and_cards_secret_2024`)
- bcryptjs para hash de senha
- CORS liberado para localhost:5173 e 5174

**Banco**
- Neon PostgreSQL (já configurado no `server/.env`)
- Schema: apenas `User` por enquanto (id, username, email, password, createdAt, updatedAt)

---

## Design System

Direção: **"Esports + Tarô + boteco"** — fundo preto quente, ouro como acento principal.

Arquivo central: `app/src/tokens.css` — importado no `main.jsx`, define todas as variáveis CSS.

**Cores principais:**
- `--bg: #0A0908` — fundo geral
- `--gold: #FFC93C` — acento primário, botões, destaques
- `--crimson: #FF3D5A` — ATK, dano, perigo
- `--mint: #54E0B0` — DEF, escudo
- `--sapphire: #6BA6FF` — HP, vida
- `--purple: #B17BFF` — elixir/mana/custo
- `--emerald: #8AE234` — vitória, sucesso

**Fontes:**
- `Anton` — display/títulos (var(--font-display))
- `Manrope` — corpo (var(--font-sans))
- `JetBrains Mono` — mono/eyebrow (var(--font-mono))

**Classes utilitárias importantes:**
- `.display` — fonte Anton uppercase
- `.eyebrow` — mono pequeno uppercase espaçado
- `.mono` — JetBrains Mono
- `.btn .btn-primary .btn-ghost .btn-sm .btn-lg .btn-block`
- `.panel .panel-2`
- `.input .label`
- `.pill .pill-gold .pill-crimson .pill-mint .pill-sapphire .pill-purple .pill-emerald .pill-ghost`

---

## Estrutura de Pastas

```
bigs-and-cards/
├── app/                        # Frontend React
│   └── src/
│       ├── main.jsx            # Entry — importa tokens.css
│       ├── App.jsx             # Rotas
│       ├── tokens.css          # Design system completo
│       ├── context/
│       │   └── AuthContext.jsx # { user, login, logout } — JWT em localStorage
│       ├── components/
│       │   ├── Card/index.jsx  # CardTypoBold, CardDoubleFaced, CostGem, StatBlock
│       │   └── Sidebar.jsx     # Nav lateral reutilizada em todas as páginas
│       ├── data/
│       │   └── cards.js        # CARDS array + cardById() — dados fixos do jogo
│       └── pages/
│           ├── Auth.jsx        # Login/cadastro — conectado ao backend real
│           ├── Home.jsx        # Dashboard pós-login
│           ├── Roster.jsx      # Grid de todas as cartas com filtro e ordenação
│           ├── Friends.jsx     # Lista de amigos (em desenvolvimento)
│           ├── Challenges.jsx  # Desafios recebidos/enviados (em desenvolvimento)
│           ├── Lobby.jsx       # Pré-partida (em desenvolvimento)
│           ├── Match.jsx       # Tela de partida (em desenvolvimento)
│           ├── End.jsx         # Resultado da partida (em desenvolvimento)
│           ├── Profile.jsx     # Perfil do usuário logado
│           └── Cards.jsx       # CRUD admin de cartas (rota /cards, legado)
└── server/                     # Backend Node.js
    ├── .env                    # DATABASE_URL + JWT_SECRET
    ├── prisma/
    │   └── schema.prisma       # Model User
    └── src/
        ├── index.js            # Express app, porta 3001
        ├── middleware/auth.js  # Verifica Bearer token JWT
        └── routes/
            ├── auth.js         # POST /api/auth/login, POST /api/auth/register
            └── users.js        # GET /api/users/me
```

---

## Rotas do Frontend

| Path | Página | Auth |
|---|---|---|
| `/login` | Auth.jsx | pública |
| `/home` | Home.jsx | privada |
| `/roster` | Roster.jsx | privada |
| `/friends` | Friends.jsx | privada |
| `/challenges` | Challenges.jsx | privada |
| `/lobby` | Lobby.jsx | privada |
| `/match` | Match.jsx | privada |
| `/end` | End.jsx | privada |
| `/profile` | Profile.jsx | privada |
| `/cards` | Cards.jsx | privada |

---

## AuthContext

```js
const { user, login, logout } = useAuth()
// user = { id, username, email } ou null
// login(userData, token) — salva em localStorage (bigs-user, bigs-token)
// logout() — limpa localStorage e redireciona
```

---

## As 10 Cartas do Jogo

Definidas em `app/src/data/cards.js`. São dados fixos do jogo (não vêm do backend).

| ID | Nome | Custo | ATK | DEF | HP | Raridade |
|---|---|---|---|---|---|---|
| gbzin | Gbzin | 2 | 3 | 2 | 4 | comum |
| pepao | Pepao | 3 | 4 | 3 | 6 | raro |
| hadez | Hadez | 3 | 3 | 3 | 5 | raro |
| davi | Davi | 3 | 2 | 4 | 7 | épico |
| bigs | Bigs | 4 | 4 | 4 | 8 | épico |
| ian | Ian | 2 | 3 | 2 | 3 | comum |
| eric | Eric | 3 | 3 | 3 | 5 | raro |
| pirula | Pirula | 2 | 4 | 1 | 3 | épico |
| gustavo | Gustavo | 3 | 2 | 3 | 6 | raro |
| rena | Rena | 2 | 2 | 3 | 5 | comum |

Cada carta tem: `id, name, code, tagline, cost, atk, def, hp, rarity, accent (cor hex), bio, passive, counter, duo[], special { name, cost, desc }`.

---

## Mecânicas de Jogo (ainda não implementadas)

- 20 HP por jogador
- Combate simultâneo
- Sistema de elixir (máx 10, aumenta por rodada)
- Deck com 2 cópias de cada carta — se zerar deck+tabuleiro+cemitério = derrota
- Cemitério de cartas mortas
- 8 minigames (QTE e outros) acionados por passivas/especiais
- Counters: bônus/penalidade ao enfrentar carta específica
- Duos: bônus quando dois aliados específicos estão no tabuleiro

---

## O Que Está Pronto

- [x] Login e cadastro com backend real (JWT + bcrypt + PostgreSQL)
- [x] Design system completo (tokens.css)
- [x] Componentes de carta (CardTypoBold, CardDoubleFaced)
- [x] Sidebar de navegação
- [x] Todas as telas com layout correto
- [x] Roster com filtro por raridade e ordenação
- [x] Perfil mostra dados reais do usuário logado (username, email)
- [x] Logout funcional

## O Que Falta Implementar

- [ ] Sistema de amigos (backend + frontend)
- [ ] Sistema de desafios (notificações em tempo real)
- [ ] Matchmaking via WebSocket (Socket.io já planejado)
- [ ] Motor de jogo (tabuleiro, turnos, elixir, combate)
- [ ] Minigames (QTE + outros)
- [ ] Histórico de partidas no banco
- [ ] Stats do jogador (wins, losses, rank)
- [ ] Carta main do jogador (escolhida no perfil)
- [ ] Deploy (frontend na Vercel, backend na Render)

---

## Regras de Desenvolvimento

- Nunca mockar dados — se não tiver dado real, mostrar mensagem "não disponível ainda"
- Não usar TypeScript
- Todo o estilo via inline styles + classes utilitárias do tokens.css (sem CSS modules, sem Tailwind)
- Ícones via lucide-react
- Sem dados hardcoded nas páginas — se vier de dados fixos do jogo (CARDS), ok; se for estado do usuário, precisa vir do backend
- CORS do backend precisa incluir a porta que o Vite estiver usando (5173, 5174, 5175...)

---

## Como Rodar

```bash
# Backend (porta 3001)
cd server
npm install
npx prisma generate
node src/index.js

# Frontend (porta 5173+)
cd app
npm install
npm run dev
```
