/* eslint-disable */
// ============================================================
// BIGS & CARDS — Mock data (cartas, usuários, partidas)
// Loaded as a plain script -> attaches to window for all components.
// ============================================================

const CARDS = [
  {
    id: 'gbzin', name: 'Gbzin', code: 'GBZ', tagline: 'Mãos de fogo',
    cost: 2, atk: 3, def: 2, hp: 4,
    rarity: 'comum',
    accent: '#FF7B3D',
    bio: 'Vai pra cima sem pensar. Cresce com o tempo.',
    passive: 'Ganha +1 ATK a cada 2 rodadas vivo (máx +2)',
    counter: { name: 'Bigs', desc: 'perde 1 ATK e 1 DEF ao ser colocado depois dele' },
    duo: [{ name: 'Pepao', desc: '+1 ATK e +1 DEF' }],
    special: { name: 'Mãos de fogo', cost: 4, desc: 'Escolhe uma carta inimiga, perde 1 ATK até o fim da rodada. Se Gbzin já tem +1 ATK da passiva, vira -2 ATK.' },
  },
  {
    id: 'pepao', name: 'Pepao', code: 'PEP', tagline: 'Big head',
    cost: 3, atk: 4, def: 3, hp: 6,
    rarity: 'raro',
    accent: '#5DD3B6',
    bio: 'O caos com queda pra minigame. Sorte boa.',
    passive: '30% de chance de ativar minigame por ataque — vence = +1 dano',
    counter: { name: 'Davi', desc: 'minigame automático, dono do Davi escolhe. Pepao vencer = +1 vida' },
    duo: [{ name: 'Gbzin', desc: '+2 ATK / -1 DEF' }],
    special: { name: 'Pepão big head', cost: 3, desc: 'Provoca minigame à sua escolha — se vencer, adversário pula a próxima jogada de cartas.' },
  },
  {
    id: 'hadez', name: 'Hadez', code: 'HDZ', tagline: 'Mantiqueiras',
    cost: 3, atk: 3, def: 3, hp: 5,
    rarity: 'raro',
    accent: '#B17BFF',
    bio: 'O do mercado. Sorte aleatória, dano controlado.',
    passive: 'Mercado — 25% de chance no início de cada rodada de ganhar +1 ATK ou +1 DEF',
    counter: { name: 'Pepao', desc: 'perde 1 DEF. Se Pepao tem Gbzin no duo, perde 1 DEF + 1 ATK' },
    duo: [{ name: 'Rena', desc: '+1 DEF, mercado sobe pra 40%' }],
    special: { name: 'Camisa 10 mantiqueiras', cost: 4, desc: 'Se ATK do time supera DEF inimiga em 2+, +1 dano. Em 4+, +2 dano.' },
  },
  {
    id: 'davi', name: 'Davi', code: 'DAV', tagline: 'Chama pra briga',
    cost: 3, atk: 2, def: 4, hp: 7,
    rarity: 'épico',
    accent: '#6BA6FF',
    bio: 'Tanque. Devolve o que toma.',
    passive: 'Ao sofrer dano, 30% de chance de refletir 1 de dano pro atacante',
    counter: { name: 'Pepao', desc: 'minigame auto, Davi escolhe. Pepao vencer = +1 vida' },
    duo: [
      { name: 'Bigs', desc: '+1 ATK, especial vale 2 de dano' },
      { name: 'Ian', desc: 'roubo do Ian sobe pra 50%, Davi fica imune' },
    ],
    special: { name: 'Chama pra briga', cost: 3, desc: 'Provoca um jogador específico, forçando a próxima carta dele a enfrentar o Davi.' },
  },
  {
    id: 'bigs', name: 'Bigs', code: 'BGS', tagline: 'Modo big',
    cost: 4, atk: 4, def: 4, hp: 8,
    rarity: 'épico',
    accent: '#FFC93C',
    bio: 'O nome do jogo. Tanque-atacante.',
    passive: 'Com 2+ cartas inimigas no tabuleiro, ganha +1 ATK',
    counter: { name: 'Gbzin', desc: 'Gbzin perde 1 ATK, Bigs ganha +1 DEF ao enfrentá-lo' },
    duo: [
      { name: 'Davi', desc: '+1 DEF, regenera 1 vida por rodada' },
      { name: 'Eric', desc: '+2 ATK, -2 DEF' },
    ],
    special: { name: 'Modo big', cost: 4, desc: 'Dobra o custo da próxima carta do adversário nessa rodada.' },
  },
  {
    id: 'ian', name: 'Ian', code: 'IAN', tagline: 'Calote',
    cost: 2, atk: 3, def: 2, hp: 3,
    rarity: 'comum',
    accent: '#54E0B0',
    bio: 'Trapaça. Vive do elixir alheio.',
    passive: 'A cada rodada, 25% de chance de roubar 1 de elixir do adversário',
    counter: { name: 'Hadez', desc: 'cancela o mercado, Hadez perde 1 ATK enquanto Ian tá no tabuleiro' },
    duo: [{ name: 'Davi', desc: 'roubo sobe pra 50%, Davi imune' }],
    special: { name: 'Calote', cost: 3, desc: 'Rouba 2 de elixir do adversário.' },
  },
  {
    id: 'eric', name: 'Eric', code: 'ERC', tagline: 'Vira o jogo',
    cost: 3, atk: 3, def: 3, hp: 5,
    rarity: 'raro',
    accent: '#FF3D5A',
    bio: 'Cresce contra os fortes. Inverte tudo.',
    passive: 'Contra carta com ATK maior, ganha +1 ATK nessa batalha',
    counter: { name: 'Pirula', desc: 'mútuo — antes: Pirula nasce -1 ATK; depois: Eric perde 1 DEF' },
    duo: [{ name: 'Bigs', desc: '+1 ATK / +1 DEF' }],
    special: { name: 'Vira o jogo', cost: 4, desc: 'Troca ATK e DEF de uma carta inimiga por 1 rodada.' },
  },
  {
    id: 'pirula', name: 'Pirula', code: 'PRL', tagline: 'All in',
    cost: 2, atk: 4, def: 1, hp: 3,
    rarity: 'épico',
    accent: '#FF3D5A',
    bio: 'Glass cannon. Mata, cresce, explode.',
    passive: 'Matou uma carta inimiga? +1 ATK acumulável',
    counter: { name: 'Eric', desc: 'mútuo — antes: Eric -1 DEF; depois: Pirula -1 ATK' },
    duo: [{ name: 'Gustavo', desc: '+1 DEF, All in custa 4 ao invés de 5' }],
    special: { name: 'All in', cost: 5, desc: 'Uma vez por partida. Aplica todo o ATK atual direto no jogador, ignorando defesa.' },
  },
  {
    id: 'gustavo', name: 'Gustavo', code: 'GUS', tagline: 'Blindagem',
    cost: 3, atk: 2, def: 3, hp: 6,
    rarity: 'raro',
    accent: '#5DD3B6',
    bio: 'Defesa pura. Sem dano = mais defesa.',
    passive: 'Cada rodada sem sofrer dano = +1 DEF',
    counter: { name: 'Ian', desc: 'imune ao roubo, cancela a passiva do Ian' },
    duo: [
      { name: 'Pirula', desc: '+1 ATK, passiva acumula 2x mais rápido' },
      { name: 'Hadez', desc: 'mercado sobe pra 40%' },
    ],
    special: { name: 'Blindagem', cost: 3, desc: 'Por 1 rodada, uma carta aliada fica imune a counters.' },
  },
  {
    id: 'rena', name: 'Rena', code: 'REN', tagline: 'Estouro de elixir',
    cost: 2, atk: 2, def: 3, hp: 5,
    rarity: 'comum',
    accent: '#54E0B0',
    bio: 'Suporte. Cura silenciosa.',
    passive: 'No início de cada rodada, uma carta aliada aleatória recupera 1 de vida',
    counter: { name: 'Gbzin', desc: 'enquanto Rena tá no tabuleiro, passiva de ATK do Gbzin pausa' },
    duo: [{ name: 'Hadez', desc: 'mercado 40%, cura vai pra carta com menos vida' }],
    special: { name: 'Estouro de elixir', cost: 3, desc: 'Todas as cartas aliadas recuperam 1 vida e ganham +1 DEF por 1 rodada.' },
  },
];

