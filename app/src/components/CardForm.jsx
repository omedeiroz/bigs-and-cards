import { useState } from 'react'

const EMPTY = {
  name: '',
  cost: 0,
  attack: 0,
  defense: 0,
  life: 0,
  passive: '',
  counter: '',
  duo: '',
  special: '',
}

export default function CardForm({ card, onSave, onCancel }) {
  const [form, setForm] = useState(card ?? EMPTY)

  function handle(e) {
    const { name, value, type } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }))
  }

  function submit(e) {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form className="card-form" onSubmit={submit}>
      <h2>{card ? 'Editar carta' : 'Nova carta'}</h2>

      <div className="form-row">
        <Field label="Nome" name="name" value={form.name} onChange={handle} required />
        <Field label="Custo (elixir)" name="cost" type="number" value={form.cost} onChange={handle} min={0} />
      </div>

      <div className="form-row">
        <Field label="Ataque" name="attack" type="number" value={form.attack} onChange={handle} min={0} />
        <Field label="Defesa" name="defense" type="number" value={form.defense} onChange={handle} min={0} />
        <Field label="Vida" name="life" type="number" value={form.life} onChange={handle} min={0} />
      </div>

      <Textarea label="Passiva" name="passive" value={form.passive} onChange={handle} />
      <Textarea label="Counter" name="counter" value={form.counter} onChange={handle} />
      <Textarea label="Duo" name="duo" value={form.duo} onChange={handle} />
      <Textarea label="Poder especial" name="special" value={form.special} onChange={handle} />

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary">Salvar</button>
      </div>
    </form>
  )
}

function Field({ label, name, value, onChange, type = 'text', required, min }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input name={name} type={type} value={value} onChange={onChange} required={required} min={min} />
    </label>
  )
}

function Textarea({ label, name, value, onChange }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea name={name} value={value} onChange={onChange} rows={2} />
    </label>
  )
}
