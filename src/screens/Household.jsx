import { useNavigate } from 'react-router-dom'
import { useHousehold } from '../context/HouseholdContext'
import { useLanguage } from '../context/LanguageContext'
import Icon from '../components/Icon'

export default function Household() {
  const { household, uid, householdId, removeMember } = useHousehold()
  const { t } = useLanguage()
  const navigate = useNavigate()

  const members = household ? Object.entries(household.members || {}) : []
  const isOwner = household?.ownerUid === uid

  function copyCode() {
    navigator.clipboard?.writeText(householdId)
  }

  function handleRemove(memberUid, memberName) {
    if (confirm(t('household.removeConfirm', { name: memberName }))) {
      removeMember(memberUid)
    }
  }

  return (
    <div className="screen">
      <div className="topbar">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h1>{t('household.title')}</h1>
        <span style={{ width: 24 }} />
      </div>

      <div style={{ textAlign: 'center', margin: '10px 0 24px' }}>
        <div style={{ fontSize: 48 }}>✅</div>
        <h1 style={{ fontSize: 20, color: 'var(--green-900)', margin: '10px 0 4px' }}>
          {t('household.allSet')}
        </h1>
        <p style={{ color: 'var(--ink-600)', fontSize: 13.5 }}>{t('household.shareHint')}</p>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="label-text" style={{ fontSize: 12, color: 'var(--ink-400)', marginBottom: 6 }}>
          {t('household.householdId')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="household-code">{householdId}</span>
          <button className="copy-btn" onClick={copyCode}>
            {t('household.copy')}
          </button>
        </div>
      </div>

      <div className="section-header">
        <h2>{t('household.peopleTitle')}</h2>
      </div>
      <div className="item-list" style={{ marginBottom: 24 }}>
        {members.map(([memberUid, member]) => (
          <div key={memberUid} className="item-row" style={{ cursor: 'default' }}>
            <div className="item-icon">👤</div>
            <div className="item-info">
              <div className="item-name">{member.name}</div>
              <div className="item-sub">
                {member.role === 'owner' ? t('household.owner') : t('household.member')}
                {memberUid === uid ? ` • ${t('household.you')}` : ''}
              </div>
            </div>
            {isOwner && memberUid !== uid && (
              <button
                className="icon-btn"
                title={t('household.removeConfirm', { name: member.name })}
                onClick={() => handleRemove(memberUid, member.name)}
              >
                <Icon name="trash" size={18} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button className="btn btn-primary" onClick={() => navigate('/home', { replace: true })}>
        {t('household.done')}
      </button>
    </div>
  )
}
