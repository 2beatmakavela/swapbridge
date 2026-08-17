'use client';

import { X } from 'lucide-react';
import { useTranslation } from '@/lib/translation-context';

export default function LanguageModal({ onClose }) {
  const { language, setLanguage, languages, t } = useTranslation();

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content language-modal">
        <div className="modal-header">
          <h2>{t.language}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`language-item ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                setLanguage(lang.code);
                onClose();
              }}
            >
              <span>{lang.label}</span>
              {language === lang.code && <span className="language-check">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
