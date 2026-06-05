// Hooks de passiva por carta. game.js chama esses no momento certo.
// Hooks disponíveis:
//   onUpkeep(m, ctx)      -> início do turno do dono (ctx: { rng, me, opp, game })
//   continuous(m, ctx)    -> modificador contínuo de stat (ctx: { me, opp, game }) -> { atk?, def? } | null
//   combat(m, enemy, ctx) -> bônus durante uma luta (ctx: { myEffAtk, enemyEffAtk }) -> { atk?, def? } | null
//   onDamaged(m, source, ctx) -> ao sofrer dano (ctx: { rng })
//   onKill(m, ctx)        -> ao matar uma carta inimiga

const has = (p, id) => p.board.some(x => x.cardId === id)

module.exports = {
  gbzin: {
    // +1 ATK a cada 2 rodadas vivo (máx +2). Pausa se Rena inimiga no tabuleiro.
    onUpkeep(m, { opp }) {
      if (has(opp, 'rena')) return
      if (m.roundsAlive > 0 && m.roundsAlive % 2 === 0 && m.permAtk < 2) m.permAtk += 1
    },
  },

  hadez: {
    // Mercado: 25% no início da rodada de +1 ATK ou +1 DEF.
    // Ian inimigo cancela o mercado. Duo com Rena ou Gustavo sobe a chance pra 40%.
    onUpkeep(m, { rng, me, opp }) {
      if (has(opp, 'ian')) return
      const chance = (has(me, 'rena') || has(me, 'gustavo')) ? 0.40 : 0.25
      if (rng() < chance) {
        if (rng() < 0.5) m.permAtk += 1
        else m.permDef += 1
      }
    },
  },

  davi: {
    // Ao sofrer dano, 30% de refletir 1 de dano pro atacante
    onDamaged(m, source, { rng }) {
      if (source && rng() < 0.30) source.hp -= 1
    },
  },

  bigs: {
    // Com 2+ cartas inimigas no tabuleiro, +1 ATK
    continuous(m, { opp }) {
      return opp.board.length >= 2 ? { atk: 1 } : null
    },
    // Duo com Davi: regenera 1 HP por rodada
    onUpkeep(m, { me }) {
      if (has(me, 'davi') && m.hp < m.maxHp) m.hp = Math.min(m.maxHp, m.hp + 1)
    },
  },

  ian: {
    // 25% por rodada de roubar 1 elixir. Gustavo inimigo cancela. Duo com Davi sobe pra 50%.
    onUpkeep(m, { rng, me, opp }) {
      if (has(opp, 'gustavo')) return
      const chance = has(me, 'davi') ? 0.50 : 0.25
      if (rng() < chance && opp.elixir > 0) {
        opp.elixir -= 1
        me.elixir = Math.min(me.maxElixir, me.elixir + 1)
      }
    },
  },

  eric: {
    // Contra carta com ATK maior, +1 ATK nessa batalha
    combat(m, enemy, { myEffAtk, enemyEffAtk }) {
      return enemyEffAtk > myEffAtk ? { atk: 1 } : null
    },
  },

  pirula: {
    // Matou uma carta inimiga? +1 ATK acumulável
    onKill(m) {
      m.permAtk += 1
    },
  },

  gustavo: {
    // Cada rodada sem sofrer dano = +1 DEF. Duo com Pirula: acumula 2x mais rápido.
    onUpkeep(m, { me }) {
      if (!m.tookDamageThisRound) {
        const inc = has(me, 'pirula') ? 2 : 1
        m.permDef += inc
      }
    },
  },

  rena: {
    // Início da rodada cura 1 de um aliado aleatório.
    // Duo com Hadez: cura vai pra carta com menos vida.
    onUpkeep(m, { rng, me }) {
      const hurt = me.board.filter(x => x.hp < x.maxHp)
      if (!hurt.length) return
      let target
      if (has(me, 'hadez')) {
        target = hurt.reduce((min, c) => c.hp < min.hp ? c : min)
      } else {
        target = hurt[Math.floor(rng() * hurt.length)]
      }
      target.hp = Math.min(target.maxHp, target.hp + 1)
    },
  },

  // pepao: minigame (Phase 4)
}
