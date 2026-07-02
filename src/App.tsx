import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { initContentSync } from './lib/sync'
import { initBookingsRealtime } from './store/bookings'
import SitePage from './site/SitePage'
import { Login } from './admin/Login'
import { RequireAuth, AdminLayout } from './admin/AdminLayout'
import { Dashboard } from './admin/pages/Dashboard'
import { LayoutPreview } from './admin/pages/LayoutPreview'
import { Settings } from './admin/pages/Settings'
import { HeroEditor } from './admin/pages/HeroEditor'
import { AboutEditor } from './admin/pages/AboutEditor'
import { ServicesEditor } from './admin/pages/ServicesEditor'
import { WhyEditor } from './admin/pages/WhyEditor'
import { SpecialtiesEditor } from './admin/pages/SpecialtiesEditor'
import { JourneyEditor } from './admin/pages/JourneyEditor'
import { ContactEditor, Account } from './admin/pages/ContactAccount'
import { Bookings } from './admin/pages/Bookings'
import { Themes } from './admin/pages/Themes'
import { Backup } from './admin/pages/Backup'

export default function App() {
  useEffect(() => {
    initContentSync()
    initBookingsRealtime()
  }, [])
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SitePage />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="layout" element={<LayoutPreview />} />
          <Route path="preview" element={<Navigate to="/admin/layout" replace />} />
          <Route path="themes" element={<Themes />} />
          <Route path="hero" element={<HeroEditor />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="services" element={<ServicesEditor />} />
          <Route path="why" element={<WhyEditor />} />
          <Route path="specialties" element={<SpecialtiesEditor />} />
          <Route path="journey" element={<JourneyEditor />} />
          <Route path="contact" element={<ContactEditor />} />
          <Route path="settings" element={<Settings />} />
          <Route path="backup" element={<Backup />} />
          <Route path="account" element={<Account />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
