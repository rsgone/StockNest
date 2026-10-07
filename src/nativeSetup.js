import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'

if (Capacitor.isNativePlatform()) {
  StatusBar.setOverlaysWebView({ overlay: false })
  StatusBar.setBackgroundColor({ color: '#f2f9f1' })
  StatusBar.setStyle({ style: Style.Light })
}
