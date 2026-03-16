'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { t, type Lang, type Translations } from '@/lib/i18n'

type ContextValue = {
  lang: Lang
  setLang: (l: Lang) => void
  T: Translations
}

const LanguageContext = createContext<ContextValue>({
  lang: 'en',
  setLang: () => {},
  T: t.en,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved === 'en' || saved === 'zh') setLangState(saved)
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    localStorage.setItem('lang', l)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, T: t[lang] }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
