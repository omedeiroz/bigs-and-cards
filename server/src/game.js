const { CARDS, CARD_BY_ID } = require('./data/cards')
const ABILITIES = require('./abilities')

const STARTING_HAND = 3
const STARTING_ELIXIR = 5
const ELIXIR_CAP = 10
const PLAYER_HP = 20

// Slots do tabuleiro aumentam com o avanço das rodadas
function boardCap(round) {
  if (round >= 7) return 5
  if (round >= 5) return 4
  return 3
}

const games = new Map() // roomId -> game
let uidCounter = 1

function buildDeck() {
  const deck = []
  for (const c of CARDS) { deck.push(c.id); deck.push(c.id) }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function makePlayer(p) {
  const deck = buildDeck()
  const hand = deck.splice(0, STARTING_HAND)
  return {
    id: p.id,
    username: p.username,
    hp: PLAYER_HP,
    maxElixir: STARTING_ELIXIR,
    elixir: STARTING_ELIXIR,
    hasStarted: false,
    deck,
    hand,
    board: [],
    graveyard: [],
    stats: { cardsPlayed: 0, specialsUsed: 0, damageDealt: 0, minigamesWon: 0 },
  }
}

function makeMinion(cardId) {
  const def = CARD_BY_ID[cardId]
  return {
    uid: uidCounter++,
    cardId,
    baseAtk: def.atk,
    baseDef: def.def,
    permAtk: 0,
    permDef: 0,
    tempMods: [],          // { atk?, def?, untilRound }
    maxHp: def.hp,
    hp: def.hp,
    summoned: true,
    hasAttacked: false,
    roundsAlive: 0,
    tookDamageThisRound: false,
  }
}

function opponentId(game, userId) {
  return game.order.find(id => id !== userId)
}

function hasOn(player, cardId) {
  return player.board.some(x => x.cardId === cardId)
}

// ---- Stats efetivos ----
function tempSum(m, key) {
  return m.tempMods.reduce((s, t) => s + (t[key] || 0), 0)
}

// Contribuições contínuas de COUNTERS e DUOS (enquanto ambos no tabuleiro)
function isCounterImmune(game, m) {
  return m.counterImmuneUntil != null && m.counterImmuneUntil >= game.round
}

function counterDuoStat(game, ownerId, m) {
  const me = game.players[ownerId]
  const opp = game.players[opponentId(game, ownerId)]
  let atk = 0, def = 0
  const immune = isCounterImmune(game, m)

  // -- counters contínuos (anulados pela Blindagem do Gustavo)
  if (!immune) {
    if (m.cardId === 'hadez' && hasOn(opp, 'pepao')) {
      def -= 1
      if (hasOn(opp, 'gbzin')) atk -= 1  // Pepao+Gbzin duo intensifica
    }
    if (m.cardId === 'hadez' && hasOn(opp, 'ian')) atk -= 1
  }

  // -- duos
  if (m.cardId === 'gbzin'   && hasOn(me, 'pepao'))   { atk += 1; def += 1 }
  if (m.cardId === 'pepao'   && hasOn(me, 'gbzin'))   { atk += 2; def -= 1 }
  if (m.cardId === 'hadez'   && hasOn(me, 'rena'))    { def += 1 }
  if (m.cardId === 'davi'    && hasOn(me, 'bigs'))    { atk += 1 }
  if (m.cardId === 'bigs'    && hasOn(me, 'davi'))    { def += 1 }
  if (m.cardId === 'bigs'    && hasOn(me, 'eric'))    { atk += 2; def -= 2 }
  if (m.cardId === 'eric'    && hasOn(me, 'bigs'))    { atk += 1; def += 1 }
  if (m.cardId === 'pirula'  && hasOn(me, 'gustavo')) { def += 1 }
  if (m.cardId === 'gustavo' && hasOn(me, 'pirula'))  { atk += 1 }

  return { atk, def }
}

function continuousMod(game, ownerId, m, key) {
  let mod = 0
  const ab = ABILITIES[m.cardId]
  if (ab && ab.continuous) {
    const me = game.players[ownerId]
    const opp = game.players[opponentId(game, ownerId)]
    const r = ab.continuous(m, { me, opp, game, ownerId })
    if (r && r[key]) mod += r[key]
  }
  const cd = counterDuoStat(game, ownerId, m)
  if (cd[key]) mod += cd[key]
  return mod
}

function effAtk(game, ownerId, m) {
  return Math.max(0, m.baseAtk + m.permAtk + tempSum(m, 'atk') + continuousMod(game, ownerId, m, 'atk'))
}
function effDef(game, ownerId, m) {
  return Math.max(0, m.baseDef + m.permDef + tempSum(m, 'def') + continuousMod(game, ownerId, m, 'def'))
}

function createGame(roomId, playerA, playerB) {
  const game = {
    roomId,
    players: { [playerA.id]: makePlayer(playerA), [playerB.id]: makePlayer(playerB) },
    order: [playerA.id, playerB.id],
    turn: Math.random() < 0.5 ? playerA.id : playerB.id,
    round: 1,
    turnsThisRound: 0,
    status: 'playing',
    winner: null,
  }
  // o starter já "usou" seu primeiro turno (não ganha +1 elixir nele) e compra 1
  const starter = game.players[game.turn]
  starter.hasStarted = true
  if (starter.deck.length > 0) starter.hand.push(starter.deck.shift())

  games.set(roomId, game)
  return game
}

function getGame(roomId) { return games.get(roomId) }
function removeGame(roomId) { games.delete(roomId) }

function playCard(roomId, userId, handIndex) {
  const game = games.get(roomId)
  if (!game || game.status !== 'playing') return { error: 'Partida não encontrada' }
  if (game.turn !== userId) return { error: 'Não é seu turno' }

  const player = game.players[userId]
  const cap = boardCap(game.round)
  if (player.board.length >= cap) return { error: `Tabuleiro cheio (máx ${cap})` }

  if (player.skipNextCardPlay) {
    delete player.skipNextCardPlay
    return { error: 'Pepão big head! Você não pode jogar cartas nesse turno.' }
  }

  const cardId = player.hand[handIndex]
  if (!cardId) return { error: 'Carta inválida' }

  const def = CARD_BY_ID[cardId]
  // Bigs "Modo big": dobra o custo da próxima carta do oponente nessa rodada
  const costMult = (player.nextCardCostMult && player.nextCardCostMult.untilRound >= game.round) ? player.nextCardCostMult.value : 1
  const actualCost = def.cost * costMult
  if (player.elixir < actualCost) return { error: 'Elixir insuficiente' }

  player.elixir -= actualCost
  if (costMult > 1) delete player.nextCardCostMult
  player.hand.splice(handIndex, 1)
  const minion = makeMinion(cardId)
  const opp = game.players[opponentId(game, userId)]

  // counters por ordem de colocação (debuff permanente quando entra depois)
  if (cardId === 'gbzin' && hasOn(opp, 'bigs')) { minion.permAtk -= 1; minion.permDef -= 1 }
  if (cardId === 'eric'  && hasOn(opp, 'pirula')) { minion.permDef -= 1 }
  if (cardId === 'pirula'&& hasOn(opp, 'eric'))   { minion.permAtk -= 1 }

  player.board.push(minion)
  player.stats.cardsPlayed++

  // Davi "Chama pra briga": a próxima carta do oponente enfrenta o Davi imediatamente
  if (player.tauntOnPlay && player.tauntOnPlay.untilRound >= game.round) {
    const davi = opp.board.find(x => x.uid === player.tauntOnPlay.byUid && x.cardId === 'davi')
    delete player.tauntOnPlay
    if (davi) {
      const combat = forcedTrade(game, userId, minion, oppId => opp, davi)
      return { ok: true, tauntCombat: combat }
    }
  }

  return { ok: true }
}

// Trade forçado (usado pelo taunt do Davi). Atacante = a carta recém-baixada, defensor = Davi.
function forcedTrade(game, attackerOwnerId, attacker, _, defender) {
  const oppId = opponentId(game, attackerOwnerId)
  const me = game.players[attackerOwnerId]
  const opp = game.players[oppId]

  const aAtk = effAtk(game, attackerOwnerId, attacker)
  const dAtk = effAtk(game, oppId, defender)
  const aDef = effDef(game, attackerOwnerId, attacker)
  const dDef = effDef(game, oppId, defender)
  const aB = combatBonus(game, attackerOwnerId, attacker, defender, aAtk, dAtk)
  const dB = combatBonus(game, oppId, defender, attacker, dAtk, aAtk)
  const cp = counterCombatPair(attacker, defender, game)

  const dmgToDef = Math.max(0, (aAtk + (aB.atk || 0) + cp.a.atk) - (dDef + (dB.def || 0) + cp.d.def))
  const dmgToAtk = Math.max(0, (dAtk + (dB.atk || 0) + cp.d.atk) - (aDef + (aB.def || 0) + cp.a.def))

  applyDamage(game, oppId, defender, attacker, dmgToDef)
  applyDamage(game, attackerOwnerId, attacker, defender, dmgToAtk)

  const deaths = [
    ...opp.board.filter(m => m.hp <= 0).map(m => m.uid),
    ...me.board.filter(m => m.hp <= 0).map(m => m.uid),
  ]

  if (defender.hp <= 0) {
    const ab = ABILITIES[attacker.cardId]
    if (ab && ab.onKill) ab.onKill(attacker, { game })
  }
  if (attacker.hp <= 0) {
    const ab = ABILITIES[defender.cardId]
    if (ab && ab.onKill) ab.onKill(defender, { game })
  }
  resolveDeaths(opp); resolveDeaths(me)
  checkWin(game)

  return {
    type: 'attack',
    attackerUid: attacker.uid, attackerOwner: attackerOwnerId,
    target: { type: 'card', uid: defender.uid, ownerId: oppId },
    dmgToTarget: dmgToDef, dmgToAttacker: dmgToAtk,
    deaths,
    taunt: true,
  }
}

function applyDamage(game, targetOwnerId, target, source, dmg) {
  if (dmg <= 0) return
  target.hp -= dmg
  target.tookDamageThisRound = true
  const ab = ABILITIES[target.cardId]
  if (ab && ab.onDamaged) ab.onDamaged(target, source, { rng: Math.random, game, ownerId: targetOwnerId })
}

function resolveDeaths(player) {
  const survivors = []
  for (const m of player.board) {
    if (m.hp > 0) { survivors.push(m); continue }
    const chance = player.deck.length === 0 ? 0.40 : 0.20
    if (Math.random() < chance) player.hand.push(m.cardId)
    else player.graveyard.push(m.cardId)
  }
  player.board = survivors
}

function checkWin(game) {
  for (const id of game.order) {
    if (game.players[id].hp <= 0) {
      game.status = 'ended'
      game.winner = opponentId(game, id)
      return
    }
  }
}

function combatBonus(game, ownerId, m, enemy, myEffAtk, enemyEffAtk) {
  const ab = ABILITIES[m.cardId]
  if (ab && ab.combat) return ab.combat(m, enemy, { myEffAtk, enemyEffAtk, game, ownerId }) || {}
  return {}
}

// Counters de combate (Bigs vs Gbzin) — Blindagem do Gustavo anula no alvo imune
function counterCombatPair(attacker, defender, game) {
  let a = { atk: 0, def: 0 }, d = { atk: 0, def: 0 }
  const aImmune = isCounterImmune(game, attacker)
  const dImmune = isCounterImmune(game, defender)

  if (attacker.cardId === 'bigs' && defender.cardId === 'gbzin') {
    if (!aImmune) a.def += 1
    if (!dImmune) d.atk -= 1
  }
  if (attacker.cardId === 'gbzin' && defender.cardId === 'bigs') {
    if (!aImmune) a.atk -= 1
    if (!dImmune) d.def += 1
  }
  return { a, d }
}

function attack(roomId, userId, attackerUid, target) {
  const game = games.get(roomId)
  if (!game || game.status !== 'playing') return { error: 'Partida não encontrada' }
  if (game.turn !== userId) return { error: 'Não é seu turno' }

  const me = game.players[userId]
  const oppId = opponentId(game, userId)
  const opp = game.players[oppId]
  const attacker = me.board.find(m => m.uid === attackerUid)
  if (!attacker) return { error: 'Atacante inválido' }
  if (attacker.summoned) return { error: 'Carta não pode atacar no turno que entrou' }
  if (attacker.hasAttacked) return { error: 'Essa carta já atacou nesse turno' }
  if (target?.type === 'player') return { error: 'Só dá pra atacar cartas inimigas' }

  const aAtk = effAtk(game, userId, attacker)
  const myBonus = (me.teamDamageBonus && me.teamDamageBonus.untilRound >= game.round) ? me.teamDamageBonus.value : 0
  const oppBonus = (opp.teamDamageBonus && opp.teamDamageBonus.untilRound >= game.round) ? opp.teamDamageBonus.value : 0
  const event = { type: 'attack', attackerUid, attackerOwner: userId, deaths: [] }

  if (target?.type === 'player') {
    const dmg = aAtk + myBonus
    opp.hp -= dmg
    attacker.hasAttacked = true
    event.target = { type: 'player', ownerId: oppId }
    event.dmgToTarget = dmg
    event.dmgToAttacker = 0
    me.stats.damageDealt += dmg

    // Pepão passive: 30% ao atacar o jogador adversário
    if (!game._minigameTrigger && attacker.cardId === 'pepao' && Math.random() < 0.30) {
      game._minigameTrigger = { pepaoOwnerId: userId }
    }
  } else {
    const defender = opp.board.find(m => m.uid === target?.uid)
    if (!defender) return { error: 'Alvo inválido' }

    const dAtk = effAtk(game, oppId, defender)
    const aDef = effDef(game, userId, attacker)
    const dDef = effDef(game, oppId, defender)

    const aB = combatBonus(game, userId, attacker, defender, aAtk, dAtk)
    const dB = combatBonus(game, oppId, defender, attacker, dAtk, aAtk)
    const cp = counterCombatPair(attacker, defender, game)

    const dmgToDef = Math.max(0, (aAtk + (aB.atk || 0) + cp.a.atk + myBonus)  - (dDef + (dB.def || 0) + cp.d.def))
    const dmgToAtk = Math.max(0, (dAtk + (dB.atk || 0) + cp.d.atk + oppBonus) - (aDef + (aB.def || 0) + cp.a.def))

    applyDamage(game, oppId, defender, attacker, dmgToDef)
    applyDamage(game, userId, attacker, defender, dmgToAtk)
    attacker.hasAttacked = true
    me.stats.damageDealt += dmgToDef

    event.target = { type: 'card', uid: defender.uid, ownerId: oppId }
    event.dmgToTarget = dmgToDef
    event.dmgToAttacker = dmgToAtk
    event.deaths = [
      ...opp.board.filter(m => m.hp <= 0).map(m => m.uid),
      ...me.board.filter(m => m.hp <= 0).map(m => m.uid),
    ]

    if (defender.hp <= 0) {
      const ab = ABILITIES[attacker.cardId]
      if (ab && ab.onKill) ab.onKill(attacker, { game })
    }
    if (attacker.hp <= 0) {
      const ab = ABILITIES[defender.cardId]
      if (ab && ab.onKill) ab.onKill(defender, { game })
    }

    resolveDeaths(opp)
    resolveDeaths(me)

    // Pepão passive: 30% quando Pepão participa de um combate carta-vs-carta
    if (!game._minigameTrigger) {
      const pepaoInvolved = attacker.cardId === 'pepao' || defender.cardId === 'pepao'
      if (pepaoInvolved && Math.random() < 0.30) {
        const pepaoOwnerId = attacker.cardId === 'pepao' ? userId : oppId
        game._minigameTrigger = { pepaoOwnerId }
      }
    }
  }

  checkWin(game)
  return { ok: true, event }
}

// ============ ESPECIAIS ============

function specialCost(game, ownerId, m) {
  const def = CARD_BY_ID[m.cardId]
  if (!def?.special) return Infinity
  let cost = def.special.cost
  // Pirula+Gustavo duo: All in custa 4
  if (m.cardId === 'pirula' && hasOn(game.players[ownerId], 'gustavo')) cost = 4
  return cost
}

const SPECIAL_TARGETS = {
  gbzin:   'enemyCard',
  eric:    'enemyCard',
  gustavo: 'allyCard',
  // ian, hadez, davi, bigs, pirula, rena: sem alvo
}

const SPECIALS = {
  ian({ me, opp }) {
    const stolen = Math.min(2, opp.elixir)
    opp.elixir -= stolen
    me.elixir = Math.min(me.maxElixir, me.elixir + stolen)
    return { event: { stolen } }
  },

  pirula({ game, userId, source, opp, oppId }) {
    const dmg = effAtk(game, userId, source)
    opp.hp -= dmg
    return { event: { target: { type: 'player', ownerId: oppId }, dmgToTarget: dmg } }
  },

  rena({ game, me }) {
    for (const x of me.board) {
      x.hp = Math.min(x.maxHp, x.hp + 1)
      x.tempMods.push({ def: 1, untilRound: game.round })
    }
    return { event: { affectedAll: true, ownerId: me.id } }
  },

  gbzin({ game, target, opp, oppId, source }) {
    if (target?.type !== 'card') return { error: 'Escolha uma carta inimiga' }
    const card = opp.board.find(x => x.uid === target.uid)
    if (!card) return { error: 'Alvo inválido' }
    const drop = source.permAtk >= 1 ? -2 : -1
    card.tempMods.push({ atk: drop, untilRound: game.round })
    return { event: { target: { type: 'card', uid: card.uid, ownerId: oppId } } }
  },

  eric({ game, target, opp, oppId }) {
    if (target?.type !== 'card') return { error: 'Escolha uma carta inimiga' }
    const card = opp.board.find(x => x.uid === target.uid)
    if (!card) return { error: 'Alvo inválido' }
    // swap baseado nos stats base (até o fim da rodada)
    const delta = card.baseDef - card.baseAtk
    card.tempMods.push({ atk: delta, def: -delta, untilRound: game.round })
    return { event: { target: { type: 'card', uid: card.uid, ownerId: oppId } } }
  },

  gustavo({ game, target, me }) {
    if (target?.type !== 'card') return { error: 'Escolha uma carta aliada' }
    const card = me.board.find(x => x.uid === target.uid)
    if (!card) return { error: 'Alvo inválido' }
    card.counterImmuneUntil = game.round
    return { event: { target: { type: 'card', uid: card.uid, ownerId: me.id } } }
  },

  hadez({ game, me, opp }) {
    const myAtk  = me.board.reduce((s, x) => s + effAtk(game, me.id, x), 0)
    const oppDef = opp.board.reduce((s, x) => s + effDef(game, opp.id, x), 0)
    const delta = myAtk - oppDef
    let bonus = 0
    if (delta >= 4) bonus = 2
    else if (delta >= 2) bonus = 1
    me.teamDamageBonus = { value: bonus, untilRound: game.round }
    return { event: { teamBonus: bonus, delta } }
  },

  davi({ game, source, opp }) {
    opp.tauntOnPlay = { byUid: source.uid, untilRound: game.round }
    return { event: {} }
  },

  bigs({ game, opp }) {
    opp.nextCardCostMult = { value: 2, untilRound: game.round }
    return { event: {} }
  },

  pepao({ game, userId }) {
    game._minigameTrigger = { pepaoSpecial: true, pepaoOwnerId: userId }
    return { event: { minigame: true } }
  },
}

function activateSpecial(roomId, userId, sourceUid, target) {
  const game = games.get(roomId)
  if (!game || game.status !== 'playing') return { error: 'Partida não encontrada' }
  if (game.turn !== userId) return { error: 'Não é seu turno' }

  const me = game.players[userId]
  const oppId = opponentId(game, userId)
  const opp = game.players[oppId]
  const source = me.board.find(x => x.uid === sourceUid)
  if (!source) return { error: 'Carta inválida' }
  if (source.specialUsed) return { error: 'Especial já usado nessa partida' }

  const handler = SPECIALS[source.cardId]
  if (!handler) return { error: 'Esta carta não tem especial implementado' }

  const cost = specialCost(game, userId, source)
  if (me.elixir < cost) return { error: 'Elixir insuficiente' }

  const result = handler({ game, userId, me, oppId, opp, source, target, rng: Math.random })
  if (result?.error) return result

  me.elixir -= cost
  me.stats.specialsUsed++
  if (result?.event?.dmgToTarget) me.stats.damageDealt += result.event.dmgToTarget
  if (source.cardId === 'pirula') source.specialUsed = true

  const event = {
    type: 'special',
    cardId: source.cardId,
    sourceUid: source.uid,
    sourceOwner: userId,
    ...(result?.event || {}),
  }

  resolveDeaths(opp); resolveDeaths(me)
  checkWin(game)
  return { ok: true, event }
}

function endTurn(roomId, userId) {
  const game = games.get(roomId)
  if (!game || game.status !== 'playing') return { error: 'Partida não encontrada' }
  if (game.turn !== userId) return { error: 'Não é seu turno' }

  // limpa bloqueio de carta do jogador que está encerrando turno
  if (game.players[userId].skipNextCardPlay) delete game.players[userId].skipNextCardPlay

  game.turnsThisRound++
  if (game.turnsThisRound >= 2) {
    game.round++
    game.turnsThisRound = 0
    // expira modificadores temporários (até o fim da rodada)
    for (const id of game.order) {
      const p = game.players[id]
      for (const m of p.board) {
        m.tempMods = m.tempMods.filter(t => t.untilRound >= game.round)
        if (m.counterImmuneUntil != null && m.counterImmuneUntil < game.round) delete m.counterImmuneUntil
      }
      // expira mods de jogador (Hadez/Bigs/Davi)
      if (p.teamDamageBonus  && p.teamDamageBonus.untilRound  < game.round) delete p.teamDamageBonus
      if (p.nextCardCostMult && p.nextCardCostMult.untilRound < game.round) delete p.nextCardCostMult
      if (p.tauntOnPlay      && p.tauntOnPlay.untilRound      < game.round) delete p.tauntOnPlay
    }
  }

  const next = opponentId(game, userId)
  game.turn = next
  const np = game.players[next]

  // elixir acumulativo: ganha +1/rodada (a partir do 2º turno do jogador), teto sobe 5->10
  np.maxElixir = Math.min(ELIXIR_CAP, STARTING_ELIXIR + (game.round - 1))
  const elixirRegen = game.round >= 5 ? 4 : 2
  if (np.hasStarted) np.elixir = Math.min(np.maxElixir, np.elixir + elixirRegen)
  else np.hasStarted = true

  // upkeep das cartas: reset de turno + passivas
  for (const m of np.board) {
    m.summoned = false
    m.hasAttacked = false
    m.roundsAlive++
    const ab = ABILITIES[m.cardId]
    if (ab && ab.onUpkeep) ab.onUpkeep(m, { rng: Math.random, me: np, opp: game.players[opponentId(game, next)], game })
    m.tookDamageThisRound = false
  }

  if (np.deck.length > 0) np.hand.push(np.deck.shift())

  // fadiga: sem deck, sem tabuleiro e sem mão = derrota
  if (np.deck.length === 0 && np.board.length === 0 && np.hand.length === 0) {
    game.status = 'ended'
    game.winner = userId
  }

  const triggerMinigame = (game.status === 'playing') && (game.round % 3 === 0) && (game.turnsThisRound === 0)
  return { ok: true, triggerMinigame }
}

// Dano do minigame escala com a rodada: 2 até a 6, 5 a partir da 7
function minigameDamage(round) {
  return round >= 7 ? 5 : 2
}

function applyMinigameDamage(roomId, loserId, amount = 1) {
  const game = games.get(roomId)
  if (!game || game.status !== 'playing') return
  game.players[loserId].hp -= amount
  checkWin(game)
}

function consumeMinigameTrigger(roomId) {
  const game = games.get(roomId)
  if (!game) return null
  if (game._minigameTrigger) {
    const ctx = typeof game._minigameTrigger === 'object' ? game._minigameTrigger : {}
    delete game._minigameTrigger
    return ctx
  }
  return null
}

function grantElixir(roomId, userId, amount) {
  const g = games.get(roomId)
  if (!g) return
  const p = g.players[userId]
  if (!p) return
  p.elixir = Math.min(p.maxElixir, p.elixir + amount)
}

function surrender(roomId, userId) {
  const game = games.get(roomId)
  if (!game || game.status !== 'playing') return { error: 'Partida não encontrada' }
  game.status = 'ended'
  game.winner = opponentId(game, userId)
  return { ok: true }
}

function publicMinion(game, ownerId, m, isMine) {
  const out = {
    uid: m.uid,
    cardId: m.cardId,
    atk: effAtk(game, ownerId, m),
    def: effDef(game, ownerId, m),
    hp: m.hp,
    maxHp: m.maxHp,
    summoned: m.summoned,
    hasAttacked: m.hasAttacked,
    counterImmune: isCounterImmune(game, m),
  }
  // Info do especial só pro dono
  if (isMine) {
    out.specialCost = specialCost(game, ownerId, m)
    out.specialTarget = SPECIAL_TARGETS[m.cardId] || null  // 'enemyCard' | 'allyCard' | null
    out.specialUsed = !!m.specialUsed
    out.specialImplemented = !!SPECIALS[m.cardId]
  }
  return out
}

function viewFor(roomId, userId) {
  const game = games.get(roomId)
  if (!game) return null
  const oppId = opponentId(game, userId)
  const me = game.players[userId]
  const opp = game.players[oppId]
  if (!me || !opp) return null

  return {
    roomId: game.roomId,
    round: game.round,
    boardCap: boardCap(game.round),
    turn: game.turn,
    isMyTurn: game.turn === userId,
    status: game.status,
    winner: game.winner,
    me: {
      id: me.id, username: me.username, hp: me.hp,
      elixir: me.elixir, maxElixir: me.maxElixir,
      hand: me.hand, deckCount: me.deck.length,
      board: me.board.map(m => publicMinion(game, userId, m, true)),
      graveyard: me.graveyard,
      tauntedBy: me.tauntOnPlay?.byUid || null,
      nextCardCostMult: me.nextCardCostMult?.value || 1,
      cardPlayBlocked: !!me.skipNextCardPlay,
      stats: me.stats,
    },
    opponent: {
      id: opp.id, username: opp.username, hp: opp.hp,
      elixir: opp.elixir, maxElixir: opp.maxElixir,
      handCount: opp.hand.length, deckCount: opp.deck.length,
      board: opp.board.map(m => publicMinion(game, oppId, m, false)),
      graveyard: opp.graveyard,
    },
  }
}

module.exports = { createGame, getGame, removeGame, playCard, endTurn, attack, activateSpecial, surrender, viewFor, applyMinigameDamage, consumeMinigameTrigger, grantElixir, minigameDamage }
