import React, { useState, useEffect } from "react";
import { useLocalization } from "../lib/LocalizationContext";
import { PersonaSelector } from "./PersonaSelector";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "./Search";
import { CartDrawer } from "./CartDrawer";
import { LocalizedLink } from "./LocalizedLink";
import { useCart } from "../lib/CartContext";
import { fetchNavigation, Navigation as NavType } from "../lib/hygraphClient";
import "./Navigation.css";

import { createPreviewAttributes } from "../lib/hygraphPreview";
import { usePreviewContext } from "../lib/PreviewContext";

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cmsNav, setCmsNav] = useState<NavType | null>(null);
  const { isClickToEditEnabled, toggleClickToEdit } = usePreviewContext();
  const { locale, setLocale, availableLocales } = useLocalization();

  useEffect(() => {
    let isMounted = true;
    fetchNavigation(locale).then(data => {
      if (isMounted) setCmsNav(data);
    }).catch(console.error);
    return () => { isMounted = false; };
  }, [locale]);

  useEffect(() => {
    if (cmsNav?.logo?.url) {
      const link: HTMLLinkElement = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = cmsNav.logo.url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [cmsNav?.logo?.url]);

  const isActive = (path: string) => {
    // 1. Remove trailing slashes for consistency
    const cleanPath = path === '/' ? '/' : path.replace(/\/$/, '');

    // 2. Get current path without locale
    // location.pathname is like "/en/blog" or "/en"
    // We want to match against "path" which is like "/blog" or "/"

    // Check if location.pathname starts with the locale prefix we expect
    const localePrefix = `/${locale}`;
    let currentPath = location.pathname;

    if (currentPath.startsWith(localePrefix)) {
      currentPath = currentPath.slice(localePrefix.length);
      // Ensure specific case for root after stripping
      if (currentPath === '') currentPath = '/';
    }

    // 3. Exact match for home, partial for others
    if (cleanPath === '/') {
      return currentPath === '/';
    }

    return currentPath.startsWith(cleanPath);
  };

  const getTo = (target: any) => {
    if (!target) return "/";
    if (target.__typename === 'LandingPage') {
      return target.lpSlug === 'home' ? '/' : `/${target.lpSlug}`;
    }
    if (target.__typename === 'Product') return `/product/${target.productSlug}`;
    if (target.__typename === 'BlogPost') return `/blog/${target.blogSlug}`;
    if (target.__typename === 'BlogPage') return `/${target.bpSlug}`;
    if (target.__typename === 'CollectionPage') return `/${target.cpSlug}`;
    if (target.__typename === 'PersonalisationPage') return `/${target.pageSlug}`;
    if (target.__typename === 'ProductCategory') return `/collection?category=${target.categorySlug}`;
    return "/";
  };

  const renderNavItem = (item: any, navigationId: string) => {
    const to = getTo(item.target);
    const hasSubNavs = item.subNavs && item.subNavs.length > 0;

    const previewAttrs = isClickToEditEnabled ? createPreviewAttributes({
      entryId: navigationId,
      modelApiId: 'Navigation',
      fieldApiId: 'label',
      componentChain: [
        { fieldApiId: 'navItems', instanceId: item.id }
      ]
    }) : {};

    return (
      <li key={item.id} className={`nav-item ${hasSubNavs ? 'has-dropdown' : ''}`}>
        <LocalizedLink
          to={to}
          className={isActive(to) ? "nav-link active" : "nav-link"}
          {...previewAttrs}
        >
          {item.label}
          {hasSubNavs && <span className="dropdown-caret">▼</span>}
        </LocalizedLink>
        {hasSubNavs && (
          <ul className="dropdown-menu">
            {item.subNavs.map((sub: any) => {
              const subTo = getTo(sub.subNavItems);
              const subPreviewAttrs = isClickToEditEnabled ? createPreviewAttributes({
                entryId: navigationId,
                modelApiId: 'Navigation',
                fieldApiId: 'subLabel',
                componentChain: [
                  { fieldApiId: 'navItems', instanceId: item.id },
                  { fieldApiId: 'subNavs', instanceId: sub.id }
                ]
              }) : {};

              return (
                <li key={sub.id}>
                  <LocalizedLink
                    to={subTo}
                    className="dropdown-link"
                    {...subPreviewAttrs}
                  >
                    {sub.subLabel}
                  </LocalizedLink>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      <nav className="navigation">
        <div className="nav-container">
          <LocalizedLink
            to="/"
            className="nav-logo"
            {...(cmsNav?.id ? createPreviewAttributes({ entryId: cmsNav.id, modelApiId: 'Navigation', fieldApiId: 'title' }) : {})}
          >
            {cmsNav?.logo && (
              <img
                src={cmsNav.logo.url}
                alt={cmsNav.logo.altText || cmsNav.title}
                className="nav-logo-img"
                {...(cmsNav?.id ? createPreviewAttributes({ entryId: cmsNav.id, modelApiId: 'Navigation', fieldApiId: 'logo' }) : {})}
              />
            )}
            {cmsNav?.title}
          </LocalizedLink>

          <button
            onClick={toggleClickToEdit}
            className={`preview-toggle-btn ${isClickToEditEnabled ? 'active' : ''}`}
            aria-label={isClickToEditEnabled ? 'Disable Click to Edit' : 'Enable Click to Edit'}
            title={isClickToEditEnabled ? 'Disable Click to Edit' : 'Enable Click to Edit'}
          >
            {isClickToEditEnabled ? '✏️ On' : '✏️ Off'}
          </button>

          <div className="locale-switcher">
            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value;
                // Get current path without the locale prefix
                const currentPath = location.pathname.replace(/^\/[a-z]{2}/, '') || '/';
                const newPath = `/${newLocale}${currentPath === '/' ? '' : currentPath}`;
                window.location.href = newPath; // Hard reload
              }}
              className="locale-select"
              aria-label="Select Language"
            >
              {availableLocales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          <div className="nav-search-wrapper">
            <Search />
          </div>
          <ul className="nav-links">
            {cmsNav && cmsNav.navItems ? (
              <>
                {cmsNav.navItems.map((item: any) => renderNavItem(item, cmsNav.id))}
              </>
            ) : (
              !cmsNav && (
                <>
                  <li>
                    <LocalizedLink to="/" className={isActive("/") ? "nav-link active" : "nav-link"}>
                      Home
                    </LocalizedLink>
                  </li>
                  <li>
                    <LocalizedLink to="/collection" className={isActive("/collection") ? "nav-link active" : "nav-link"}>
                      Collection
                    </LocalizedLink>
                  </li>
                </>
              )
            )}
            <li className="cart-nav-item">
              <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
                Cart ({cartCount})
              </button>
            </li>
          </ul>
        </div>
      </nav>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

