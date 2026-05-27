import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CardList from '../components/CardList'
import CardForm from '../components/CardForm'
import '../App.css'

const INITIAL_CARDS = [
  { id: 1, name: 'Gbzin', cost: 2, attack: 3, defense: 2, life: 4, passive: 'Ganha +1 ATK a cada 2 rodadas vivo (máx +2)', counter: 'Bigs — perde 1 ATK e 1 DEF ao ser colocado após o Bigs', duo: 'Pepao — ganha +1 ATK e +1 DEF', special: 'Mãos de fogo (4 elixir, rodada 2+): escolhe uma carta inimiga, ela perde 1 ATK até o fim da rodada. Se o Gbzin já tiver +1 ATK acumulado pela passiva, o efeito vira -2 ATK' },
  { id: 2, name: 'Pepao', cost: 3, attack: 4, defense: 3, life: 6, passive: '30% de chance de ativar um minigame a cada ataque — se vencer, aplica +1 de dano bônus', counter: 'Davi — minigame automático, dono do Davi escolhe o tipo. Se o Pepao vencer, recupera 1 de vida', duo: 'Gbzin — ganha +2 ATK e perde 1 DEF', special: 'Pepão big head (3 elixir): provoca um minigame à escolha — se vencer, o adversário pula a próxima jogada de cartas' },
  { id: 3, name: 'Hadez', cost: 3, attack: 3, defense: 3, life: 5, passive: 'Mercado: 25% de chance no início de cada rodada de ganhar +1 ATK ou +1 DEF (aleatório)', counter: 'Pepao — perde 1 DEF. Se o Pepao tiver Gbzin como duo ativo, perde 1 DEF e 1 ATK', duo: 'Rena — ganha +1 DEF e a chance do mercado sobe pra 40%', special: 'Camisa 10 mantiqueiras (4 elixir): se ATK do time superar DEF adversária em 2+, aplica +1 de dano. Se superar em 4+, aplica +2' },
  { id: 4, name: 'Davi', cost: 3, attack: 2, defense: 4, life: 7, passive: 'Quando sofre dano, 30% de chance de refletir 1 de dano pro atacante', counter: 'Pepao — minigame automático, dono do Davi escolhe o tipo. Se Pepao vencer, recupera 1 de vida', duo: 'Bigs — ganha +1 ATK e minigame especial passa a valer 2 de dano | Ian — chance de roubo do Ian sobe pra 50%, Davi fica imune a roubo de elixir', special: 'Chama pra briga (3 elixir): provoca um jogador específico, forçando a próxima carta dele a enfrentar o Davi' },
  { id: 5, name: 'Bigs', cost: 4, attack: 4, defense: 4, life: 8, passive: 'Se tiver 2+ cartas inimigas no tabuleiro, ganha +1 ATK', counter: 'Gbzin — Gbzin perde 1 ATK e Bigs ganha +1 DEF ao enfrentá-lo', duo: 'Davi — ganha +1 DEF e regenera 1 de vida por rodada | Eric — ganha +2 ATK mas perde 2 DEF', special: 'Modo big (4 elixir): dobra o custo da próxima carta do adversário nessa rodada' },
  { id: 6, name: 'Ian', cost: 2, attack: 3, defense: 2, life: 3, passive: 'A cada rodada, 25% de chance de roubar 1 de elixir do adversário', counter: 'Hadez — cancela a passiva do mercado do Hadez e ele perde 1 ATK enquanto Ian estiver no tabuleiro', duo: 'Davi — chance de roubo sobe de 25% pra 50%, Davi fica imune a roubo de elixir', special: 'Calote (3 elixir): rouba 2 de elixir do adversário' },
  { id: 7, name: 'Eric', cost: 3, attack: 3, defense: 3, life: 5, passive: 'Quando enfrenta uma carta com ATK maior que o dele, ganha +1 ATK nessa batalha', counter: 'Pirula (mútuo) — se colocado antes do Pirula, Pirula nasce com -1 ATK. Se depois, Eric perde 1 DEF', duo: 'Bigs — ganha +1 ATK e +1 DEF', special: 'Vira o jogo (4 elixir): troca os valores de ATK e DEF de uma carta inimiga por 1 rodada' },
  { id: 8, name: 'Pirula', cost: 2, attack: 4, defense: 1, life: 3, passive: 'Se matar uma carta inimiga, ganha +1 ATK (acumulável)', counter: 'Eric (mútuo) — se colocado antes do Eric, Eric perde 1 DEF. Se depois, Pirula perde 1 ATK', duo: 'Gustavo — ganha +1 DEF e o All in passa a custar 4 elixir ao invés de 5', special: 'All in (5 elixir, 1x por partida): aplica todo o ATK atual diretamente no jogador, ignorando cartas de defesa' },
  { id: 9, name: 'Gustavo', cost: 3, attack: 2, defense: 3, life: 6, passive: 'Ganha +1 DEF a cada rodada que não sofrer dano', counter: 'Ian — imune ao roubo de elixir do Ian e cancela a passiva dele', duo: 'Pirula — ganha +1 ATK e a passiva de DEF acumula 2x mais rápido | Hadez — chance do mercado do Hadez sobe pra 40%', special: 'Blindagem (3 elixir): por 1 rodada, uma carta aliada fica imune a counters' },
  { id: 10, name: 'Rena', cost: 2, attack: 2, defense: 3, life: 5, passive: 'No início de cada rodada, uma carta aliada aleatória recupera 1 de vida', counter: 'Gbzin — enquanto Rena estiver no tabuleiro, a passiva de ATK acumulado do Gbzin fica pausada', duo: 'Hadez — Hadez ganha +1 DEF e chance do mercado sobe pra 40%, e a cura da Rena passa a ser direcionada à carta aliada com menos vida', special: 'Estouro de elixir (3 elixir): todas as cartas aliadas no tabuleiro recuperam 1 de vida e ganham +1 DEF por 1 rodada' },
]

export default function Cards() {
  const navigate = useNavigate()
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem('bigs-cards-v2')
    return saved ? JSON.parse(saved) : INITIAL_CARDS
  })
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    localStorage.setItem('bigs-cards-v2', JSON.stringify(cards))
  }, [cards])

  function saveCard(card) {
    if (card.id) {
      setCards(prev => prev.map(c => c.id === card.id ? card : c))
    } else {
      setCards(prev => [...prev, { ...card, id: Date.now() }])
    }
    setShowForm(false)
    setEditing(null)
  }

  function deleteCard(id) {
    if (window.confirm('Deletar essa carta?')) {
      setCards(prev => prev.filter(c => c.id !== id))
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn-back" onClick={() => navigate('/')}>← Voltar</button>
          <h1>Cartas</h1>
        </div>
        <button className="btn-primary" onClick={() => { setEditing(null); setShowForm(true) }}>+ Nova carta</button>
      </header>

      <CardList cards={cards} onEdit={c => { setEditing(c); setShowForm(true) }} onDelete={deleteCard} />

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <CardForm card={editing} onSave={saveCard} onCancel={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
