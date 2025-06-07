import { Routes, Route, Navigate, useLocation } from "react-router-dom"
import Dashboard from "@/app/dashboard/dashboard"
import Homepage from "@/app/home/homepage"
import LoginPage from "@/app/auth/login"
import SignupPage from "@/app/auth/signup"
import AuthCallback from "@/app/auth/callback"
import UserProfileDynamicPage from "@/app/user/[username]/page"
import ServicesPage from "@/app/dashboard/services"
import BillingPage from "@/app/dashboard/billing"
import AnalyticsPage from "@/app/dashboard/analytics"
import ProjectsPage from "@/app/dashboard/projects"
import ContractsPage from "@/app/dashboard/contracts"
import OrdersPage from "@/app/dashboard/orders"
import SalesPage from "@/app/dashboard/sales"
import WalletPage from "@/app/dashboard/wallet"
import FindTalentPage from "@/app/home/find-talent"
import TutorialsPage from "@/app/home/tutorials"
import MarketingPage from "@/app/home/marketing"
import CollaboratePage from "@/app/home/collaborate"
import CheckoutPage from "@/app/checkout/checkout"
import OrderHistoryPage from "@/app/orders/order-history"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { SidebarProvider } from "@/components/@/ui/sidebar"
import { AudioPlayerProvider } from "@/contexts/audio-player-context"
import { AudioPlayer } from "@/components/audio/audio-player"
import { useAuth } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { PageLoading } from "@/components/ui/page-loading"
import { UserProfileRedirect } from "@/components/auth/UserProfileRedirect"
import { UploadDialog } from "@/components/profile/UploadDialog"
import UploadWizard from "@/app/upload/upload-wizard"
import FilesPage from "@/app/files/files"

function App() {
  const { user } = useAuth()
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [showLoader, setShowLoader] = useState(false)
  const [prevLocation, setPrevLocation] = useState(location)

  useEffect(() => {
    if (location.pathname !== prevLocation.pathname) {
      setIsLoading(true)
      // Only show loader if page takes longer than 500ms to load
      const timer = setTimeout(() => setShowLoader(true), 500)
      
      // Safety timeout to ensure loader doesn't get stuck
      const timeout = setTimeout(() => {
        setIsLoading(false)
      }, 3000) // 3 second timeout as fallback

      return () => {
        clearTimeout(timer)
        clearTimeout(timeout)
      }
    }
    setPrevLocation(location)
  }, [location, prevLocation])

  useEffect(() => {
    if (!isLoading) {
      setShowLoader(false)
    }
  }, [isLoading])

  // Clear loader when route components are mounted
  useEffect(() => {
    setIsLoading(false)
  }, [location.key])

  return (
    <SidebarProvider>
      <UploadDialog 
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={async (files) => {
          console.log('Files to upload:', files)
        }}
      />
      <AudioPlayerProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/user/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/billing" 
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/projects" 
            element={
              <ProtectedRoute>
                <ProjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/contracts" 
            element={
              <ProtectedRoute>
                <ContractsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/orders" 
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders/history" 
            element={<OrderHistoryPage />} 
          />
          <Route 
            path="/dashboard/sales" 
            element={
              <ProtectedRoute>
                <SalesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/wallet" 
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/auth/login" 
            element={user ? <Navigate to="/user/dashboard\" replace /> : <LoginPage />} 
          />
          <Route 
            path="/auth/signup" 
            element={user ? <Navigate to="/user/dashboard\" replace /> : <SignupPage />} 
          />
          <Route path="/auth/callback\" element={<AuthCallback />} />
          <Route
            path="/user/:username"
            element={<UserProfileDynamicPage />}
          />
          <Route
            path="/upload" 
            element={
              <ProtectedRoute>
                <UploadWizard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/files" 
            element={
              <ProtectedRoute>
                <FilesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/services" 
            element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/find-talent" element={<FindTalentPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/marketing" element={<MarketingPage />} />
          <Route path="/collaborate" element={<CollaboratePage />} />
          <Route path="/following" element={<CollaboratePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
        <AudioPlayer />
      </AudioPlayerProvider>
    </SidebarProvider>
  )
}

export default App;