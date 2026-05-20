import { createContext, useCallback, useContext, useState } from 'react'

const ToastCtx = createContext(null)

let nextId = 1

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const push = useCallback((msg, opts = {}) => {
    const id = nextId++
    setToasts(t => [...t, { id, msg, kind: opts.kind || 'info' }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 4000)
  }, [])

  return (
    <ToastCtx.Provider value={{ toast: push }}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.kind}`}>{t.msg}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) return { toast: () => {} }
  return ctx
}
