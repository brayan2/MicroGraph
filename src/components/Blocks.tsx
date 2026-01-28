import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    fetchFeaturedProducts,
    Product,
    applyPersonalization,
    Cta as CtaType,
    BlogTeasersSection as BlogTeasersType,
    ProductGrid as ProductGridType,
    RemoteReviewsSection as RemoteReviewsType
} from '../lib/hygraphClient';
import { ProductImage } from './ProductImage';
import { TaxonomyBadge } from './ui/TaxonomyBadge';
import { HeroSlider } from './HeroSlider';
import { LocalizedLink } from './LocalizedLink';
import { usePersonalization } from '../lib/PersonalizationContext';
import { createPreviewAttributes } from '../lib/hygraphPreview';
import '../styles/Blocks.css';

const getButtonCtaUrl = (button: import('../lib/hygraphClient').ButtonCta) => {
    const target = button.buttonTarget;
    if (!target) return '#';

    switch (target.__typename) {
        case 'LandingPage':
            return `/${(target as any).lpSlug === 'home' ? '' : (target as any).lpSlug}`;
        case 'Product':
            return `/product/${(target as any).productSlug}`;
        case 'BlogPage':
            return `/${(target as any).bpSlug}`;
        case 'CollectionPage':
            return `/${(target as any).cpSlug}`;
        case 'PersonalisationPage':
            return `/${(target as any).pageSlug}`;
        default:
            return '#';
    }
};

