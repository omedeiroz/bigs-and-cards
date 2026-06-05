# HANDOFF — Tabuleiro interativo (Bigs & Cards)

Notas pro dev sobre **como a mecânica de animação funciona** na tela de Partida
(variante **Clássico**). Tudo vive em `src/screens/match.jsx`, componente
`MatchClassic`. As outras variantes (Split, Compacto) são estáticas — referência
visual só.

> Stack do protótipo: React 18 + Babel standalone, sem build. Cada `.jsx` é
> carregado por `<script type="text/babel">` no `prototype.html` e exporta seus
> componentes via `window.*`. Numa implementação real, troque isso por um bundler
> (Vite) e imports ES normais — a lógica abaixo não muda.

---

## 1. Modelo de estado

Todo o jogo é state local de `MatchClassic` (via `useState`). Os campos que
importam pra animação:

| State | O que é |
| --- | --- |
| `hand` | array de cartas na sua mão. Cada carta tem `id` único. |
| `myBoard` | array (máx 3) de cartas no seu tabuleiro |
| `elixir` | recurso gasto pra jogar (custo = `card.cost`) |
| `deckCount` | quantas cartas sobraram no deck (só um número) |
| `flyers` | **array de cartas "em voo"** — o coração da animação (ver §3) |
| `hoverIdx` | índice da carta da mão sob o mouse (dirige o efeito Hearthstone) |
| `drawId` | id da carta recém-comprada, escondida na mão até o voo terminar |
| `landedSlot` | índice do slot que acabou de receber carta (dispara o flash) |

**Refs de medição** (não causam re-render, só guardam DOM nodes pra medir posição):
- `handRefs.current[cardId]` → o `<div>` de cada carta na mão
- `slotRefs.current[slotIndex]` → cada um dos 3 slots do seu tabuleiro
- `deckRef` → a pilha de deck (canto inferior direito)

---

## 2. O efeito Hearthstone na mão (sem JS de animação — é CSS puro)

Cada carta da mão é um `.bc-hand-card` posicionado em **leque**. Não há biblioteca:
calculamos `transform` inline a partir do índice.

```
offset  = i - (n-1)/2          // distância do centro do leque
tx      = offset * 96px        // espalhamento horizontal
ty      = |offset| * 16px      // arco (pontas mais baixas)
rot     = offset * 4deg        // rotação do leque
```

Quando `hoverIdx === i` (mouse na carta):
- ela vai pra `ty = -150`, `rot = 0`, `scale = 1.5`, `zIndex = 100`
- as **vizinhas** ganham um empurrão lateral (`±52px`) pra "abrir espaço"
- glow = `drop-shadow` na cor de destaque da carta (`c.accent`)

A transição é só `transition: transform 220ms var(--ease-out)` na classe
`.bc-hand-card`. **Hover = trocar de estado → recalcular transform → o CSS
interpola.** Simples e performático.

> Cartas com `cost > elixir` ficam `faded` e mostram "● PRECISA X ELIXIR" em vez de
> "▲ CLIQUE PRA JOGAR".

---

## 3. O `<Flyer>` — toda animação de "carta indo pra algum lugar"

Jogar, comprar e recolher usam **o mesmo componente**. A ideia: uma carta em voo é
um `position: fixed` por cima de tudo (`zIndex: 9999`), que anima de um retângulo
de origem (`from`) até um de destino (`to`) com a **Web Animations API** (`el.animate`).

Cada flyer é um objeto no array `flyers`:

```js
{
  id,                 // chave única
  from: {left, top, width},   // retângulo de origem (medido com getBoundingClientRect)
  to:   {left, top, width},   // retângulo de destino
  lift,               // altura do arco (px) — quão alto a carta "pula" no meio
  dur,                // duração ms (default 560)
  fadeOut,            // some no final? (usado no "recolher")
  content: <CardTypoBold .../>,  // o que é renderizado voando
  kind: 'play' | 'draw' | 'return',
  card, slotIdx       // payload pro onFinish saber o que fazer
}
```

O keyframe (em `Flyer`, via `React.useLayoutEffect`):

```js
el.animate([
  { transform: `... scale(startScale)`,           offset: 0   }, // origem
  { transform: `... translateY(-lift) scale(peak)`, offset: 0.55 }, // pico do arco
  { transform: `... scale(endScale)`, opacity: fadeOut?0:1, offset: 1 }, // destino
], { duration: dur, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' });
```

