import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from './components/public/PublicLayout'
import AdminLayout from './components/admin/AdminLayout'

// Public Pages
import Home from './pages/public/Home'
import Results from './pages/public/Results'
import PropertyDetail from './pages/public/PropertyDetail'
import Wishlist from './pages/public/Wishlist'
import About from './pages/public/About'
import PrivacyPolicy from './pages/public/PrivacyPolicy'
import PropertiesPage from './pages/public/PropertiesPage'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import Properties from './pages/admin/Properties'
import CRM from './pages/admin/CRM'
import Documents from './pages/admin/Documents'
import PdfBrochure from './pages/admin/PdfBrochure'
import CMS from './pages/admin/CMS'
import Testimonials from './pages/admin/Testimonials'

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:slug" element={<PropertyDetail />} />
        <Route path="/kannur/:type/:slug" element={<PropertyDetail />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/properties/:id/pdf" element={<PdfBrochure />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="properties" element={<Properties />} />
        <Route path="crm" element={<CRM />} />
        <Route path="documents" element={<Documents />} />
        <Route path="cms" element={<CMS />} />
        <Route path="testimonials" element={<Testimonials />} />
      </Route>
    </Routes>
  )
}

export default App
