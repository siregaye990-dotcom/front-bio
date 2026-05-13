// src/components/ClientAuthModal.jsx
import { useState } from 'react'
import { FiX, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi'
import { useClientAuth } from '../context/ClientAuthContext'
import styles from './ClientAuthModal.module.css'

export default function ClientAuthModal({ isOpen, onClose }) {
  const { signUp, signIn, error, setError } = useClientAuth()
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!isOpen) return null

  const handleClose = () => {
    setMode('login')
    setEmail('')
    setPassword('')
    setConfirmPwd('')
    setMessage('')
    setError(null)
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        setMessage('✅ Connexion réussie!')
        setTimeout(handleClose, 1000)
      } else {
        if (password !== confirmPwd) {
          throw new Error('Les mots de passe ne correspondent pas')
        }
        if (password.length < 6) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères')
        }
        await signUp(email, password)
        setMessage('✅ Inscription réussie! Vérifiez votre email.')
        setMode('login')
        setPassword('')
        setConfirmPwd('')
      }
    } catch (err) {
      // Error is handled by context
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <h2>{mode === 'login' ? 'Connexion' : 'Inscription'}</h2>
          <button className={styles.closeBtn} onClick={handleClose}>
            <FiX size={24} />
          </button>
        </div>

        {/* Messages */}
        {message && <div className={styles.success}>{message}</div>}
        {error && <div className={styles.error}>❌ {error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Email/Phone */}
          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FiMail size={14} /> Email ou Téléphone
            </label>
            <input
              id="email"
              type="text"
              placeholder="votre@email.com ou +221 XX XXX XX XX"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className={styles.formGroup}>
            <label htmlFor="password">
              <FiLock size={14} /> Mot de passe
            </label>
            <div className={styles.pwdWrapper}>
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div className={styles.formGroup}>
              <label htmlFor="confirmPwd">
                <FiLock size={14} /> Confirmer mot de passe
              </label>
              <div className={styles.pwdWrapper}>
                <input
                  id="confirmPwd"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? '...' : mode === 'login' ? 'Se connecter' : 'S\'inscrire'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className={styles.footer}>
          <span>
            {mode === 'login' ? 'Pas encore de compte? ' : 'Déjà un compte? '}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login')
                setEmail('')
                setPassword('')
                setConfirmPwd('')
                setMessage('')
                setError(null)
              }}
              disabled={loading}
            >
              {mode === 'login' ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </span>
        </div>
      </div>
    </div>
  )
}
