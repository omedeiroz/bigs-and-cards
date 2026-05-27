# Bigs & Cards — Protótipo & Handoff

Protótipo HTML clicável das **11 telas** do Bigs & Cards, com **2-3 variantes cada**. Pra mandar pro Claude Code reproduzir em React de verdade.

Abre `prototype.html` no navegador. A barra flutuante no rodapé navega entre telas; à direita dela, ficam as variantes da tela atual.

---

## Direção visual

**Esports + tarô + boteco.** Base preta quente, ouro como acento primário, crimson/mint/sapphire/purple pra stats e elixir. Tipografia: `Anton` display condensado, `Manrope` UI, `JetBrains Mono` pra códigos e timestamps.

Tom de copy: **zoeira informal**, sem emoji. "Bora pra cima", "Vai encarar?", "Lavada", etc.

Tokens completos em [`tokens.css`](tokens.css).

---

## Estrutura de arquivos

```
prototype.html                      ← entrypoint, carrega tudo
tokens.css                          ← variáveis CSS (cores, fonts, spacing, sombras)
src/
├── data.js                         ← mock de cartas, amigos, partidas, desafios
├── app.jsx                         ← shell + nav de telas + router por hash
├── components/
│   ├── icons.jsx                   ← wrapper de Lucide
│   ├── cards.jsx                   ← 3 variantes de carta (TypoBold, PhotoOverlay, DoubleFaced)
│   └── card-detail.jsx             ← modal de detalhe (passiva, counter, duo, especial)
└── screens/
    ├── auth.jsx                    ← login + cadastro (2 variantes)
    ├── home.jsx                    ← dashboard pós-login (2 variantes) + Sidebar global
    ├── roster.jsx                  ← gerenciador de cartas (2 variantes)
    ├── card-detail-screen.jsx      ← anatomia da carta com 3 variantes visuais
    ├── friends.jsx                 ← lista + busca de amigos (2 variantes)
    ├── challenges.jsx              ← desafios enviados/recebidos (2 variantes)
    ├── lobby.jsx                   ← sala de espera (2 variantes)
    ├── match.jsx                   ← TABULEIRO — 3 variantes (Clássico, Split, Compacto)
    ├── end.jsx                     ← fim de partida (Vitória / Derrota)
    └── profile.jsx                 ← perfil + histórico (2 variantes)
```

---

## Como mandar pro Claude Code

Aponta o Claude Code pra este projeto e fala:

> Recria este protótipo como app React + Vite + TypeScript de verdade. Mantém a estrutura de pastas. Cada `src/screens/*.jsx` vira uma `<route>` no react-router. O `data.js` vira um módulo `src/data/mock.ts` tipado. Os tokens viram um `tokens.css` global (mantém os nomes das variáveis). Substitui o nav flutuante do protótipo por roteamento real (`/login`, `/`, `/roster`, `/match/:id`, etc).
>
> Componentes de carta (`CardTypoBold`, `CardPhotoOverlay`, `CardDoubleFaced`) viram componentes React tipados em `src/components/Card/`. Escolhe **uma** das três variantes pra cada uso real — sugestão: `CardTypoBold` por padrão no roster e tabuleiro, `CardDoubleFaced` no detalhe.
>
> A tela de partida (`match.jsx`) tem 3 layouts diferentes. Implementa o **Clássico** primeiro (`MatchClassic`) — é o mais Hearthstone-like, melhor base pra animar.

### Variantes escolhidas ✅

| # | Tela        | Variante final              | Componente              |
|---|-------------|-----------------------------|-------------------------|
| 1 | Auth        | **A** — Split               | `AuthSplit`             |
| 2 | Home        | **A** — Sidebar             | `HomeSidebar`           |
| 3 | Roster      | **A** — Grid                | `RosterGrid`            |
| 4 | Carta       | **Dupla-Face**              | `CardDoubleFaced`       |
| 5 | Amigos      | **B** — Cards               | `FriendsCards`          |
| 6 | Desafios    | **B** — Inbox               | `ChallengesInbox`       |
| 7 | Lobby       | **A** — Mirror              | `LobbyMirror`           |
| 8 | **Partida** | **Compacto**                | `MatchCompact`          |
| 9 | Fim         | n/a — vitória e derrota são variantes do MESMO componente | `EndScreen` |
| 10| Perfil      | **A** — Stats               | `ProfileStats`          |

> Pro Claude Code: **só implementa esses componentes**. Pode apagar as variantes B/A não escolhidas, ou manter como referência se preferir. A escolha da carta (`CardDoubleFaced`) substitui a sugestão antiga do README de usar `CardTypoBold` por padrão — agora é Dupla-Face em todos os lugares (roster, mão, tabuleiro, detalhe).

---

## Decisões de design já tomadas

- **HP em ring circular** (não barra) — mais legível à distância
- **Elixir como gemas roxas** (não círculos azuis tipo Hearthstone) pra não copiar
- **Tabuleiro: 3 slots por jogador** (espec do PROJETO.md)
- **Cartas no tabuleiro são `size="sm"`** pra caber 3+3 sem scroll
- **Cartas na mão são `size="sm"` em arco**, com fan-out via rotação + translate
- **Log da partida é flutuante** — não rouba espaço do tabuleiro
- **Tema único dark** — light theme não faz sentido pra um jogo de cartas com glow

## O que NÃO tá no protótipo

- **Minigames** (pulei a pedido — voltar quando tiver direção)
- **Foto real dos jogadores** — todos os retratos são placeholders. Quando tiver as fotos, o componente `CardPhotoOverlay` já tá estruturado pra receber `card.photoUrl`
- **Animações de jogada** (cartas voando pra mesa, dano flutuando, etc) — só transições básicas de UI. Adicionar com `framer-motion` ou GSAP no React
- **Som** — efeitos sonoros de carta colocada, dano, vitória, etc. Howler.js no React
- **Sistema de matchmaking real** — UI já tá lá (lobby), backend é separado

---

## Próximos passos sugeridos

1. **Você revisa o protótipo** e escolhe variantes finais
2. Decidimos visual de retrato (foto real vs placeholder) e ajustamos `cards.jsx`
3. Volto pra desenhar os minigames (8 no total)
4. Você manda pro Claude Code com este README como instrução
