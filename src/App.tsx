import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { initContentSync } from './lib/sync'
import { initBookingsRealtime } from './store/bookings'
import { useTheme } from './store/theme'
import SitePage from './site/SitePage'
import { Login } from './admin/Login'
import { RequireAuth, AdminLayout } from './admin/AdminLayout'
import { Dashboard } from './admin/pages/Dashboard'
import { Customize } from './admin/pages/Customize'
import { Settings } from './admin/pages/Settings'
import { HeroEditor } from './admin/pages/HeroEditor'
import { StatsEditor } from './admin/pages/StatsEditor'
import { FaqEditor, TestimonialsEditor, PricingEditor, GalleryEditor } from './admin/pages/BlockEditors'
import { AboutEditor } from './admin/pages/AboutEditor'
import { ServicesEditor } from './admin/pages/ServicesEditor'
import { WhyEditor } from './admin/pages/WhyEditor'
import { SpecialtiesEditor } from './admin/pages/SpecialtiesEditor'
import { JourneyEditor } from './admin/pages/JourneyEditor'
import { ContactEditor, Account } from './admin/pages/ContactAccount'
import { Bookings } from './admin/pages/Bookings'
import { Themes } from './admin/pages/Themes'
import { Backup } from './admin/pages/Backup'

/** Bật/tắt lớp .dark trên <html> — CHỈ ở route /admin (trừ trang Tùy chỉnh full-screen). */
function ThemeManager() {
  const dark = useTheme((s) => s.dark)
  const { pathname } = useLocation()
  useEffect(() => {
    const on = dark && pathname.startsWith('/admin') && pathname !== '/admin/customize'
    document.documentElement.classList.toggle('dark', on)
  }, [dark, pathname])
  return null
}

export default function App() {
  useEffect(() => {
    initContentSync()
    initBookingsRealtime()
  }, [])
  return (
    <BrowserRouter>
      <ThemeManager />
      <Routes>
        <Route path="/" element={<SitePage />} />
        <Route path="/admin/login" element={<Login />} />
        {/* Tùy chỉnh giao diện: toàn màn hình, NGOÀI khung quản trị (không sidebar) */}
        <Route path="/admin/customize" element={<RequireAuth><Customize /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<Dashboard />} />
          <Route path="bookings" element={<Bookings />} />
          {/* Các đường cũ → gộp về Tùy chỉnh giao diện */}
          <Route path="layout" element={<Navigate to="/admin/customize" replace />} />
          <Route path="editor" element={<Navigate to="/admin/customize" replace />} />
          <Route path="preview" element={<Navigate to="/admin/customize" replace />} />
          <Route path="themes" element={<Themes />} />
          <Route path="hero" element={<HeroEditor />} />
          <Route path="stats" element={<StatsEditor />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="services" element={<ServicesEditor />} />
          <Route path="why" element={<WhyEditor />} />
          <Route path="specialties" element={<SpecialtiesEditor />} />
          <Route path="journey" element={<JourneyEditor />} />
          <Route path="testimonials" element={<TestimonialsEditor />} />
          <Route path="faq" element={<FaqEditor />} />
          <Route path="pricing" element={<PricingEditor />} />
          <Route path="gallery" element={<GalleryEditor />} />
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
