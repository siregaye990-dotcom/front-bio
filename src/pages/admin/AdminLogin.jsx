// src/pages/admin/AdminLogin.jsx
import { useState } from 'react'
import { FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import styles from './AdminLogin.module.css'

export default function AdminLogin() {
  const { signIn } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      // AuthContext will update session → AdminLayout will redirect
    } catch (err) {
      setError('Identifiants incorrects. Vérifiez votre email et mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <div className={styles.logoCircle}>
            <FiLock size={22} color="var(--gold)"/>
          </div>
        </div>

        <h1 className={styles.title}>Bio <em>Sén</em> Admin</h1>
        <p className={styles.sub}>Espace réservé à l'administrateur</p>

        {error && (
          <div className={styles.error}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fg}>
            <label htmlFor="email">
              <FiUser size={12}/> Adresse email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@biosen.sn"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.fg}>
            <label htmlFor="password">
              <FiLock size={12}/> Mot de passe
            </label>
            <div className={styles.pwdWrap}>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(v => !v)}
                tabIndex={-1}
              >
                {showPwd ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className={styles.hint}>
          <p>🔑 Créez votre compte admin dans Supabase :</p>
          <p><strong>Authentication → Users → Invite User</strong></p>
          <p>puis entrez votre email admin.</p>
        </div>
      </div>
    </div>
  )
}
