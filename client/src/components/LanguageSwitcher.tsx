import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useDirection } from '../hooks/useDirection'; // Custom hook for direction handling

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}



function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { setDirection } = useDirection();
  const [languages] = useState<LanguageOption[]>([
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' }
  ]);

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (lng: string) => {
    const selectedLang = languages.find(lang => lang.code === lng);
    if (selectedLang) {
      i18n.changeLanguage(lng);
      setDirection(selectedLang.dir);
    }
  };

// Initialize with Arabic
  useEffect(() => {
    if (!localStorage.getItem('i18n-lng')) {
      i18n.changeLanguage('ar');
      setDirection('rtl');
    }
  }, []);

  return (
    <div className="dropdown" dir={currentLanguage.dir}>
      <button 
        className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center gap-2"
        type="button" 
        id="languageDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label={i18n.t('languageSwitcher.ariaLabel')}
      >
        <span className={`fi fi-${currentLanguage.code === 'ar' ? 'sa' : 'us'}`}></span>
        {currentLanguage.nativeName}
      </button>
      <ul 
        className="dropdown-menu dropdown-menu-end"
        aria-labelledby="languageDropdown"
      >
        {languages.map((language) => (
          <li key={language.code}>
            <button 
              className={`dropdown-item d-flex align-items-center gap-2 ${i18n.language === language.code ? 'active' : ''}`}
              onClick={() => changeLanguage(language.code)}
              disabled={i18n.language === language.code}
              aria-current={i18n.language === language.code ? 'true' : undefined}
            >
              <span className={`fi fi-${language.code === 'ar' ? 'sa' : 'us'}`}></span>
              {language.nativeName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LanguageSwitcher;