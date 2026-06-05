# Bigs & Cards — Documento do Projeto

## Conceito

Jogo de cartas online estilo Hearthstone onde as cartas são pessoas reais do grupo. Possui sistema de combate por rodadas, minigames com QTE, passivas, counters e duos entre cartas.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| WebSocket | Socket.io |
| Banco | PostgreSQL (Neon) |
| ORM | Prisma 5 |
| Auth | JWT + bcryptjs |
| Deploy Frontend | Vercel |
| Deploy Backend | Render |

---

## Estrutura de Pastas

```
bigs-and-cards/
├── app/                        # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── CardItem.jsx
│   │   │   ├── CardList.jsx
│   │   │   └── CardForm.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Cards.jsx
│   │   ├── styles/
│   │   │   ├── auth.css
│   │   │   └── home.css
│   │   └── App.jsx             # Roteador principal
│   └── vite.config.js
│
└── server/                     # Backend Node.js
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── middleware/
    │   │   └── auth.js
    │   ├── routes/
    │   │   ├── auth.js
    │   │   └── users.js
    │   └── index.js
    └── .env
```

---

## Banco de Dados

### Model User (atual)
```prisma
model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Models a criar (futuro)
- `Friendship` — relação entre usuários (pending / accepted)
- `Challenge` — desafio enviado de um usuário para outro
- `Match` — partida com histórico (vencedor, perdedor, rodadas, data)

---

## API Atual

### Auth
| Método | Rota | Body | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/register` | `{ username, email, password }` | Cria conta, retorna token + user |
| POST | `/api/auth/login` | `{ login, password }` | Login com email ou username, retorna token + user |

