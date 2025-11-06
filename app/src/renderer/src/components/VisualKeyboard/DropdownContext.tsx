import log from 'electron-log';
import React, { createContext, useContext, useState, useCallback } from 'react';

interface DropdownContextType {
  openDropdownId: string | null;
  openDropdown: (id: string) => void;
  closeDropdown: () => void;
  isOpen: (id: string) => boolean;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const openDropdown = useCallback((id: string) => {
    log.debug(`Opening dropdown with id: ${id}`);
    setOpenDropdownId(id);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  const isOpen = useCallback((id: string) => {
    log.silly(`Checking if dropdown with id: ${id} is open`);
    return openDropdownId === id;
  }, [openDropdownId]);

  const value = {
    openDropdownId,
    openDropdown,
    closeDropdown,
    isOpen,
  };

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
}

export function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
}
