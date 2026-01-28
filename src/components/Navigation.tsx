import React, { useState, useEffect } from "react";
import { useLocalization } from "../lib/LocalizationContext";
import { PersonaSelector } from "./PersonaSelector";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search } from "./Search";
import { CartDrawer } from "./CartDrawer";
import { LocalizedLink } from "./LocalizedLink";
import { useCart } from "../lib/CartContext";
import { fetchNavigation, Navigation as NavType, getTaxonomyDisplayName } from "../lib/hygraphClient";
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

  const renderMegaMenu = (subNav: any) => {
    const posts = (subNav.target || []).filter((i: any) => i.__typename === 'BlogPost');

    if (posts.length === 0) return <div className="mega-menu-empty">No blog posts found.</div>;

    const taxonomyMap = new Map<string, { value: string, display: string, posts: any[] }>();
    posts.forEach((post: any) => {
      if (post.taxonomies && post.taxonomies.length > 0) {
        const tax = post.taxonomies[0];
        const taxValue = tax.value;
        if (!taxonomyMap.has(taxValue)) {
          taxonomyMap.set(taxValue, {
            value: taxValue,
            display: tax.displayName || getTaxonomyDisplayName(taxValue),
            posts: []
          });
        }
        taxonomyMap.get(taxValue)?.posts.push(post);
      }
    });

    const taxonomies = Array.from(taxonomyMap.values()).slice(0, 3);

    return (
      <div className="mega-menu-content">
        {taxonomies.map((tax, idx) => (
          <div key={idx} className="mega-menu-column">
            <LocalizedLink to={`/taxonomy/${tax.value}`} className="mega-menu-heading-link">
              <h4 className="mega-menu-heading">{tax.display}</h4>
            </LocalizedLink>
            <div className="mega-menu-posts">
              {tax.posts.slice(0, 2).map((post: any) => (
                <LocalizedLink key={post.id} to={`/blog/${post.blogSlug}`} className="mega-menu-post">
                  {post.feturedImage && (
                    <div className="mega-menu-image-wrapper">
                      <img src={post.feturedImage.url} alt={post.title} className="mega-menu-image" />
                    </div>
                  )}
                  <span className="mega-menu-post-title">{post.title}</span>
                </LocalizedLink>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderNavItem = (item: any, navigationId: string) => {
    const to = getTo(item.target);
    const manualSubNavsRaw = item.subNavs || [];

    // Detect Mega Menu (SubNav2)
    const megaMenuSubNav = manualSubNavsRaw.find((sub: any) =>
      sub.__typename === 'SubNav2' ||
      (sub.target && Array.isArray(sub.target) && sub.target.some((i: any) => i.__typename === 'BlogPost'))
    );
    const isMegaMenu = !!megaMenuSubNav;

    // Normalize manual items
    const manualItems = manualSubNavsRaw.map((sub: any) => {
      const target = sub.subNavItems;
      let children: any[] = [];
      if (target?.__typename === 'ProductCategory' && target.childrenCategories) {
        children = (Array.isArray(target.childrenCategories) ? target.childrenCategories : [target.childrenCategories]).filter(Boolean);
      }
      return {
        id: sub.id,
        label: sub.subLabel,
        target: target,
        blogPost: sub.target,
        childrenCategories: children,
        source: 'manual'
      };
    });

    // Purely dynamic categories
    let dynamicItems: any[] = [];
    if (item.target?.__typename === 'ProductCategory' && item.target.childrenCategories) {
      dynamicItems = (Array.isArray(item.target.childrenCategories) ? item.target.childrenCategories : [item.target.childrenCategories]).filter(Boolean).map((cat: any) => ({
        id: cat.id || cat.categorySlug,
        label: cat.categoryName,
        target: { __typename: 'ProductCategory', categorySlug: cat.categorySlug, childrenCategories: cat.childrenCategories },
        childrenCategories: cat.childrenCategories ? (Array.isArray(cat.childrenCategories) ? cat.childrenCategories : [cat.childrenCategories]) : [],
        source: 'dynamic'
      }));
    }

    const allSubItems = [...manualItems, ...dynamicItems];
    const hasDropdown = allSubItems.length > 0;

    const previewAttrs = isClickToEditEnabled ? createPreviewAttributes({
      entryId: navigationId,
      modelApiId: 'Navigation',
      fieldApiId: 'label',
      componentChain: [
        { fieldApiId: 'navItems', instanceId: item.id }
      ]
    }) : {};

    return (
      <li key={item.id || item.label} className={`nav-item ${hasDropdown || isMegaMenu ? 'has-dropdown' : ''} ${isMegaMenu ? 'mega-menu-parent' : ''}`}>
        <LocalizedLink
          to={to}
          className={isActive(to) ? "nav-link active" : "nav-link"}
          {...previewAttrs}
        >
          {item.label}
        </LocalizedLink>
        {(hasDropdown || isMegaMenu) && (
          <div className={`dropdown-menu ${isMegaMenu ? 'mega-menu-dropdown' : ''}`}>
            {isMegaMenu ? renderMegaMenu(megaMenuSubNav) : (
              <ul className="standard-dropdown">
                {allSubItems.map((subItem: any) => (
                  <RecursiveDropdownItem
                    key={subItem.id || subItem.label}
                    item={subItem}
                    navigationId={navigationId}
                    isManual={subItem.source === 'manual'}
                    parentCmsId={item.id}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </li>
    );
  };

  const RecursiveDropdownItem = ({ item, navigationId, isManual, parentCmsId }: { item: any, navigationId: string, isManual?: boolean, parentCmsId?: string }) => {
    const to = getTo(item.target);
    const rawChildren = item.childrenCategories || [];
    const normalizedChildren = rawChildren.map((cat: any) => ({
      id: cat.id || cat.categorySlug,
      label: cat.categoryName,
      target: { __typename: 'ProductCategory', categorySlug: cat.categorySlug, childrenCategories: cat.childrenCategories },
      childrenCategories: cat.childrenCategories ? (Array.isArray(cat.childrenCategories) ? cat.childrenCategories : [cat.childrenCategories]) : [],
      source: 'dynamic'
    }));

    const hasChildren = normalizedChildren.length > 0;

    let itemPreviewAttrs = {};
    if (isManual && isClickToEditEnabled && parentCmsId) {
      itemPreviewAttrs = createPreviewAttributes({
        entryId: navigationId,
        modelApiId: 'Navigation',
        fieldApiId: 'subLabel',
        componentChain: [
          { fieldApiId: 'navItems', instanceId: parentCmsId },
          { fieldApiId: 'subNavs', instanceId: item.id }
        ]
      });
    }

    return (
      <li className={`nav-item ${hasChildren ? 'has-dropdown' : ''}`}>
        <LocalizedLink to={to} className="dropdown-link" {...itemPreviewAttrs}>
          {item.label}
        </LocalizedLink>
        {hasChildren && (
          <ul className="dropdown-menu">
            {normalizedChildren.map((child: any) => (
              <RecursiveDropdownItem
                key={child.id || child.label}
                item={child}
                navigationId={navigationId}
              />
            ))}
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

          <div className="preview-toggle-wrapper">
            <button
              onClick={toggleClickToEdit}
              className={`preview-toggle-btn ${isClickToEditEnabled ? 'active' : ''}`}
            >
              {isClickToEditEnabled ? '✏️ On' : '✏️ Off'}
            </button>
            <span className="preview-tooltip">
              {isClickToEditEnabled ? 'Disable' : 'Enable'} Click To Edit Mode
            </span>
          </div>

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

