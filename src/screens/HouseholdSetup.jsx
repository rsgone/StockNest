import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'

// Household codes are generated as XXXX-XXXX; auto-insert the dash as the
// user types so pasting/typing a raw "KFVSURQ7" becomes "KFVS-URQ7".
function formatCode(raw) {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  return clean.length > 4 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean
}

export default function HouseholdSetup() {
  const { name, createHousehold, joinHousehold } = useHousehold()
  const { t } = useLanguage()
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleCreate() {
    setBusy(true)
    setError('')
    try {
      await createHousehold(name)
      navigate('/household', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await joinHousehold(code, name)
      navigate('/home', { replace: true })
    } catch {
      setError(t('householdSetup.errorNotFound'))
    } finally {
      setBusy(false)
    }
  }

  if (mode === 'join') {
    return (
      <div className="center-screen">
        <div className="hero-emoji">🔗</div>
        <h1>{t('householdSetup.joinTitle')}</h1>
        <p>{t('householdSetup.joinSubtitle')}</p>
        <form onSubmit={handleJoin}>
          <div className="field" style={{ textAlign: 'left' }}>
            <label>{t('householdSetup.codeLabel')}</label>
            <input
              autoFocus
              placeholder="ABCD-EFGH"
              maxLength={9}
              value={code}
              onChange={(e) => setCode(formatCode(e.target.value))}
            />
          </div>
          {error && <p className="error-text">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={busy || !code.trim()}>
            {busy ? t('householdSetup.joining') : t('householdSetup.joinButton')}
          </button>
        </form>
        <button className="btn btn-ghost" onClick={() => setMode(null)} style={{ marginTop: 10 }}>
          {t('householdSetup.back')}
        </button>
      </div>
    )
  }

  return (
    <div className="center-screen">
      <div className="hero-emoji">🏡</div>
      <h1>{t('householdSetup.setupTitle')}</h1>
      <p>{t('householdSetup.setupSubtitle', { name })}</p>
      {error && <p className="error-text">{error}</p>}
      <button className="btn btn-primary" onClick={handleCreate} disabled={busy}>
        {busy ? t('householdSetup.creating') : t('householdSetup.createButton')}
      </button>
      <div className="divider-text">{t('householdSetup.or')}</div>
      <button className="btn btn-secondary" onClick={() => setMode('join')} disabled={busy}>
        {t('householdSetup.joinWithCode')}
      </button>
    </div>
  )
}
