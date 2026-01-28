import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchProducts, type Product, fetchCategories, type Category, fetchTaxonomyNodes, type Taxonomy, fetchCollectionPageData, type CollectionPageData } from "../lib/hygraphClient";
import { ProductImage } from "../components/ProductImage";
import { TaxonomyBadge } from "../components/ui/TaxonomyBadge";
import { useLoading } from "../lib/LoadingContext";
import { useLocalization } from "../lib/LocalizationContext";
import "../styles/CollectionPage.css";

import { createPreviewAttributes } from "../lib/hygraphPreview";

export const CollectionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([]);
  const [pageData, setPageData] = useState<CollectionPageData | null>(null);
  const { setIsLoading } = useLoading();
  const { locale } = useLocalization();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [selectedTaxonomy, setSelectedTaxonomy] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    let cancelled = false;

    // Scroll to top on mount or category change
    window.scrollTo(0, 0);

    const load = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData, taxonomiesData, cmsPageData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchTaxonomyNodes(),
          fetchCollectionPageData(locale)
        ]);
        if (!cancelled) {
          setProducts(productsData);
          setCategories(categoriesData);
          setTaxonomies(taxonomiesData);
          setPageData(cmsPageData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [locale, categoryParam]);

  const filteredProducts = products
    .filter((p) => {
      const matchesStatus = filter === "all" || p.productStatus?.toLowerCase() === filter;
      const matchesTaxonomy = selectedTaxonomy === "all" || p.taxonomies?.some(t => t.value === selectedTaxonomy);
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !categoryParam || (p.productCategory && p.productCategory.some((c: any) => c.categorySlug === categoryParam));

      return matchesStatus && matchesSearch && matchesTaxonomy && matchesCategory;
    })
    .sort((a, b) => {
      const getPrice = (p: Product) => {
        return p.productPrice?.price || p.price || 0;
      };
      if (sortBy === "price-low") return getPrice(a) - getPrice(b);
      if (sortBy === "price-high") return getPrice(b) - getPrice(a);
      return 0; // Default newest
    });

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "instock", label: "In Stock" },
    { value: "outofstock", label: "Out of Stock" },
  ];

  // Helper to clear category selection
  const clearCategory = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("category");
    setSearchParams(params);
  };

  const handleCategoryClick = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (categoryParam === slug) {
      params.delete("category");
    } else {
      params.set("category", slug);
    }
    setSearchParams(params);
  };

  return (
    <div className="collection-page fade-in">
      <div className="page-header">
        <h1 {...(pageData?.id ? createPreviewAttributes({ entryId: pageData.id, modelApiId: 'CollectionPage', fieldApiId: 'title' }) : {})}>
          {pageData?.title || "Product Collection"}
        </h1>
        {pageData?.subtitle && (
          <p className="page-subtitle" {...createPreviewAttributes({ entryId: pageData.id, fieldApiId: 'subtitle' })}>
            {pageData.subtitle}
          </p>
        )}
        <div className="collection-controls">
          <input
            type="text"
            placeholder="Search in collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="collection-search-input"
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="collection-layout">
        <aside className="collection-sidebar">
          <h3>Status</h3>
          <div className="status-filters">
            {statusOptions.map((option) => (
              <label key={option.value} className="filter-label">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={filter === option.value}
                  onChange={() => setFilter(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>

          {taxonomies.length > 0 && (
            <div className="taxonomy-filters">
              <h3>Tags</h3>
              <div className="filter-group">
                <label className="filter-label">
                  <input
                    type="radio"
                    name="taxonomy"
                    value="all"
                    checked={selectedTaxonomy === "all"}
                    onChange={() => setSelectedTaxonomy("all")}
                  />
                  All Tags
                </label>
                {taxonomies.map((tax) => (
                  <label key={tax.value} className="filter-label">
                    <input
                      type="radio"
                      name="taxonomy"
                      value={tax.value}
                      checked={selectedTaxonomy === tax.value}
                      onChange={() => setSelectedTaxonomy(tax.value || "all")}
                    />
                    {tax.displayName}
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        <main className="collection-main">
          {filteredProducts.length === 0 ? (
            <p className="no-products">No products found matching your criteria.</p>
          ) : (
            <div className="collection-grid">
              {filteredProducts.map((product) => (
                <LocalizedLink
                  key={product.id}
                  to={`/product/${product.productSlug || product.id}`}
                  className="collection-card"
                  {...createPreviewAttributes({ entryId: product.id })}
                >
                  <div className="collection-image-wrapper">
                    <ProductImage
                      image={product.gallery?.[0]}
                      alt={product.title}
                      fallbackText={product.title}
                      {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'gallery' })}
                    />
                    {product.taxonomies && product.taxonomies.length > 0 && (
                      <div className="card-taxonomy-overlay">
                        {product.taxonomies.map((t, i) => (
                          <TaxonomyBadge key={t.value || i} label={t.displayName} value={t.value} clickable={false} />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="card-content">
                    <h2 {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'title' })}>{product.title}</h2>
                    {product.productPrice && (
                      <p
                        className="card-price"
                        {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'productPrice' })}
                      >
                        {product.productPrice.price}
                      </p>
                    )}
                    <div className="card-meta">
                      <span
                        className={`status-badge status-${product.productStatus?.toLowerCase() || "unknown"}`}
                        {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'productStatus' })}
                      >
                        {product.productStatus || "Available"}
                      </span>
                    </div>
                  </div>
                </LocalizedLink>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

