import { Navigate, Outlet, Route, BrowserRouter, Routes } from 'react-router-dom'
import { HouseholdProvider, useHousehold } from './context/HouseholdContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import BottomNav from './components/BottomNav'
import BackButtonHandler from './components/BackButtonHandler'
import Welcome from './screens/Welcome'
import HouseholdSetup from './screens/HouseholdSetup'
import Household from './screens/Household'
import Home from './screens/Home'
import AddItem from './screens/AddItem'
import ItemDetail from './screens/ItemDetail'
import ShoppingList from './screens/ShoppingList'
import History from './screens/History'
import Settings from './screens/Settings'

function MainLayout() {
  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  )
}

function Gate() {
  const { authReady, name, hasHousehold } = useHousehold()
  const { t } = useLanguage()

  if (!authReady) {
    return (
      <div className="center-screen">
        <div className="hero-emoji">🧺</div>
        <p>{t('app.loading')}</p>
      </div>
    )
  }

  if (!name) {
    return (
      <Routes>
        <Route path="*" element={<Welcome />} />
      </Routes>
    )
  }

  if (!hasHousehold) {
    return (
      <Routes>
        <Route path="/household" element={<Household />} />
        <Route path="*" element={<HouseholdSetup />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/add" element={<AddItem />} />
      <Route path="/item/:id" element={<ItemDetail />} />
      <Route path="/household" element={<Household />} />
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <LanguageProvider>
        <HouseholdProvider>
          <div className="app-shell">
            <BackButtonHandler />
            <Gate />
          </div>
        </HouseholdProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