`startScale`/`endScale` saem da razão entre a largura do `from`/`to` e a largura
base da carta (`FLY_CARD_W = 160`). Isso faz a carta **crescer/encolher** pra bater
exatamente no tamanho do destino (mão = grande, slot de tabuleiro = menor, deck =
bem pequeno). Quando o `animate` termina, `onfinish → onFlyerDone(flyer)`.

### Padrão geral das 3 ações

Todas seguem o mesmo roteiro:

1. **Mede** origem e destino com `getBoundingClientRect()` (das refs).
2. **Atualiza o state "lógico" na hora** (tira a carta da mão / decrementa elixir).
   A carta *real* some; o flyer fica voando no lugar dela.
3. **Empurra um flyer** no array.
4. Quando o voo acaba, **`onFlyerDone`** aplica o resultado final (adiciona ao
   tabuleiro / incrementa deck / loga) e remove o flyer.

#### `playCard(i)` — mão → tabuleiro
- valida elixir e slot livre (máx 3)
- `from` = a carta na mão; `to` = o próximo slot vazio (`slotRefs`)
- remove da mão + desconta elixir **antes** do voo
- `onFlyerDone`: `myBoard.push(card)`, dispara `landedSlot` (flash dourado via
  keyframe CSS `bcLand`), loga "jogou X"

#### `drawCard()` — deck → mão  *(técnica FLIP)*
- cria uma instância nova da carta (`id` único) e **já adiciona à mão**, mas
  escondida (`drawId` = esse id → `opacity: 0`)
- num `useLayoutEffect`, depois do React pintar, mede onde a carta **caiu** na mão
  (`handRefs`) e voa do deck (`deckRef`) até lá
- `onFlyerDone`: limpa `drawId` (carta aparece), loga "comprou carta"
- Esse "adiciona escondido → mede → anima até a posição real" é o padrão **FLIP**;
  evita calcular na mão à mão onde a carta vai parar.

#### `returnCard(k)` — tabuleiro → deck
- `from` = slot `k`; `to` = o deck (encolhe via `deckTargetRect`, `scale 0.42`)
- `fadeOut: true` (some ao chegar no deck)
- `onFlyerDone`: `deckCount++`, loga "recolheu X"

#### `finishTurn()`
- loga, gera uma linha "fake" do oponente (`oppTurnLines` — é cosmético, **não há
  IA**), recarrega elixir, `round++`, e chama `drawCard()` depois de 240ms.

---

## 4. Helpers de geometria

- `rectToFly(rect)` → extrai `{left, top, width}` de um `getBoundingClientRect()`.
- `deckTargetRect(el, scale)` → centro do deck convertido num retângulo pequeno,
  pra carta mirar/encolher no deck.
- `FLY_CARD_W = 160` → largura "canônica" da carta; todas as escalas derivam dela.
- `BOARD_W/BOARD_H/BOARD_SCALE` → cartas no tabuleiro são a carta cheia escalada
  (`scale(132/160)`), pra ficarem menores que as da mão (estilo minion).

---

## 5. O que falta pra virar jogo de verdade

Isto é um **protótipo de UX/animação**, não engine de jogo. Pra produção:

- **Sem regras de batalha** — nada de dano, ataque, morte, vitória. `atk/def/hp`
  das cartas são só exibidos.
- **Oponente é cosmético** — `oppTurnLines` são strings fixas; o board do oponente
  não reage. Trocar por estado real / servidor.
- **Sem persistência / multiplayer / rede.**
- **Mede via DOM** (`getBoundingClientRect`) — ok pra protótipo. Se for animar
  centenas de cartas ou rodar em telas muito variáveis, considere um layout
  engine/virtualização. Pra um TCG normal (≤10 cartas em tela) está ótimo.
- **Acessibilidade** — falta foco por teclado e `prefers-reduced-motion` (hoje
  tudo depende de hover/mouse).

---

## 6. Onde mexer

| Quero mudar… | Vá em `match.jsx` → |
| --- | --- |
| arco/velocidade do voo | `Flyer` (keyframes, `lift`, `dur`) |
| leque e hover da mão | bloco `hand.map(...)` em `MatchClassic` + classe `.bc-hand-card` |
| tamanho da carta no tabuleiro | `BOARD_W/BOARD_H/BOARD_SCALE` |
| regras de jogar/comprar | `playCard` / `drawCard` / `returnCard` |
| flash de aterrissagem | keyframe `@keyframes bcLand` + state `landedSlot` |
| visual da carta | `src/components/cards.jsx` (`CardTypoBold`) |
| dados das cartas | `src/data.js` (`window.BIGS_DATA.CARDS`) |