export const CtaSection: React.FC<{ data: CtaType; entryId: string }> = ({ data, entryId }) => {
    // Basic heuristic: if it has "Welcome" in title, treat as Hero styled
    const isHero = data.ctaLabel?.toLowerCase().includes('welcome');

    const componentChain = [{ fieldApiId: 'sections', instanceId: data.id }];

    return (
        <section className={isHero ? "hero-section" : "cta-section"}>
            <div className={isHero ? "hero-content" : "section-container"}>
                {isHero ? (
                    <>
                        <h1
                            className="hero-title"
                            {...createPreviewAttributes({ entryId, modelApiId: 'LandingPage', fieldApiId: 'ctaLabel', componentChain })}
                        >
                            {data.ctaLabel}
                        </h1>
                        {data.ctaSubheading && (
                            <p
                                className="hero-subtitle"
                                {...createPreviewAttributes({
                                    entryId,
                                    fieldApiId: 'ctaSubheading',
                                    componentChain
                                })}
                            >
                                {data.ctaSubheading}
                            </p>
                        )}
                        <div className="hero-cta">
                            {data.buttonDetails?.map((button, idx) => (
                                <LocalizedLink
                                    key={button.id}
                                    to={getButtonCtaUrl(button)}
                                    className={idx === 0 ? "btn btn-primary" : "btn btn-secondary"}
                                    {...createPreviewAttributes({
                                        entryId,
                                        fieldApiId: 'buttonLabel',
                                        componentChain: [...componentChain, { fieldApiId: 'buttonDetails', instanceId: button.id }]
                                    })}
                                >
                                    {button.buttonLabel}
                                </LocalizedLink>
                            ))}
                        </div>
                    </>
                ) : (
                    <>
                        <h2
                            className="cta-title"
                            {...createPreviewAttributes({ entryId, modelApiId: 'LandingPage', fieldApiId: 'ctaLabel', componentChain })}
                        >
                            {data.ctaLabel}
                        </h2>
                        {data.ctaSubheading && (
                            <p
                                className="cta-subtitle"
                                {...createPreviewAttributes({ entryId, fieldApiId: 'ctaSubheading', componentChain })}
                            >
                                {data.ctaSubheading}
                            </p>
                        )}
                        <div className="cta-buttons">
                            {data.buttonDetails?.map((button) => (
                                <LocalizedLink
                                    key={button.id}
                                    to={getButtonCtaUrl(button)}
                                    className="btn btn-primary btn-large"
                                    {...createPreviewAttributes({
                                        entryId,
                                        fieldApiId: 'buttonLabel',
                                        componentChain: [...componentChain, { fieldApiId: 'buttonDetails', instanceId: button.id }]
                                    })}
                                >
                                    {button.buttonLabel}
                                </LocalizedLink>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export const ProductGridSection: React.FC<{ data: ProductGridType; entryId: string }> = ({ data, entryId }) => {
    const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);
    const { selectedSegment } = usePersonalization();

    const componentChain = [{ fieldApiId: 'sections', instanceId: data.id }];

    const baseProducts = (data.products && data.products.length > 0)
        ? data.products
        : fallbackProducts;

    const displayProducts = baseProducts.map(p => applyPersonalization(p, selectedSegment?.id));

    useEffect(() => {
        if (!data.products || data.products.length === 0) {
            fetchFeaturedProducts(4).then(setFallbackProducts).catch(console.error);
        }
    }, [data.products]);

    return (
        <section className="featured-section">
            <div className="section-container">
                {data.heading && (
                    <h2
                        className="section-title"
                        {...createPreviewAttributes({ entryId, modelApiId: 'LandingPage', fieldApiId: 'heading', componentChain })}
                    >
                        {data.heading}
                    </h2>
                )}
                {displayProducts.length > 0 ? (
                    <div className="featured-grid">
                        {displayProducts.map((product) => (
                            <LocalizedLink
                                key={product.id}
                                to={`/product/${product.productSlug}`}
                                className="collection-card"
                                {...createPreviewAttributes({ entryId: product.id, modelApiId: 'Product' })}
                            >
                                <div className="collection-image-wrapper">
                                    <ProductImage image={product.gallery?.[0]} alt={product.title} />
                                    {product.taxonomies && product.taxonomies.length > 0 && (
                                        <div className="card-taxonomy-overlay">
                                            {product.taxonomies.map((t, i) => (
                                                <TaxonomyBadge key={t.value || i} label={t.displayName} value={t.value} clickable={false} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="card-content">
                                    <h2 {...createPreviewAttributes({ entryId: product.id, modelApiId: 'Product', fieldApiId: 'title' })}>{product.title}</h2>
                                    {product.productPrice && (
                                        <p className="card-price">
                                            {product.productPrice.price}
                                        </p>
                                    )}
                                    <div className="card-meta">
                                        <span className={`status-badge status-${product.productStatus?.toLowerCase() || 'unknown'}`}>
                                            {product.productStatus || 'Available'}
                                        </span>
                                    </div>
                                </div>
                            </LocalizedLink>
                        ))}
                    </div>
                ) : (
                    <p>Loading products...</p>
                )}
            </div>
        </section>
    );
};

export const BlogTeasers: React.FC<{ data: BlogTeasersType; entryId: string }> = ({ data, entryId }) => {
    const { selectedSegment } = usePersonalization();
    const blogPosts = (data.blogPost || []).map(post => applyPersonalization(post, selectedSegment?.id));
    const componentChain = [{ fieldApiId: 'sections', instanceId: data.id }];

    return (
        <section className="blog-teasers-section">
            <div className="section-container">
                {data.heading && (
                    <h2
                        className="section-title"
                        {...createPreviewAttributes({ entryId, modelApiId: 'LandingPage', fieldApiId: 'heading', componentChain })}
                    >
                        {data.heading}
                    </h2>
                )}
                <div className="blog-grid">
                    {blogPosts.map((post) => (
                        <div
                            key={post.id}
                            className="blog-card"
                            {...createPreviewAttributes({ entryId: post.id, modelApiId: 'BlogPost' })}
                        >
                            {post.feturedImage && (
                                <LocalizedLink to={`/blog/${post.blogSlug}`} style={{ display: 'block', textDecoration: 'none' }}>
                                    <div className="blog-image-wrapper">
                                        <img src={post.feturedImage.url} alt={post.title || 'Blog post'} loading="lazy" />
                                    </div>
                                </LocalizedLink>
                            )}
                            <div className="blog-content">
                                <LocalizedLink to={`/blog/${post.blogSlug}`} style={{ display: 'block', textDecoration: 'none' }}>
                                    <h2 {...createPreviewAttributes({ entryId: post.id, modelApiId: 'BlogPost', fieldApiId: 'title' })}>{post.title}</h2>
                                </LocalizedLink>
                                <p className="blog-excerpt" {...createPreviewAttributes({ entryId: post.id, fieldApiId: 'excerpt' })}>{post.excerpt}</p>
                                {post.taxonomies && post.taxonomies.length > 0 && (
                                    <div className="blog-card-taxonomies">
                                        {post.taxonomies.map((t, i) => (
                                            <TaxonomyBadge key={t.value || i} label={t.displayName} value={t.value} clickable={true} />
                                        ))}
                                    </div>
                                )}
                                {(post.createdAt) && (
                                    <p className="blog-date">{new Date(post.createdAt).toLocaleDateString()}</p>
                                )}
                                <LocalizedLink to={`/blog/${post.blogSlug}`} style={{ textDecoration: 'none' }}>
                                    <span className="read-more">Read more →</span>
                                </LocalizedLink>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const RemoteReviews: React.FC<{ data: RemoteReviewsType; entryId: string }> = ({ data, entryId }) => {
    const componentChain = [{ fieldApiId: 'sections', instanceId: data.id }];
    return (
        <section className="remote-reviews-block">
            <div className="section-container">
                {data.heading && (
                    <h2
                        className="section-title"
                        {...createPreviewAttributes({ entryId, modelApiId: 'LandingPage', fieldApiId: 'heading', componentChain })}
                    >
                        {data.heading}
                    </h2>
                )}
                <div className="reviews-placeholder">
                    <blockquote>"Exceptional quality and minimalist perfection."</blockquote>
                    <cite>— Master Enthusiast</cite>
                </div>
            </div>
        </section>
    );
};

export const GridSection: React.FC<{ data: import('../lib/hygraphClient').Grid; entryId: string }> = ({ data, entryId }) => {

    const { selectedSegment } = usePersonalization();
    const componentChain = [{ fieldApiId: 'sections', instanceId: data.id }];

    // Apply personalization if applicable (mostly for products/blogs)
    const gridItems = (data.grid || []).map(item => {
        if (item.__typename === 'Product' || item.__typename === 'BlogPost') {
            return applyPersonalization(item, selectedSegment?.id);
        }
        return item;
    });

    return (
        <section className="grid-section">
            <div className="section-container">
                {data.title && (
                    <h2
                        className="section-title"
                        {...createPreviewAttributes({ entryId, modelApiId: 'LandingPage', fieldApiId: 'title', componentChain })}
                    >
                        {data.title}
                    </h2>
                )}
                <div className="grid-layout">
                    {gridItems.map((item) => {
                        switch (item.__typename) {
                            case 'Product':
                                return (
                                    <LocalizedLink
                                        key={item.id}
                                        to={`/product/${item.productSlug}`}
                                        className="collection-card"
                                        {...createPreviewAttributes({ entryId: item.id, modelApiId: 'Product' })}
                                    >
                                        <div className="collection-image-wrapper">
                                            <ProductImage image={item.gallery?.[0]} alt={item.title} />
                                            {item.taxonomies && item.taxonomies.length > 0 && (
                                                <div className="card-taxonomy-overlay">
                                                    {item.taxonomies.map((t, i) => (
                                                        <TaxonomyBadge key={t.value || i} label={t.displayName} value={t.value} clickable={false} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <h2 {...createPreviewAttributes({ entryId: item.id, modelApiId: 'Product', fieldApiId: 'title' })}>{item.title}</h2>
                                            {item.productPrice && (
                                                <p className="card-price">{item.productPrice.price}</p>
                                            )}
                                            <div className="card-meta">
                                                <span className={`status-badge status-${item.productStatus?.toLowerCase() || 'unknown'}`}>
                                                    {item.productStatus || 'Available'}
                                                </span>
                                            </div>
                                        </div>
                                    </LocalizedLink>
                                );
                            case 'BlogPost':
                                return (
                                    <div
                                        key={item.id}
                                        className="blog-card"
                                        {...createPreviewAttributes({ entryId: item.id, modelApiId: 'BlogPost' })}
                                    >
                                        {item.feturedImage && (
                                            <LocalizedLink to={`/blog/${item.blogSlug}`} style={{ display: 'block', textDecoration: 'none' }}>
                                                <div className="blog-image-wrapper">
                                                    <img src={item.feturedImage.url} alt={item.title || 'Blog post'} loading="lazy" />
                                                </div>
                                            </LocalizedLink>
                                        )}
                                        <div className="blog-content">
                                            <LocalizedLink to={`/blog/${item.blogSlug}`} style={{ display: 'block', textDecoration: 'none' }}>
                                                <h2 {...createPreviewAttributes({ entryId: item.id, modelApiId: 'BlogPost', fieldApiId: 'title' })}>{item.title}</h2>
                                            </LocalizedLink>
                                            <p className="blog-excerpt">{item.excerpt}</p>
                                            {item.taxonomies && item.taxonomies.length > 0 && (
                                                <div className="blog-card-taxonomies">
                                                    {item.taxonomies.map((tax, i) => (
                                                        <TaxonomyBadge key={tax.value || i} label={tax.displayName} value={tax.value} clickable={true} />
                                                    ))}
                                                </div>
                                            )}
                                            {(item.createdAt) && (
                                                <p className="blog-date">{new Date(item.createdAt).toLocaleDateString()}</p>
                                            )}
                                            <LocalizedLink to={`/blog/${item.blogSlug}`} style={{ textDecoration: 'none' }}>
                                                <span className="read-more">Read more →</span>
                                            </LocalizedLink>
                                        </div>
                                    </div>
                                );
                            case 'BlogAuthor':
                                return (
                                    <div key={item.id} className="author-card" {...createPreviewAttributes({ entryId: item.id, modelApiId: 'BlogAuthor' })}>
                                        {item.authorImage && (
                                            <img src={item.authorImage.url} alt={item.authorName} className="author-image" />
                                        )}
                                        <h3 {...createPreviewAttributes({ entryId: item.id, modelApiId: 'BlogAuthor', fieldApiId: 'authorName' })}>{item.authorName}</h3>
                                        <p>{item.authorAbout}</p>
                                    </div>
                                );
                            case 'ProductSeller':
                                return (
                                    <div key={item.id} className="seller-card" {...createPreviewAttributes({ entryId: item.id, modelApiId: 'ProductSeller' })}>
                                        {item.sellerImage && (
                                            <img src={item.sellerImage.url} alt={item.sellerName} className="seller-image" />
                                        )}
                                        <h3 {...createPreviewAttributes({ entryId: item.id, modelApiId: 'ProductSeller', fieldApiId: 'sellerName' })}>{item.sellerName}</h3>
                                        <p>{item.aboutSeller}</p>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            </div>
        </section>
    );
};

export const HeroSliderBlock: React.FC<{ data: import('../lib/hygraphClient').HeroSlider; entryId: string }> = ({ data, entryId }) => {
    const { selectedSegment } = usePersonalization();
    const personalizedItems = (data.items || []).map(item => applyPersonalization(item, selectedSegment?.id));
    return <HeroSlider products={personalizedItems} />;
};
