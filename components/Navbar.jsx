'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap, Wallet, Menu, MoreVertical, Search, LifeBuoy,
  BookOpen, ChevronRight, ChevronLeft, Globe,
} from 'lucide-react';
import { useTranslation } from '@/lib/translation-context';

// Small brand-only icons that don't have a great lucide equivalent stand-in
function XIcon(props) {
  return (
    <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.3 3H21l-6.6 7.5L22 21h-6.1l-4.8-6.3L5.6 21H3l7-8-7-10h6.2l4.3 5.8L18.3 3z" />
    </svg>
  );
}
function DiscordIcon(props) {
  return (
    <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 5.5A17 17 0 0 0 15.6 4l-.3.6a13 13 0 0 1 3.7 1.4A15 15 0 0 0 12 4.5a15 15 0 0 0-7 1.5A13 13 0 0 1 8.7 4.6L8.4 4A17 17 0 0 0 4 5.5C1.9 8.9 1.3 12.2 1.6 15.4a17 17 0 0 0 5 2.6l.8-1.3a11 11 0 0 1-1.7-.8l.4-.3a12 12 0 0 0 12 0l.4.3a11 11 0 0 1-1.7.8l.8 1.3a17 17 0 0 0 5-2.6c.4-3.7-.5-7-2.6-9.9zM9 13.6c-.8 0-1.4-.8-1.4-1.7s.6-1.7 1.4-1.7 1.5.8 1.4 1.7c0 .9-.6 1.7-1.4 1.7zm6 0c-.8 0-1.4-.8-1.4-1.7s.6-1.7 1.4-1.7 1.4.8 1.4 1.7-.6 1.7-1.4 1.7z" />
    </svg>
  );
}
function TelegramIcon(props) {
  return (
    <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 3 2.5 10.8c-1 .4-1 1.7.1 2l4.6 1.5 1.8 5.7c.2.7 1.1.9 1.6.3l2.6-2.9 4.8 3.5c.7.5 1.7.1 1.9-.7L22 3z" />
    </svg>
  );
}

