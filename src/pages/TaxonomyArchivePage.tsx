import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchContentByTaxonomy, type Product, type BlogPost } from "../lib/hygraphClient";
import { ProductImage } from "../components/ProductImage";
import { TaxonomyBadge } from "../components/ui/TaxonomyBadge";
import { useLoading } from "../lib/LoadingContext";
import { useLocalization } from "../lib/LocalizationContext";
import "../styles/TaxonomyArchivePage.css";

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
                                <div className="products-grid">
                                    {products.map((p) => (
                                        <LocalizedLink
                                            key={p.id}
                                            to={`/product/${p.productSlug || p.id}`}
                                            className="product-card"
                                            {...createPreviewAttributes({ entryId: p.id })}
                                        >
                                            <div className="image-wrapper">
                                                <ProductImage
                                                    image={p.gallery?.[0]}
                                                    alt={p.title}
                                                    fallbackText={p.title}
                                                    {...createPreviewAttributes({ entryId: p.id, fieldApiId: 'gallery' })}
                                                />
                                            </div>
                                            <div className="card-content">
                                                <h3 {...createPreviewAttributes({ entryId: p.id, fieldApiId: 'title' })}>{p.title}</h3>
                                                {p.productPrice && (
                                                    <p
                                                        className="price"
                                                        {...createPreviewAttributes({ entryId: p.id, fieldApiId: 'productPrice' })}
                                                    >
                                                        ${p.productPrice.price}
                                                    </p>
                                                )}
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
                                <div className="blog-posts-list">
                                    {blogPosts.map((post) => (
                                        <LocalizedLink
                                            key={post.id}
                                            to={`/blog/${post.blogSlug || post.id}`}
                                            className="blog-card"
                                            {...createPreviewAttributes({ entryId: post.id })}
                                        >
                                            <div className="blog-card-image">
                                                <ProductImage
                                                    image={post.feturedImage}
                                                    alt={post.title || ""}
                                                    fallbackText={post.title || ""}
                                                    {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'feturedImage' })}
                                                />
                                            </div>
                                            <div className="blog-card-info">
                                                <h3 {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'title' })}>{post.title}</h3>
                                                {post.excerpt && (
                                                    <p
                                                        className="excerpt"
                                                        {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'excerpt' })}
                                                    >
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                                {post.taxonomies && post.taxonomies.length > 0 && (
                                                    <div className="card-taxonomies">
                                                        {post.taxonomies.map((tax: any, i: number) => (
                                                            <TaxonomyBadge key={tax.value || i} label={tax.displayName} value={tax.value} clickable={false} />
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="read-more">Read Entry →</span>
                                            </div>
                                        </LocalizedLink>
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
