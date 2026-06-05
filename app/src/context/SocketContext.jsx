import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const [socket, setSocket] = useState(null)
  const [onlineIds, setOnlineIds] = useState([])
  const [match, setMatch] = useState(null)      // { roomId, type, opponent }
  const [inQueue, setInQueue] = useState(false)
  const [queueType, setQueueType] = useState('casual')
  const [rankUpdate, setRankUpdate] = useState(null)  // { delta, newPts, isWin, rank }
  const [rankedJustUnlocked, setRankedJustUnlocked] = useState(false)

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
      }
      return
    }

    const token = localStorage.getItem('bigs-token')
    const s = io(SOCKET_URL, { auth: { token } })
    socketRef.current = s
    setSocket(s)

    s.on('presence:update', setOnlineIds)
    s.on('match:found', (data) => {
      setInQueue(false)
      setMatch(data)
      navigate('/lobby')
    })
    s.on('rank:update', (data) => setRankUpdate(data))
    s.on('ranked:unlocked', () => setRankedJustUnlocked(true))

    return () => {
      s.disconnect()
      socketRef.current = null
      setSocket(null)
    }
  }, [user])

  const joinQueue = useCallback((type = 'casual') => {
    socketRef.current?.emit('queue:join', { type })
    setQueueType(type)
    setInQueue(true)
  }, [])

  function leaveQueue() {
    socketRef.current?.emit('queue:leave')
    setInQueue(false)
  }

  function clearMatch() {
    if (match) socketRef.current?.emit('lobby:leave', match.roomId)
    setMatch(null)
  }

  function clearRankUpdate() { setRankUpdate(null) }
  function clearRankedUnlocked() { setRankedJustUnlocked(false) }

  return (
    <SocketContext.Provider value={{
      socket, onlineIds, match, inQueue, queueType,
      rankUpdate, rankedJustUnlocked,
      joinQueue, leaveQueue, clearMatch, clearRankUpdate, clearRankedUnlocked,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  return useContext(SocketContext)
}
