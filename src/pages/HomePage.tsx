import React from "react";
import { Link } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchFeaturedProducts, fetchLandingPage, applyPersonalization, type Product, type LandingPage } from "../lib/hygraphClient";
import { usePersonalization } from "../lib/PersonalizationContext";
import { useLocalization } from "../lib/LocalizationContext";
import { ProductImage } from "../components/ProductImage";
import { BlockSelector } from "../components/BlockSelector";
import { useLoading } from "../lib/LoadingContext";
import "../styles/HomePage.css";

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = React.useState<Product[]>([]);
  const [landingPage, setLandingPage] = React.useState<LandingPage | null>(null);
  const { setIsLoading } = useLoading();
  const { selectedSegment } = usePersonalization();
  const { locale } = useLocalization();

  React.useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [products, lp] = await Promise.all([
          fetchFeaturedProducts(6),
          fetchLandingPage('home')
        ]);
        if (!cancelled) {
          const personalizedProducts = products.map(p => applyPersonalization(p, selectedSegment?.id));
          setFeaturedProducts(personalizedProducts);
          setLandingPage(lp);
        }
      } catch (err) {
        console.error("Failed to load homepage data", err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [selectedSegment, locale]);

  return (
    <div className="homepage fade-in">
      {landingPage?.sections && landingPage.sections.length > 0 ? (
        <BlockSelector blocks={landingPage.sections} entryId={landingPage.id} />
      ) : (
        <>
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <h1 className="hero-title">Welcome to MicroGraph</h1>
              <p className="hero-subtitle">
                Discover amazing products powered by Hygraph CMS
              </p>
              <div className="hero-cta">
                <LocalizedLink to="/collection" className="btn btn-primary">
                  Shop Now
                </LocalizedLink>
                <LocalizedLink to="/blog" className="btn btn-secondary">
                  Read Blog
                </LocalizedLink>
              </div>
            </div>
          </section>





          {/* Fallback CTA if not on Landing Page */}
          {!landingPage && (
            <section className="cta-section">
              <div className="section-container">
                <h2 className="cta-title">Ready to get started?</h2>
                <p className="cta-subtitle">
                  Explore our collection of amazing products today
                </p>
                <LocalizedLink to="/collection" className="btn btn-primary btn-large">
                  Browse Collection
                </LocalizedLink>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

