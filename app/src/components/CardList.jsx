import CardItem from './CardItem'

export default function CardList({ cards, onEdit, onDelete }) {
  if (cards.length === 0) {
    return <p className="empty">Nenhuma carta ainda. Crie a primeira!</p>
  }

  return (
    <div className="card-grid">
      {cards.map(card => (
        <CardItem key={card.id} card={card} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
