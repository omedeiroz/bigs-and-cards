import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bigs-user')
    return saved ? JSON.parse(saved) : null
  })

  function login(userData, token) {
    localStorage.setItem('bigs-user', JSON.stringify(userData))
    localStorage.setItem('bigs-token', token)
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('bigs-user')
    localStorage.removeItem('bigs-token')
    setUser(null)
  }

  // Sessão deslizante: cada resposta autenticada traz um token renovado.
  // Se o token venceu de vez (401 com token salvo), desloga automaticamente.
  useEffect(() => {
    const origFetch = window.fetch
    window.fetch = async (...args) => {
      const res = await origFetch(...args)
      try {
        const fresh = res.headers.get('x-refresh-token')
        if (fresh) localStorage.setItem('bigs-token', fresh)
        else if (res.status === 401 && localStorage.getItem('bigs-token')) logout()
      } catch { /* respostas opacas não têm headers acessíveis */ }
      return res
    }
    return () => { window.fetch = origFetch }
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
