import { NavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import Icon from './Icon'

export default function BottomNav() {
  const { t } = useLanguage()

  return (
    <nav className="bottom-nav">
      <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">
          <Icon name="home" />
        </span>
        {t('nav.home')}
      </NavLink>
      <NavLink to="/shopping-list" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">
          <Icon name="bag" />
        </span>
        {t('nav.shopping')}
      </NavLink>
      <NavLink to="/add" className="nav-fab" aria-label={t('nav.addItem')}>
        +
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">
          <Icon name="clock" />
        </span>
        {t('nav.history')}
      </NavLink>
      <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <span className="nav-icon">
          <Icon name="settings" />
        </span>
        {t('nav.settings')}
      </NavLink>
    </nav>
  )
}
