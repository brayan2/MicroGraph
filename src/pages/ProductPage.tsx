import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchProductWithVariants, fetchProductsByCategory, type Product } from "../lib/hygraphClient";
import { ProductImage } from "../components/ProductImage";
import { RichTextRenderer } from "../components/RichTextRenderer";
import { VariantSelector } from "../components/VariantSelector";
import { TaxonomyBadge } from "../components/ui/TaxonomyBadge";
import { ProductReview } from "../components/ProductReview";
import { useCart } from "../lib/CartContext";
import { usePersonalization } from "../lib/PersonalizationContext";
import { useLoading } from "../lib/LoadingContext";
import { useLocalization } from "../lib/LocalizationContext";
import "../styles/ProductPage.css";
import { createPreviewAttributes } from '../lib/hygraphPreview';


export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { setIsLoading } = useLoading();
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { selectedSegment } = usePersonalization();
  const { locale } = useLocalization();

  React.useEffect(() => {
    if (!slug) {
      setError("Product slug is required");
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProductWithVariants(slug, selectedSegment?.name);
        if (!cancelled) {
          if (data) {
            if (data.inventoryVariants && data.inventoryVariants.length > 0) {
              setSelectedVariantId(data.inventoryVariants[0].id);
            }

            // Fallback for related products if empty
            if ((!data.relatedProducts || !data.relatedProducts.product || data.relatedProducts.product.length === 0) && data.productCategory && data.productCategory.length > 0) {
              try {
                const fallback = await fetchProductsByCategory(data.productCategory[0].categorySlug, data.id);
                if (fallback.length > 0) {
                  if (!data.relatedProducts) {
                    data.relatedProducts = { product: [] };
                  }
                  data.relatedProducts.product = fallback;
                }
              } catch (e) {
                console.warn("Failed to fetch related products fallback", e);
              }
            }

            setProduct(data);
          } else {
            setError("Product not found");
          }
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
  }, [slug, selectedSegment, locale]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1, selectedVariantId);
    }
  };

  // We remove the old local loading check as the global loader handles it

  if (error || !product) {
    return (
      <div className="product-page">
        <p className="error">{error || "Product not found"}</p>
        <LocalizedLink to="/collection" className="btn btn-primary">
          Back to Collection
        </LocalizedLink>
      </div>
    );
  }

  const mainImage = product.gallery?.[selectedImageIndex] || product.gallery?.[0];

  const getDisplayPrice = () => {
    // 1. Try first variant price
    const vPrice = product.variants?.[0]?.productPrice?.price;
    if (typeof vPrice === 'number' && vPrice > 0) return vPrice;

    // 2. Try main product price
    const mPrice = product.productPrice?.price;
    if (typeof mPrice === 'number' && mPrice > 0) return mPrice;

    // 3. Try legacy price field if it exists
    const lPrice = product.price;
    if (typeof lPrice === 'number' && lPrice > 0) return lPrice;

    return '0.00';
  };

  return (
    <div className="product-page fade-in">
      <LocalizedLink to="/collection" className="back-link">
        ← Back to Collection
      </LocalizedLink>

      <div className="product-container">
        {/* Left Column: Main Image + Categories */}
        <div className="product-left-col">
          <div className="main-image-wrapper">
            {mainImage && (
              <ProductImage
                image={mainImage}
                alt={mainImage.altText || product.title}
                className="main-product-image"
                fallbackText={product.title}
                {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'gallery' })}
              />
            )}
          </div>

          {/* Categories/Tags below main image */}
          <div className="product-meta-below">
            {product.productCategory && product.productCategory.length > 0 && (
              <div className="product-categories">
                <h4>Categories</h4>
                <div className="category-tags">
                  {product.productCategory.map((cat: any) => (
                    <span
                      key={cat.id}
                      className="category-tag"
                      {...createPreviewAttributes({ entryId: cat.id, fieldApiId: 'categoryName' })}
                    >
                      {cat.categoryName || cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.productAttributes && (
              <div
                className="product-attributes-section"
                {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'productAttributes' })}
              >
                <h4>Attributes</h4>
                <div className="product-tags">
                  {product.productAttributes.attributeKey.map((tag: string, i: number) => (
                    <span key={i} className="attribute-tag">{tag.trim()}</span>
                  ))}
                </div>
              </div>

            )}

            {product.taxonomies && product.taxonomies.length > 0 && (
              <div className="product-taxonomies-section">
                <h4>Tags</h4>
                <div className="taxonomy-badges">
                  {product.taxonomies.map((tax, i) => (
                    <TaxonomyBadge key={tax.value || i} label={tax.displayName} value={tax.value} />
                  ))}
                </div>
              </div>
            )}

            {product.productSku && (
              <p
                className="product-sku"
                {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'productSku' })}
              >
                SKU: {product.productSku}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Details + Gallery Slider */}
        <div className="product-right-col">
          {/* Header */}
          <div className="product-header-right">
            <h1 {...createPreviewAttributes({ entryId: product.id, modelApiId: 'Product', fieldApiId: 'title' })}>
              {product.variants?.[0]?.title || product.title}
            </h1>
            {product.productStatus && (
              <span
                className={`status-badge status-${product.productStatus.toLowerCase()}`}
                {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'productStatus' })}
              >
                {product.productStatus}
              </span>
            )}
          </div>

          {/* Gallery Thumbnails Slider */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="gallery-slider">
              <div className="gallery-thumbnails">
                {product.gallery.map((image, idx) => (
                  <button
                    key={`${image.id}-${idx}`}
                    className={`thumbnail-btn ${idx === selectedImageIndex ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <ProductImage
                      image={image}
                      alt={image.altText || `${product.title} ${idx + 1}`}
                      className="thumbnail-image"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personalization/Shuffle Badge */}
          {product.variants?.[0] ? (
            <div className="personalization-badge">
              ✨ Personalized for <strong>{selectedSegment?.name}</strong>
            </div>
          ) : product.shuffle && (
            <div className="shuffle-badge">
              🔀 Shuffle Mode Active
            </div>
          )}

          {/* Short Description */}
          {(product.variants?.[0]?.shortDescription || product.shortDescription) && (
            <p
              className="product-short-description"
              {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'shortDescription' })}
            >
              {product.variants?.[0]?.shortDescription || product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="price-section">
            <span
              className="current-price"
              {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'productPrice' })}
            >
              ${getDisplayPrice()}
            </span>
          </div>

          {/* Seller */}
          {product.productSeller && (
            <div
              className="seller-info"
              {...createPreviewAttributes({ entryId: product.productSeller.id })}
            >
              <span className="seller-label">Sold by:</span>
              <span
                className="seller-name"
                {...createPreviewAttributes({ entryId: product.productSeller.id, fieldApiId: 'sellerName' })}
              >
                {product.productSeller.sellerName}
              </span>
            </div>
          )}

          {/* Inventory Variants */}
          {product.inventoryVariants && product.inventoryVariants.length > 0 && (
            <VariantSelector
              variants={product.inventoryVariants}
              selectedVariantId={selectedVariantId}
              onSelect={setSelectedVariantId}
            />
          )}

          {/* Product Variants (Clothes/Shoes) */}
          {product.productVariants && product.productVariants.length > 0 && (
            <div className="specialized-variants">
              <h4>Available Options</h4>
              <div className="variant-badges">
                {product.productVariants.map((v, i) => (
                  <div
                    key={v.id || i}
                    className="variant-badge-item"
                    {...createPreviewAttributes({ entryId: v.id })}
                  >
                    {v.__typename === 'ClothesVariants' && (
                      <span
                        className={`pill color-${v.clothesColor}`}
                        {...createPreviewAttributes({
                          entryId: product.id,
                          fieldApiId: 'label',
                          componentChain: [{ fieldApiId: 'variants', instanceId: v.id }]
                        })}
                      >
                        {v.label} ({v.clothesSize?.toUpperCase()})
                      </span>
                    )}
                    {v.__typename === 'ShoesVariant' && (
                      <span
                        className="pill shoes"
                        {...createPreviewAttributes({
                          entryId: product.id,
                          fieldApiId: 'label',
                          componentChain: [{ fieldApiId: 'variants', instanceId: v.id }]
                        })}
                      >
                        {v.label} ({v.shoesSize})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="product-actions">
            <button
              className="btn btn-primary btn-large"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
          </div>

          {/* Full Description */}
          {product.productDescription && (
            <div
              className="product-description-section"
              {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'productDescription', richTextFormat: 'html' })}
            >
              <h3>Product Description</h3>
              <RichTextRenderer content={product.productDescription} />
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ProductReview
        reviews={[...(product.reviews || []), ...(product.externalReviews || [])]}
        productId={product.id}
      />

      {/* Related Products */}
      {
        product.relatedProducts?.product && product.relatedProducts.product.length > 0 && (
          <div
            className="related-products-section"
            id="related-products"
            {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'relatedProducts' })}
          >
            <hr className="section-divider" />
            <h2>Related Products</h2>
            <div className="related-products-grid">
              {product.relatedProducts.product.map(rp => (
                <LocalizedLink
                  key={rp.id}
                  to={`/product/${rp.productSlug || rp.id}`}
                  className="related-product-card"
                  {...createPreviewAttributes({ entryId: rp.id })}
                >
                  <div className="rp-image-wrapper">
                    <ProductImage image={rp.gallery?.[0]} alt={rp.title} fallbackText={rp.title} />
                  </div>
                  <h3 {...createPreviewAttributes({ entryId: rp.id, fieldApiId: 'title' })}>{rp.title}</h3>
                  {rp.productPrice?.price && (
                    <p
                      className="rp-price"
                      {...createPreviewAttributes({ entryId: rp.id, fieldApiId: 'productPrice' })}
                    >
                      ${rp.productPrice.price}
                    </p>
                  )}
                </LocalizedLink>
              ))}
            </div>
          </div>
        )
      }
    </div >
  );
};
