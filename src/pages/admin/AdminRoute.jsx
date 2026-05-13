// src/pages/admin/AdminRoute.jsx
// Protège les routes admin — redirige vers login si non connecté
import { useAuth } from '../../context/AuthContext'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'

export default function AdminRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        gap: 12, fontSize: 14, color: 'var(--muted)'
      }}>
        <span style={{
          width: 22, height: 22,
          border: '2px solid var(--green-3)',
          borderTopColor: 'var(--green)',
          borderRadius: '50%',
          animation: 'spin .7s linear infinite',
          display: 'inline-block'
        }}/>
        Vérification de la session…
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return session ? <AdminDashboard /> : <AdminLogin />
}
