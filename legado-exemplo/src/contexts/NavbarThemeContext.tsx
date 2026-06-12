import React, { createContext, useContext, useState, useEffect } from 'react';

export type NavbarTheme = 'verde' | 'gelo' | 'dark';

interface NavbarThemeContextProps {
  theme: NavbarTheme;
  setTheme: (theme: NavbarTheme) => void;
}

const NavbarThemeContext = createContext<NavbarThemeContextProps>({
  theme: 'verde',
  setTheme: () => {},
});

export const useNavbarTheme = () => useContext(NavbarThemeContext);

export const NavbarThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<NavbarTheme>('verde');

  useEffect(() => {
    const saved = localStorage.getItem('navbarTheme') as NavbarTheme | null;
    if (saved) setThemeState(saved);
  }, []);

  const setTheme = (newTheme: NavbarTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('navbarTheme', newTheme);
  };

  return (
    <NavbarThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </NavbarThemeContext.Provider>
  );
}; 