import { createContext, useContext, useState } from 'react'

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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
