import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LocalizedLink } from "./LocalizedLink";
import "./Footer.css";
import { useLocalization } from "../lib/LocalizationContext";
import { fetchFooter, Footer as FooterType } from "../lib/hygraphClient";
import { usePreviewContext } from "../lib/PreviewContext";
import { createPreviewAttributes } from "../lib/hygraphPreview";

export const Footer: React.FC = () => {
  const { locale } = useLocalization();
  const [footer, setFooter] = useState<FooterType | null>(null);
  const { isClickToEditEnabled } = usePreviewContext();

  useEffect(() => {
    let isMounted = true;
    fetchFooter(locale).then(data => {
      if (isMounted) setFooter(data);
    }).catch(console.error);
    return () => { isMounted = false; };
  }, [locale]);

  // Helper to resolve URLs
  const getUrl = (target: any) => {
    if (!target) return '/';
    if (target.__typename === 'LandingPage') return target.lpSlug === 'home' ? '/' : `/${target.lpSlug}`;
    if (target.__typename === 'Product') return `/product/${target.productSlug}`;
    if (target.__typename === 'CollectionPage') return `/${target.cpSlug}`;
    if (target.__typename === 'BlogPage') return `/${target.bpSlug}`;
    if (target.__typename === 'PersonalisationPage') return `/${target.pageSlug}`;
    if (target.blogSlug) return `/blog/${target.blogSlug}`;
    return '/';
  };

  if (!footer) return null;

  const logoCta = footer.logoSection?.[0];
  const aboutCta = footer.aboutSection;

  // Helper for conditional preview attributes
  const getPreview = (attrs: any) => isClickToEditEnabled ? createPreviewAttributes(attrs) : {};

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo Section */}
        <div className="footer-section">
          {logoCta && (
            <>
              <div className="footer-logo-container" {...getPreview({ entryId: footer.id, modelApiId: 'Footer', fieldApiId: 'logoSection', componentChain: [{ fieldApiId: 'logoSection', instanceId: logoCta.id }] })}>
                {logoCta.ctaImage && logoCta.ctaImage.length > 0 && (
                  <img
                    src={logoCta.ctaImage[0].url}
                    alt={logoCta.ctaImage[0].altText || "Logo"}
                    className="footer-logo-img"
                  />
                )}
                <h3>{logoCta.ctaLabel}</h3>
              </div>
              <p {...getPreview({ entryId: footer.id, fieldApiId: 'ctaSubheading', componentChain: [{ fieldApiId: 'logoSection', instanceId: logoCta.id }] })}>
                {logoCta.ctaSubheading}
              </p>
            </>
          )}
        </div>

        {/* Quick Links */}
        {footer.quickLinks?.map((navItem) => (
          <div className="footer-section" key={navItem.id}>
            <h4 {...getPreview({ entryId: footer.id, fieldApiId: 'label', componentChain: [{ fieldApiId: 'quickLinks', instanceId: navItem.id }] })}>
              {navItem.label}
            </h4>
            <ul>
              {navItem.subNavs?.map((sub) => {
                // @ts-ignore
                let target: any = sub.subNavItems;
                if (Array.isArray(target)) {
                  target = target[0];
                }
                // Fallback to target field if it exists (SubNav2 legacy)
                if (!target && sub.target) {
                  target = Array.isArray(sub.target) ? sub.target[0] : sub.target;
                }

                return (
                  <li key={sub.id}>
                    <LocalizedLink
                      to={getUrl(target)}
                      {...getPreview({ entryId: footer.id, fieldApiId: 'subLabel', componentChain: [{ fieldApiId: 'quickLinks', instanceId: navItem.id }, { fieldApiId: 'subNavs', instanceId: sub.id }] })}
                    >
                      {sub.subLabel}
                    </LocalizedLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* About Section */}
        <div className="footer-section">
          {aboutCta && (
            <>
              <h4 {...getPreview({ entryId: footer.id, fieldApiId: 'ctaLabel', componentChain: [{ fieldApiId: 'aboutSection', instanceId: aboutCta.id }] })}>
                {aboutCta.ctaLabel}
              </h4>
              <p {...getPreview({ entryId: footer.id, fieldApiId: 'ctaSubheading', componentChain: [{ fieldApiId: 'aboutSection', instanceId: aboutCta.id }] })}>
                {aboutCta.ctaSubheading}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="footer-bottom">
        <p {...getPreview({ entryId: footer.id, modelApiId: 'Footer', fieldApiId: 'copyright' })}>
          {footer.copyright || `© ${new Date().getFullYear()} MicroGraph. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
};
