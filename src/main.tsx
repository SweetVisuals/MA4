import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Toaster } from "sonner"
import App from "./App"
import { AuthProvider } from "./contexts/auth-context"
import { ThemeProvider } from "./components/theme-provider"
import { CartProvider } from "./contexts/cart-context"
import "./styles/global.css"

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AuthProvider>
          <CartProvider>
            <App />
            <Toaster richColors position="bottom-right" />
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)