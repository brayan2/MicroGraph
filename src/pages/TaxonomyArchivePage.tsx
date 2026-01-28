import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchContentByTaxonomy, type Product, type BlogPost } from "../lib/hygraphClient";
import { ProductImage } from "../components/ProductImage";
import { TaxonomyBadge } from "../components/ui/TaxonomyBadge";
import { useLoading } from "../lib/LoadingContext";
import { useLocalization } from "../lib/LocalizationContext";
import "../styles/TaxonomyArchivePage.css";
import "../styles/Blocks.css";

import { createPreviewAttributes } from "../lib/hygraphPreview";

export const TaxonomyArchivePage: React.FC = () => {
    const { value } = useParams<{ value: string }>();
    const [products, setProducts] = useState<Product[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const { setIsLoading } = useLoading();
    const [error, setError] = useState<string | null>(null);
    const { locale } = useLocalization();

    // Transform PascalCase to Human Readable (BestSeller -> Best Seller)
    const displayName = value ? value.replace(/([A-Z])/g, " $1").trim() : "";

    useEffect(() => {
        if (!value) return;

        const loadContent = async () => {
            setIsLoading(true);
            try {
                const data = await fetchContentByTaxonomy(value);
                setProducts(data.products);
                setBlogPosts(data.blogPosts);
            } catch (err) {
                setError("Failed to load content for this tag.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
    }, [value, locale]);

    // Global loader handles the loading screen

    return (
        <div className="archive-page fade-in">
            <div className="container">
                <header className="archive-header">
                    <LocalizedLink to="/collection" className="back-link">← Back to Collection</LocalizedLink>
                    <div className="archive-title-group">
                        <span className="archive-label">Tag Archive</span>
                        <h1>{displayName}</h1>
                    </div>
                </header>

                {products.length === 0 && blogPosts.length === 0 ? (
                    <div className="no-results">
                        <p>No products or posts found for this collection yet.</p>
                        <LocalizedLink to="/" className="btn btn-primary">Go Home</LocalizedLink>
                    </div>
                ) : (
                    <>
                        {products.length > 0 && (
                            <section className="archive-section">
                                <div className="section-header">
                                    <h2>Featured Products</h2>
                                    <span className="count">{products.length} Items</span>
                                </div>
                                <div className="featured-grid">
                                    {products.map((p) => (
                                        <LocalizedLink
                                            key={p.id}
                                            to={`/product/${p.productSlug || p.id}`}
                                            className="collection-card"
                                            {...createPreviewAttributes({ entryId: p.id })}
                                        >
                                            <div className="collection-image-wrapper">
                                                <ProductImage
                                                    image={p.gallery?.[0]}
                                                    alt={p.title}
                                                    fallbackText={p.title}
                                                    {...createPreviewAttributes({ entryId: p.id, fieldApiId: 'gallery' })}
                                                />
                                                {p.taxonomies && p.taxonomies.length > 0 && (
                                                    <div className="card-taxonomy-overlay">
                                                        {p.taxonomies.map((t: any, i: number) => (
                                                            <TaxonomyBadge key={t.value || i} label={t.displayName} value={t.value} clickable={false} />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="card-content">
                                                <h3 {...createPreviewAttributes({ entryId: p.id, fieldApiId: 'title' })}>{p.title}</h3>
                                                {p.productPrice && (
                                                    <p
                                                        className="card-price"
                                                        {...createPreviewAttributes({ entryId: p.id, fieldApiId: 'productPrice' })}
                                                    >
                                                        {p.productPrice.price}
                                                    </p>
                                                )}
                                                <div className="card-meta">
                                                    <span className={`status-badge status-${p.productStatus?.toLowerCase() || 'unknown'}`}>
                                                        {p.productStatus || 'Available'}
                                                    </span>
                                                </div>
                                            </div>
                                        </LocalizedLink>
                                    ))}
                                </div>
                            </section>
                        )}

                        {blogPosts.length > 0 && (
                            <section className="archive-section blog-archive">
                                <div className="section-header">
                                    <h2>From the Blog</h2>
                                    <span className="count">{blogPosts.length} Posts</span>
                                </div>
                                <div className="blog-grid">
                                    {blogPosts.map((post) => (
                                        <div
                                            key={post.id}
                                            className="blog-card"
                                            {...createPreviewAttributes({ entryId: post.id })}
                                        >
                                            {post.feturedImage && (
                                                <LocalizedLink to={`/blog/${post.blogSlug || post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                                    <div className="blog-image-wrapper">
                                                        <ProductImage
                                                            image={post.feturedImage}
                                                            alt={post.title || ""}
                                                            fallbackText={post.title || ""}
                                                            {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'feturedImage' })}
                                                        />
                                                    </div>
                                                </LocalizedLink>
                                            )}
                                            <div className="blog-content">
                                                <LocalizedLink to={`/blog/${post.blogSlug || post.id}`} style={{ display: 'block', textDecoration: 'none' }}>
                                                    <h3 {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'title' })}>{post.title}</h3>
                                                </LocalizedLink>
                                                {post.excerpt && (
                                                    <p
                                                        className="blog-excerpt"
                                                        {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'excerpt' })}
                                                    >
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                                {post.taxonomies && post.taxonomies.length > 0 && (
                                                    <div className="blog-card-taxonomies">
                                                        {post.taxonomies.map((tax: any, i: number) => (
                                                            <TaxonomyBadge key={tax.value || i} label={tax.displayName} value={tax.value} clickable={true} />
                                                        ))}
                                                    </div>
                                                )}
                                                {(post.blogTime || post.createdAt) && (
                                                    <p className="blog-date">
                                                        {new Date(post.blogTime || post.createdAt || "").toLocaleDateString("en-US", {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric"
                                                        })}
                                                    </p>
                                                )}
                                                <LocalizedLink to={`/blog/${post.blogSlug || post.id}`} style={{ textDecoration: 'none' }}>
                                                    <span className="read-more">Read Entry →</span>
                                                </LocalizedLink>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
