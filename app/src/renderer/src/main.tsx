import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'
import { ServicesProvider } from './services/servicesContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ServicesProvider>
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  </ServicesProvider>
)
