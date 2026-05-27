import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/home.css'

export default function Home() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-logo">Bigs <span>&</span> Cards</h1>
        <div className="home-user">
          <span>{user.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      <main className="home-main">
        <section className="home-hero">
          <h2>Bem-vindo, <strong>{user.username}</strong></h2>
          <p>Desafie seus amigos e veja quem é o melhor no tabuleiro.</p>
          <button className="btn-play" disabled>
            Jogar agora
            <span className="btn-play-soon">em breve</span>
          </button>
        </section>

        <section className="home-grid">
          <div className="home-card">
            <div className="home-card-icon">⚔️</div>
            <h3>Partidas</h3>
            <p className="home-card-value">0</p>
            <p className="home-card-label">jogadas</p>
          </div>
          <div className="home-card">
            <div className="home-card-icon">🏆</div>
            <h3>Vitórias</h3>
            <p className="home-card-value">0</p>
            <p className="home-card-label">conquistadas</p>
          </div>
          <div className="home-card">
            <div className="home-card-icon">💀</div>
            <h3>Derrotas</h3>
            <p className="home-card-value">0</p>
            <p className="home-card-label">sofridas</p>
          </div>
          <div className="home-card">
            <div className="home-card-icon">🃏</div>
            <h3>Cartas</h3>
            <p className="home-card-value">10</p>
            <p className="home-card-label">no set</p>
          </div>
        </section>

        <section className="home-actions">
          <div className="action-card disabled">
            <h3>👥 Amigos</h3>
            <p>Adicione amigos e envie desafios</p>
            <span className="tag-soon">em breve</span>
          </div>
          <div className="action-card disabled">
            <h3>🔔 Desafios</h3>
            <p>Nenhum desafio pendente</p>
            <span className="tag-soon">em breve</span>
          </div>
          <div className="action-card" onClick={() => navigate('/cards')}>
            <h3>📋 Cartas</h3>
            <p>Veja e gerencie todas as cartas do jogo</p>
            <span className="tag-active">ver cartas →</span>
          </div>
        </section>
      </main>
    </div>
  )
}