const FRIENDS = [
  { id: 'u1', username: 'gbzin01',   tag: '@gbzin01',   status: 'online',  level: 18, wins: 42, losses: 17, mainCard: 'gbzin',   lastSeen: 'agora' },
  { id: 'u2', username: 'pepao_br',  tag: '@pepao_br',  status: 'jogando', level: 24, wins: 78, losses: 31, mainCard: 'pepao',   lastSeen: 'em partida' },
  { id: 'u3', username: 'hadez.eth', tag: '@hadez.eth', status: 'online',  level: 11, wins: 19, losses: 22, mainCard: 'hadez',   lastSeen: 'agora' },
  { id: 'u4', username: 'davizera',  tag: '@davizera',  status: 'offline', level: 30, wins: 112, losses: 40, mainCard: 'davi',   lastSeen: 'há 2h' },
  { id: 'u5', username: 'bigsfr',    tag: '@bigsfr',    status: 'online',  level: 27, wins: 89, losses: 33, mainCard: 'bigs',    lastSeen: 'agora' },
  { id: 'u6', username: 'ianfuria',  tag: '@ianfuria',  status: 'offline', level: 7,  wins: 11, losses: 14, mainCard: 'ian',     lastSeen: 'ontem' },
  { id: 'u7', username: 'ericplay',  tag: '@ericplay',  status: 'online',  level: 15, wins: 33, losses: 19, mainCard: 'eric',    lastSeen: 'agora' },
  { id: 'u8', username: 'pirulao',   tag: '@pirulao',   status: 'jogando', level: 21, wins: 56, losses: 28, mainCard: 'pirula',  lastSeen: 'em partida' },
];