function GitHubIcon(props) {
  return (
    <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1.7 1.7 2.5 2.3.4-.9.7-1.5 1-1.9-2.6-.3-5.3-1.3-5.3-5.9 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.8 1.2 3.1 0 4.6-2.7 5.6-5.3 5.9.7.5 1.2 1.4 1.2 2.8v4.1c0 .3.2.7.9.6C20.7 21.4 24 17.1 24 12 24 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

function FolderIcon(props) {
  return (
    <svg width={props.size || 18} height={props.size || 18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4a2 2 0 0 0-2 2v2h20V6a2 2 0 0 0-2-2h-8l-2-0zM2 10v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-8H2z" />
    </svg>
  );
}

export default function Navbar({ connectedLabel, onOpenConnect, onOpenScan }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [languagePanelOpen, setLanguagePanelOpen] = useState(false);
  const [resourcesPanelOpen, setResourcesPanelOpen] = useState(false);
  const activeSection = pathname?.startsWith('/earn')
    ? 'earn'
    : pathname?.startsWith('/portfolio')
    ? 'portfolio'
    : pathname?.startsWith('/missions')
    ? 'missions'
    : 'trade';
  const wrapRef = useRef(null);
  const { t, language, setLanguage, languages } = useTranslation();

  useEffect(() => {
    function onDocPointerDown(e) {
      if (menuOpen && wrapRef.current && !wrapRef.current.contains(e.target)) {
        setMenuOpen(false);
        setLanguagePanelOpen(false);
        setResourcesPanelOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.__navbarMenuOpen = menuOpen;
      window.__navbarLanguagePanelOpen = languagePanelOpen;
      window.__navbarResourcesPanelOpen = resourcesPanelOpen;
    }
  }, [menuOpen, languagePanelOpen, resourcesPanelOpen]);

  return (
    <header className="navbar-wrap">
      <div className="navbar">
        <div className="navbar-left">
          <div className="navbar-brand">
            <img
              src="/icons/apple-touch-icon-180x180.png"
              alt="BoltSwap logo"
              className="navbar-brand-logo"
              style={{ width: 32, height: 32, objectFit: 'contain', background: 'transparent', padding: 0, border: 'none', marginLeft: 12 }}
            />
            <span className="brand-title-text">BOLTSWAP</span>
          </div>
          <nav className="navbar-links">
            <Link href="/" className={activeSection === 'trade' ? 'active' : ''}>{t.trade}</Link>
            <Link href="/earn" className={activeSection === 'earn' ? 'active' : ''}>{t.earn}</Link>
            <Link href="/portfolio" className={activeSection === 'portfolio' ? 'active' : ''}>{t.portfolio}</Link>
            <Link href="/missions" className={activeSection === 'missions' ? 'active' : ''}>{t.missions}</Link>
          </nav>
        </div>

        <div className="navbar-actions">
          <button className={`navbar-connect-btn ${connectedLabel ? 'connected' : ''}`} onClick={onOpenConnect}>
            <Wallet size={16} />
            <span className="connect-btn-label">{connectedLabel || t.connect}</span>
          </button>

          <button className="navbar-hamburger" onClick={() => setMobileOpen((v) => { const nv = !v; if (nv) { setLanguagePanelOpen(false); setResourcesPanelOpen(false); } return nv; })} aria-label="Toggle Navigation Menu">
            <Menu size={18} />
          </button>

          <div className="navbar-wrap-dropdown desktop-only-menu" ref={wrapRef} onClick={(e) => e.stopPropagation()}>
            <button className="navbar-menu-btn" type="button" onClick={(e) => { e.stopPropagation(); window.__desktopMenuClicked = true; setMenuOpen((v) => !v); setLanguagePanelOpen(false); setResourcesPanelOpen(false); }} aria-label="More options">
              <MoreVertical size={18} />
            </button>
            {menuOpen && (
              <div className="navbar-dropdown open" onClick={(e) => e.stopPropagation()}>
                {languagePanelOpen ? (
                  <div className="language-panel">
                    <button className="language-panel-back" onClick={() => { setLanguagePanelOpen(false); }}>
                      <ChevronLeft size={18} /> <span>{t.language}</span>
                    </button>
                    <div className="language-panel-list">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          className={`language-item ${language === lang.code ? 'active' : ''}`}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLanguagePanelOpen(false);
                            setMenuOpen(false);
                          }}
                        >
                          <span>{lang.label}</span>
                          {language === lang.code && <span className="language-check">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : resourcesPanelOpen ? (
                  <div className="resources-panel">
                    <button className="language-panel-back" onClick={() => { setResourcesPanelOpen(false); }}>
                      <ChevronLeft size={18} /> <span>{t.resources}</span>
                    </button>
                    <div style={{ padding: 12 }}>
                      <a href="#" className="resource-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('https://github.com', '_blank'); setMenuOpen(false); setResourcesPanelOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8 }}>
                        <span className="mi-icon"><GitHubIcon size={18} /></span>
                        <span className="mi-label">GitHub</span>
                      </a>
                      <a href="#" className="resource-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); /* open brand assets */ setMenuOpen(false); setResourcesPanelOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8 }}>
                        <span className="mi-icon"><FolderIcon size={18} /></span>
                        <span className="mi-label">Brand Assets</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <a href="#" className="menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenScan?.(); setMenuOpen(false); }}><span className="mi-icon"><Search size={18} /></span><span className="mi-label">{t.scan}</span></a>
                    <button className="menu-item" type="button" onClick={(e) => { e.stopPropagation(); /* open support */ setMenuOpen(false); }}><span className="mi-icon"><LifeBuoy size={18} /></span><span className="mi-label">{t.support}</span></button>
                    <button className="menu-item" type="button" onClick={(e) => { e.stopPropagation(); setLanguagePanelOpen(true); }}>
                      <span className="mi-icon"><Globe size={18} /></span>
                      <span className="mi-label">{t.language}</span>
                      <span className="mi-value">{language.toUpperCase()}</span>
                      <span className="mi-chevron"><ChevronRight size={14} /></span>
                    </button>
                    <button className="menu-item" type="button" onClick={(e) => { e.stopPropagation(); setResourcesPanelOpen(true); }}>
                      <span className="mi-icon"><BookOpen size={18} /></span>
                      <span className="mi-label">{t.resources}</span>
                      <span className="mi-chevron"><ChevronRight size={14} /></span>
                    </button>
                    <div className="navbar-dropdown-divider" />
                    <div className="navbar-social-row">
                      <a href="#" aria-label="X"><XIcon size={18} /></a>
                      <a href="#" aria-label="Discord"><DiscordIcon size={18} /></a>
                      <a href="#" aria-label="Telegram"><TelegramIcon size={18} /></a>
                      <span className="spacer" />
                    </div>
                    <div className="navbar-footer-links">
                      <a href="#">{t.terms}</a> &middot; <a href="#">{t.privacy}</a> &middot; <a href="#">{t.newsletter}</a>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`navbar-mobile-links ${mobileOpen ? 'open' : ''}`}>
        {!languagePanelOpen && !resourcesPanelOpen ? (
          <>
            <div className="mobile-nav-section">
              <Link href="/" className={activeSection === 'trade' ? 'active' : ''} onClick={() => setMobileOpen(false)}>{t.trade}</Link>
              <Link href="/earn" className={activeSection === 'earn' ? 'active' : ''} onClick={() => setMobileOpen(false)}>{t.earn}</Link>
              <Link href="/portfolio" className={activeSection === 'portfolio' ? 'active' : ''} onClick={() => setMobileOpen(false)}>{t.portfolio}</Link>
              <Link href="/missions" className={activeSection === 'missions' ? 'active' : ''} onClick={() => setMobileOpen(false)}>{t.missions}</Link>
            </div>
            <div className="navbar-dropdown-divider" />
            <div className="mobile-actions-column">
              <a href="#" className="menu-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onOpenScan?.(); setMobileOpen(false); }}><span className="mi-icon"><Search size={18} /></span><span className="mi-label">{t.scan}</span></a>
              <button className="menu-item" type="button" onClick={(e) => { e.stopPropagation(); /* open support */ setMobileOpen(false); }}><span className="mi-icon"><LifeBuoy size={18} /></span><span className="mi-label">{t.support}</span></button>
              <button className="menu-item" type="button" onClick={(e) => { e.stopPropagation(); setLanguagePanelOpen(true); }}>
                <span className="mi-icon"><Globe size={18} /></span>
                <span className="mi-label">{t.language}</span>
                <span className="mi-value">{language.toUpperCase()}</span>
                <span className="mi-chevron"><ChevronRight size={14} /></span>
              </button>
              <button className="menu-item" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setResourcesPanelOpen(true); }}><span className="mi-icon"><BookOpen size={18} /></span><span className="mi-label">{t.resources}</span></button>
            </div>
            <div className="navbar-dropdown-divider" />
            <div className="navbar-social-row" style={{ padding: '8px 12px' }}>
              <a href="#" aria-label="X"><XIcon size={18} /></a>
              <a href="#" aria-label="Discord"><DiscordIcon size={18} /></a>
              <a href="#" aria-label="Telegram"><TelegramIcon size={18} /></a>
            </div>
            <div className="navbar-footer-links">
              <a href="#">{t.terms}</a> &middot; <a href="#">{t.privacy}</a> &middot; <a href="#">{t.newsletter}</a>
            </div>
          </>
        ) : languagePanelOpen ? (
          <div className="mobile-language-panel">
            <button className="language-panel-back" onClick={() => setLanguagePanelOpen(false)}>
              <ChevronLeft size={18} /> <span>{t.language}</span>
            </button>
            <div className="language-panel-list">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  className={`language-item ${language === lang.code ? 'active' : ''}`}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLanguagePanelOpen(false);
                    setMobileOpen(false);
                  }}
                >
                  <span>{lang.label}</span>
                  {language === lang.code && <span className="language-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mobile-resources-panel">
            <button className="language-panel-back" onClick={() => setResourcesPanelOpen(false)}>
              <ChevronLeft size={18} /> <span>{t.resources}</span>
            </button>
            <div style={{ padding: 12 }}>
              <a href="#" className="resource-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open('https://github.com', '_blank'); setMobileOpen(false); setResourcesPanelOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8 }}>
                <span className="mi-icon"><GitHubIcon size={18} /></span>
                <span className="mi-label">GitHub</span>
              </a>
              <a href="#" className="resource-item" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setMobileOpen(false); setResourcesPanelOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 8 }}>
                <span className="mi-icon"><FolderIcon size={18} /></span>
                <span className="mi-label">Brand Assets</span>
              </a>
            </div>
          </div>
        )}
      </div>

    </header>
  );
}