### Users
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/users/me` | Bearer token | Retorna dados do usuário logado |

### Rotas a criar (futuro)
- `GET /api/users/search?q=` — buscar usuários por username
- `POST /api/friends/request` — enviar pedido de amizade
- `POST /api/friends/accept` — aceitar pedido
- `GET /api/friends` — listar amigos
- `POST /api/challenges` — desafiar um amigo
- `POST /api/challenges/:id/accept` — aceitar desafio → cria sala WebSocket

---

## Rotas do Frontend

| Rota | Página | Proteção |
|------|--------|----------|
| `/login` | Login | Pública (redireciona se logado) |
| `/register` | Cadastro | Pública (redireciona se logado) |
| `/` | Home | Privada |
| `/cards` | Gerenciador de cartas | Privada |
| `/game/:roomId` | Partida | Privada — a criar |

---

## Mecânicas do Jogo

### Setup
- Cada jogador começa com **20 HP**
- Deck com **2 cópias de cada carta** (20 cartas no total)
- Cada jogador saca **4 cartas aleatórias** no início
- Cada jogador começa com **10 de elixir**

### Elixir
- Ganha **+1 por rodada**
- Ganha **+1 extra a cada 2 de dano causado** (ex: 4 de dano = +2 de elixir extra)

### Rodadas
- Cada jogador pode jogar **até 2 cartas por rodada**
- A partir da **rodada 4**, o limite sobe para **3 cartas**
- Exceções por passivas e poderes especiais

### Tabuleiro
- Máximo de **3 cartas ativas** por jogador simultaneamente

### Combate (simultâneo)
- As duas cartas atacam ao mesmo tempo
- Fórmula: `dano recebido = ATK do atacante - DEF da carta alvo`
- Se o resultado for ≤ 0, a carta não toma dano
- Quando a vida da carta chega a 0, ela vai para o **cemitério**
- Dano direto ao jogador ocorre quando uma carta ataca sem bloqueio, ou via especiais

### Minigame por empate de ATK
- Se o ATK do jogador 1 = ATK do jogador 2 → minigame
- Jogador 1 vence → jogador 2 toma **50%** do dano que iria receber
- Jogador 2 vence → jogador 1 toma **60%** do dano que iria receber

### Cemitério
- Cartas mortas vão para o cemitério
- No início de cada rodada, cada carta no cemitério tem **10% de chance** de voltar para a mão
- Quando o deck principal zera, essa chance sobe para **40%**
- Carta que volta do cemitério volta com **vida cheia**

### Condição de derrota
- HP do jogador chega a **0**, OU
- Deck + cemitério + tabuleiro **todos zerados**

### Counters
- Counter só tem **efeito total** se colocado **depois** da carta counterada
- Se a carta counterada for colocada depois: o efeito só ativa quando as duas se **enfrentarem diretamente**

### Mercado (passiva do Hadez)
- Quando ativa, o jogador escolhe entre **2 buffs aleatórios**: +1 ATK, +1 DEF, +1 vida, etc.

---

## Cartas

### Gbzin
| Stat | Valor |
|------|-------|
| Custo | 2 |
| ATK | 3 |
| DEF | 2 |
| Vida | 4 |

- **Passiva:** Ganha +1 ATK a cada 2 rodadas vivo (máx +2)
- **Counter:** Bigs — perde 1 ATK e 1 DEF ao ser colocado após o Bigs
- **Duo:** Pepao — ganha +1 ATK e +1 DEF
- **Especial — Mãos de fogo** (4 elixir, rodada 2+): escolhe uma carta inimiga, ela perde 1 ATK até o fim da rodada. Se Gbzin já tiver +1 ATK acumulado pela passiva, o efeito vira -2 ATK

---

### Pepao
| Stat | Valor |
|------|-------|
| Custo | 3 |
| ATK | 4 |
| DEF | 3 |
| Vida | 6 |

- **Passiva:** 30% de chance de ativar um minigame a cada ataque — se vencer, aplica +1 de dano bônus
- **Counter:** Davi — minigame automático, dono do Davi escolhe o tipo. Se o Pepao vencer, recupera 1 de vida
- **Duo:** Gbzin — ganha +2 ATK e perde 1 DEF
- **Especial — Pepão big head** (3 elixir): provoca um minigame à escolha — se vencer, o adversário pula a próxima jogada de cartas

---

### Hadez
| Stat | Valor |
|------|-------|
| Custo | 3 |
| ATK | 3 |
| DEF | 3 |
| Vida | 5 |

- **Passiva — Mercado:** 25% de chance no início de cada rodada de ganhar +1 ATK ou +1 DEF (aleatório entre os dois)
- **Counter:** Pepao — perde 1 DEF. Se o Pepao tiver Gbzin como duo ativo, perde 1 DEF e 1 ATK
- **Duo:** Rena — ganha +1 DEF e a chance do mercado sobe pra 40%
- **Especial — Camisa 10 mantiqueiras** (4 elixir): se ATK do time superar DEF adversária em 2+, aplica +1 de dano. Se superar em 4+, aplica +2

---

### Davi
| Stat | Valor |
|------|-------|
| Custo | 3 |
| ATK | 2 |
| DEF | 4 |
| Vida | 7 |

- **Passiva:** Quando sofre dano, 30% de chance de refletir 1 de dano pro atacante
- **Counter:** Pepao — minigame automático, dono do Davi escolhe o tipo. Se Pepao vencer, recupera 1 de vida
- **Duo:** Bigs — ganha +1 ATK e minigame especial passa a valer 2 de dano | Ian — chance de roubo do Ian sobe pra 50%, Davi fica imune a roubo de elixir
- **Especial — Chama pra briga** (3 elixir): provoca um jogador específico, forçando a próxima carta dele a enfrentar o Davi

---

### Bigs
| Stat | Valor |
|------|-------|
| Custo | 4 |
| ATK | 4 |
| DEF | 4 |
| Vida | 8 |

- **Passiva:** Se tiver 2+ cartas inimigas no tabuleiro, ganha +1 ATK
- **Counter:** Gbzin — Gbzin perde 1 ATK e Bigs ganha +1 DEF ao enfrentá-lo
- **Duo:** Davi — ganha +1 DEF e regenera 1 de vida por rodada | Eric — ganha +2 ATK mas perde 2 DEF
- **Especial — Modo big** (4 elixir): dobra o custo da próxima carta do adversário nessa rodada

---

### Ian
| Stat | Valor |
|------|-------|
| Custo | 2 |
| ATK | 3 |
| DEF | 2 |
| Vida | 3 |

- **Passiva:** A cada rodada, 25% de chance de roubar 1 de elixir do adversário
- **Counter:** Hadez — cancela a passiva do mercado do Hadez e ele perde 1 ATK enquanto Ian estiver no tabuleiro
- **Duo:** Davi — chance de roubo sobe de 25% pra 50%, Davi fica imune a roubo de elixir
- **Especial — Calote** (3 elixir): rouba 2 de elixir do adversário

---

### Eric
| Stat | Valor |
|------|-------|
| Custo | 3 |
| ATK | 3 |
| DEF | 3 |
| Vida | 5 |

- **Passiva:** Quando enfrenta uma carta com ATK maior que o dele, ganha +1 ATK nessa batalha
- **Counter:** Pirula (mútuo) — se colocado antes do Pirula, Pirula nasce com -1 ATK. Se depois, Eric perde 1 DEF
- **Duo:** Bigs — ganha +1 ATK e +1 DEF
- **Especial — Vira o jogo** (4 elixir): troca os valores de ATK e DEF de uma carta inimiga por 1 rodada

---

### Pirula
| Stat | Valor |
|------|-------|
| Custo | 2 |
| ATK | 4 |
| DEF | 1 |
| Vida | 3 |

- **Passiva:** Se matar uma carta inimiga, ganha +1 ATK (acumulável)
- **Counter:** Eric (mútuo) — se colocado antes do Eric, Eric perde 1 DEF. Se depois, Pirula perde 1 ATK
- **Duo:** Gustavo — ganha +1 DEF e o All in passa a custar 4 elixir ao invés de 5
- **Especial — All in** (5 elixir, 1x por partida): aplica todo o ATK atual diretamente no jogador, ignorando cartas de defesa

---

### Gustavo
| Stat | Valor |
|------|-------|
| Custo | 3 |
| ATK | 2 |
| DEF | 3 |
| Vida | 6 |

- **Passiva:** Ganha +1 DEF a cada rodada que não sofrer dano
- **Counter:** Ian — imune ao roubo de elixir do Ian e cancela a passiva dele
- **Duo:** Pirula — ganha +1 ATK e a passiva de DEF acumula 2x mais rápido | Hadez — chance do mercado do Hadez sobe pra 40%
- **Especial — Blindagem** (3 elixir): por 1 rodada, uma carta aliada fica imune a counters

---

### Rena
| Stat | Valor |
|------|-------|
| Custo | 2 |
| ATK | 2 |
| DEF | 3 |
| Vida | 5 |

- **Passiva:** No início de cada rodada, uma carta aliada aleatória recupera 1 de vida
- **Counter:** Gbzin — enquanto Rena estiver no tabuleiro, a passiva de ATK acumulado do Gbzin fica pausada
- **Duo:** Hadez — Hadez ganha +1 DEF e chance do mercado sobe pra 40%, e a cura da Rena passa a ser direcionada à carta aliada com menos vida
- **Especial — Estouro de elixir** (3 elixir): todas as cartas aliadas no tabuleiro recuperam 1 de vida e ganham +1 DEF por 1 rodada

---

## Tabela de Counters

| Carta | Countera |
|-------|----------|
| Davi | Pepao |
| Ian | Hadez |
| Eric | Pirula (mútuo) |
| Pirula | Eric (mútuo) |
| Gustavo | Ian |
| Rena | Gbzin |
| Gbzin | — (é counterado por Bigs e Rena) |

---

## Tabela de Duos

| Carta | Duo com |
|-------|---------|
| Gbzin | Pepao |
| Pepao | Gbzin |
| Hadez | Rena |
| Rena | Hadez |
| Davi | Bigs, Ian |
| Bigs | Davi, Eric |
| Ian | Davi |
| Eric | Bigs |
| Pirula | Gustavo |
| Gustavo | Pirula, Hadez |

---

## Minigames

| # | Nome | Tipo | Descrição |
|---|------|------|-----------|
| 1 | Teclado Quente | QTE | Sequência de 4 teclas aparece por 1.5s, primeiro a digitar certo vence |
| 2 | Segura o Choro | QTE | Barra enchendo, para o mais próximo de uma zona alvo |
| 3 | Reação Pura | QTE | Tela vermelha por tempo aleatório → vira verde → quem apertar primeiro vence |
| 4 | Clique Frenético | QTE | 5 segundos, cada jogador tem seu botão, quem clicar mais vence |
| 5 | Blefe | Leitura | Cada um escolhe 1-5 secretamente, revelam ao mesmo tempo, maior vence. Empate → sudden death 1-3 |
| 6 | Par ou Ímpar | Clássico | Cada um escolhe par/ímpar, depois os dois digitam 1-10, soma decide |
| 7 | Mira Louca | Precisão | Alvo pequeno se move pela tela, primeiro a clicar 3 vezes vence |
| 8 | Pedra Papel Tesoura | Estratégia | Melhor de 3, reveal simultâneo animado |

### Triggers de minigame
- ATK dos dois jogadores igual na mesma rodada → minigame aleatório
- Passiva do Pepao (30% a cada ataque)
- Especial "Pepão big head"
- Counter Davi vs Pepao
- Especial "Chama pra briga" do Davi

---

## O que está pronto

- [x] Gerenciador de cartas (`/cards`)
- [x] Backend com auth (register/login) + JWT
- [x] Banco de dados PostgreSQL conectado (Neon)
- [x] Tela de login (`/login`)
- [x] Tela de cadastro (`/register`)
- [x] Tela home (`/`)
- [x] Rotas protegidas

## O que falta construir

### Frontend
- [ ] Sistema de busca e adição de amigos
- [ ] Sistema de desafios
- [ ] Tela de lobby (sala de espera antes da partida)
- [ ] Tela do jogo (`/game/:roomId`)
  - [ ] Tabuleiro com cartas
  - [ ] Sistema de elixir
  - [ ] Animações de combate
  - [ ] 8 minigames
  - [ ] HUD (HP, elixir, rodada, mão de cartas)

### Backend
- [ ] Rotas de amigos (`/api/friends`)
- [ ] Rotas de desafios (`/api/challenges`)
- [ ] Socket.io — salas de jogo
- [ ] Lógica de combate server-side
- [ ] Histórico de partidas
- [ ] Estatísticas por usuário
