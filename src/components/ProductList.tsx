import React from "react";
import { fetchProducts, type Product } from "../lib/hygraphClient";

export const ProductList: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchProducts();
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p>Loading products…</p>;
  }

  if (error) {
    return <p className="error">Failed to load products: {error}</p>;
  }

  if (!products.length) {
    return <p>No products found. Check your Hygraph content.</p>;
  }

  return (
    <section className="product-grid">
      {products.map((product) => (
        <article key={product.id} className="product-card">
          <h2>{product.title}</h2>
          {product.shortDescription && (
            <p className="product-description">{product.shortDescription}</p>
          )}
          <p className="product-meta">
            <span className="pill">
              Status: {product.productStatus ?? "n/a"}
            </span>
            {product.productSlug && (
              <span className="pill pill-muted">/{product.productSlug}</span>
            )}
          </p>
        </article>
      ))}
    </section>
  );
};