const CHALLENGES = {
  recebidos: [
    { id: 'c1', from: 'pepao_br',  when: 'há 2min',  message: 'bora ver quem manda, pao' },
    { id: 'c2', from: 'bigsfr',    when: 'há 12min', message: 'revanche?' },
    { id: 'c3', from: 'ericplay',  when: 'há 1h',    message: '—' },
  ],
  enviados: [
    { id: 'c4', to: 'gbzin01',     when: 'há 5min',  message: 'kkkk vem' },
    { id: 'c5', to: 'hadez.eth',   when: 'há 30min', message: '—' },
  ],
};

const MATCHES = [
  { id: 'm1', opponent: 'pepao_br',  result: 'win',  score: '20–8',  rounds: 7,  duration: '4:32', date: 'hoje, 14:22', mvp: 'bigs' },
  { id: 'm2', opponent: 'hadez.eth', result: 'loss', score: '12–20', rounds: 9,  duration: '6:11', date: 'hoje, 13:08', mvp: 'hadez' },
  { id: 'm3', opponent: 'davizera',  result: 'win',  score: '20–14', rounds: 8,  duration: '5:47', date: 'ontem, 22:01', mvp: 'davi' },
  { id: 'm4', opponent: 'bigsfr',    result: 'win',  score: '20–3',  rounds: 5,  duration: '3:18', date: 'ontem, 19:30', mvp: 'pirula' },
  { id: 'm5', opponent: 'ianfuria',  result: 'loss', score: '7–20',  rounds: 6,  duration: '4:55', date: '2 dias atrás', mvp: 'ian' },
  { id: 'm6', opponent: 'pirulao',   result: 'win',  score: '20–17', rounds: 11, duration: '8:02', date: '3 dias atrás', mvp: 'eric' },
];

const ME = {
  username: 'voce',
  tag: '@voce',
  level: 19,
  wins: 47,
  losses: 22,
  winRate: 68,
  rank: 'OURO III',
  rankPoints: 1247,
  mainCard: 'bigs',
};

window.BIGS_DATA = { CARDS, FRIENDS, CHALLENGES, MATCHES, ME };
window.cardById = (id) => CARDS.find(c => c.id === id);
