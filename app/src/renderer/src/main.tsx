import './assets/main.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { HashRouter } from 'react-router-dom'
import { DropdownProvider } from './components/VisualKeyboard/DropdownContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <DropdownProvider>
        <App />
      </DropdownProvider>
    </HashRouter>
  </React.StrictMode>
)
