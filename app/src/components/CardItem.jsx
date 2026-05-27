export default function CardItem({ card, onEdit, onDelete }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-name">{card.name || 'Sem nome'}</span>
        <span className="card-cost" title="Custo de elixir">{card.cost} 💧</span>
      </div>

      <div className="card-stats">
        <Stat label="⚔️ ATK" value={card.attack} />
        <Stat label="🛡️ DEF" value={card.defense} />
        <Stat label="❤️ Vida" value={card.life} />
      </div>

      {card.passive && <Field label="Passiva" value={card.passive} />}
      {card.counter && <Field label="Counter" value={card.counter} />}
      {card.duo && <Field label="Duo" value={card.duo} />}
      {card.special && <Field label="Especial" value={card.special} />}

      <div className="card-actions">
        <button className="btn-edit" onClick={() => onEdit(card)}>Editar</button>
        <button className="btn-delete" onClick={() => onDelete(card.id)}>Deletar</button>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="field">
      <span className="field-label">{label}:</span>
      <span className="field-value">{value}</span>
    </div>
  )
}
