// Dados autoritativos das cartas no servidor (fonte da verdade do jogo).
// O frontend tem uma cópia em app/src/data/cards.js usada só para renderização.
// Mantém os stats sincronizados entre os dois.

const CARDS = [
  { id: 'gbzin',   name: 'Gbzin',   cost: 2, atk: 3, def: 2, hp: 4, rarity: 'comum',
    passive: 'Ganha +1 ATK a cada 2 rodadas vivo (máx +2)',
    counter: { target: 'bigs', desc: 'perde 1 ATK e 1 DEF ao ser colocado depois dele' },
    duo: [{ with: 'pepao', desc: '+1 ATK e +1 DEF' }],
    special: { name: 'Mãos de fogo', cost: 4, desc: 'Escolhe uma carta inimiga, perde 1 ATK até o fim da rodada. Se Gbzin já tem +1 ATK da passiva, vira -2 ATK.' } },

  { id: 'pepao',   name: 'Pepao',   cost: 3, atk: 4, def: 3, hp: 6, rarity: 'raro',
    passive: '30% de chance de ativar minigame por ataque — vence = +1 dano',
    counter: { target: 'davi', desc: 'minigame automático, dono do Davi escolhe. Pepao vencer = +1 vida' },
    duo: [{ with: 'gbzin', desc: '+2 ATK / -1 DEF' }],
    special: { name: 'Pepão big head', cost: 3, desc: 'Provoca minigame à sua escolha — se vencer, adversário pula a próxima jogada de cartas.' } },

  { id: 'hadez',   name: 'Hadez',   cost: 3, atk: 3, def: 3, hp: 5, rarity: 'raro',
    passive: 'Mercado — 25% de chance no início de cada rodada de ganhar +1 ATK ou +1 DEF',
    counter: { target: 'pepao', desc: 'perde 1 DEF. Se Pepao tem Gbzin no duo, perde 1 DEF + 1 ATK' },
    duo: [{ with: 'rena', desc: '+1 DEF, mercado sobe pra 40%' }],
    special: { name: 'Camisa 10 mantiqueiras', cost: 4, desc: 'Se ATK do time supera DEF inimiga em 2+, +1 dano. Em 4+, +2 dano.' } },

  { id: 'davi',    name: 'Davi',    cost: 3, atk: 2, def: 4, hp: 7, rarity: 'épico',
    passive: 'Ao sofrer dano, 30% de chance de refletir 1 de dano pro atacante',
    counter: { target: 'pepao', desc: 'minigame auto, Davi escolhe. Pepao vencer = +1 vida' },
    duo: [{ with: 'bigs', desc: '+1 ATK, especial vale 2 de dano' }, { with: 'ian', desc: 'roubo do Ian sobe pra 50%, Davi fica imune' }],
    special: { name: 'Chama pra briga', cost: 3, desc: 'Provoca um jogador específico, forçando a próxima carta dele a enfrentar o Davi.' } },

  { id: 'bigs',    name: 'Bigs',    cost: 4, atk: 4, def: 4, hp: 8, rarity: 'épico',
    passive: 'Com 2+ cartas inimigas no tabuleiro, ganha +1 ATK',
    counter: { target: 'gbzin', desc: 'Gbzin perde 1 ATK, Bigs ganha +1 DEF ao enfrentá-lo' },
    duo: [{ with: 'davi', desc: '+1 DEF, regenera 1 vida por rodada' }, { with: 'eric', desc: '+2 ATK, -2 DEF' }],
    special: { name: 'Modo big', cost: 4, desc: 'Dobra o custo da próxima carta do adversário nessa rodada.' } },

  { id: 'ian',     name: 'Ian',     cost: 2, atk: 3, def: 2, hp: 3, rarity: 'comum',
    passive: 'A cada rodada, 25% de chance de roubar 1 de elixir do adversário',
    counter: { target: 'hadez', desc: 'cancela o mercado, Hadez perde 1 ATK enquanto Ian tá no tabuleiro' },
    duo: [{ with: 'davi', desc: 'roubo sobe pra 50%, Davi imune' }],
    special: { name: 'Calote', cost: 3, desc: 'Rouba 2 de elixir do adversário.' } },

  { id: 'eric',    name: 'Eric',    cost: 3, atk: 3, def: 3, hp: 5, rarity: 'raro',
    passive: 'Contra carta com ATK maior, ganha +1 ATK nessa batalha',
    counter: { target: 'pirula', desc: 'mútuo — antes: Pirula nasce -1 ATK; depois: Eric perde 1 DEF' },
    duo: [{ with: 'bigs', desc: '+1 ATK / +1 DEF' }],
    special: { name: 'Vira o jogo', cost: 4, desc: 'Troca ATK e DEF de uma carta inimiga por 1 rodada.' } },

  { id: 'pirula',  name: 'Pirula',  cost: 2, atk: 4, def: 1, hp: 3, rarity: 'épico',
    passive: 'Matou uma carta inimiga? +1 ATK acumulável',
    counter: { target: 'eric', desc: 'mútuo — antes: Eric -1 DEF; depois: Pirula -1 ATK' },
    duo: [{ with: 'gustavo', desc: '+1 DEF, All in custa 4 ao invés de 5' }],
    special: { name: 'All in', cost: 5, oncePerMatch: true, desc: 'Uma vez por partida. Aplica todo o ATK atual direto no jogador, ignorando defesa.' } },

  { id: 'gustavo', name: 'Gustavo', cost: 3, atk: 2, def: 3, hp: 6, rarity: 'raro',
    passive: 'Cada rodada sem sofrer dano = +1 DEF',
    counter: { target: 'ian', desc: 'imune ao roubo, cancela a passiva do Ian' },
    duo: [{ with: 'pirula', desc: '+1 ATK, passiva acumula 2x mais rápido' }, { with: 'hadez', desc: 'mercado sobe pra 40%' }],
    special: { name: 'Blindagem', cost: 3, desc: 'Por 1 rodada, uma carta aliada fica imune a counters.' } },

  { id: 'rena',    name: 'Rena',    cost: 2, atk: 2, def: 3, hp: 5, rarity: 'comum',
    passive: 'No início de cada rodada, uma carta aliada aleatória recupera 1 de vida',
    counter: { target: 'gbzin', desc: 'enquanto Rena tá no tabuleiro, passiva de ATK do Gbzin pausa' },
    duo: [{ with: 'hadez', desc: 'mercado 40%, cura vai pra carta com menos vida' }],
    special: { name: 'Estouro de elixir', cost: 3, desc: 'Todas as cartas aliadas recuperam 1 vida e ganham +1 DEF por 1 rodada.' } },
]

const CARD_BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]))

module.exports = { CARDS, CARD_BY_ID }
