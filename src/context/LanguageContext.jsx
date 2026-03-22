import { createContext, useContext, useState } from 'react'
import { translations, t as translate } from '../lib/i18n'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('medi-lang') || 'en')

  function setLanguage(code) {
    setLang(code)
    localStorage.setItem('medi-lang', code)
  }

  function t(key) {
    return translate(lang, key)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLang = () => useContext(LanguageContext)
