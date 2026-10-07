import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'

// Android hardware/gesture back button: step back through screen history
// like any normal app, and only exit once there's nowhere left to go back to
// (or we've landed back on Home, which is the app's root screen).
export default function BackButtonHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const listenerPromise = CapApp.addListener('backButton', () => {
      const atRoot = window.history.state?.idx === 0
      if (location.pathname === '/home' || atRoot) {
        CapApp.exitApp()
      } else {
        navigate(-1)
      }
    })

    return () => {
      listenerPromise.then((listener) => listener.remove())
    }
  }, [navigate, location])

  return null
}
