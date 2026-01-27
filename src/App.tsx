import React from "react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { PreviewWrapper } from "./components/PreviewWrapper";
import { HomePage } from "./pages/HomePage";
import { CollectionPage } from "./pages/CollectionPage";
import { ProductPage } from "./pages/ProductPage";
import { BlogPage } from "./pages/BlogPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { TaxonomyArchivePage } from "./pages/TaxonomyArchivePage";
import { PersonalizationShowcase } from "./pages/PersonalizationShowcase";
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, Outlet } from "react-router-dom";
import { CartProvider } from "./lib/CartContext";
import { PersonalizationProvider } from "./lib/PersonalizationContext";
import { LoadingProvider } from "./lib/LoadingContext";
import { LocalizationProvider, useLocalization, isValidLocale } from "./lib/LocalizationContext";

import { PreviewProvider } from "./lib/PreviewContext";

const LocaleWrapper: React.FC = () => {
  const { lang } = useParams<{ lang: string }>();
  const { setLocale } = useLocalization();

  React.useEffect(() => {
    if (lang && isValidLocale(lang)) {
      setLocale(lang);
    }
  }, [lang, setLocale]);

  if (!lang || !isValidLocale(lang)) {
    return <Navigate to="/en" replace />;
  }

  return (
    <>
      <Navigation />
      <main className="app-main">
        <PreviewWrapper>
          <Outlet />
        </PreviewWrapper>
      </main>
      <Footer />
    </>
  );
};

export const App: React.FC = () => (
  <Router>
    <LoadingProvider>
      <LocalizationProvider>
        <PersonalizationProvider>
          <CartProvider>
            <PreviewProvider>
              <Routes>
                <Route path="/" element={<Navigate to="/en" replace />} />
                <Route path="/:lang" element={<LocaleWrapper />}>
                  <Route index element={<HomePage />} />
                  <Route path="collection" element={<CollectionPage />} />
                  <Route path="product/:slug" element={<ProductPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="blog/:slug" element={<BlogPostPage />} />
                  <Route path="taxonomy/:value" element={<TaxonomyArchivePage />} />
                  <Route path="personalisation" element={<PersonalizationShowcase />} />
                </Route>
              </Routes>
            </PreviewProvider>
          </CartProvider>
        </PersonalizationProvider>
      </LocalizationProvider>
    </LoadingProvider>
  </Router>
);
