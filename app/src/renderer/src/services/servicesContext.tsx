// ServicesContext.tsx
import React from 'react'
import { createServices } from './services'

type ServicesType = ReturnType<typeof createServices>

const ServicesContext = React.createContext<ServicesType | null>(null)

interface ServicesProviderProps {
  children: React.ReactNode
}

export function ServicesProvider({ children }: ServicesProviderProps) {
  const servicesRef = React.useRef<ServicesType>(createServices())
  return <ServicesContext.Provider value={servicesRef.current}>{children}</ServicesContext.Provider>
}

export const useServices = (): ServicesType => {
  const ctx = React.useContext(ServicesContext)
  if (!ctx) throw new Error('Must be inside ServicesProvider')
  return ctx
}
