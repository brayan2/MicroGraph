import React, { useState, useEffect } from 'react';
import { LocalizedLink } from "../components/LocalizedLink";
import { fetchProducts, fetchBlogPosts, fetchPersonalisationPageData, Product, BlogPost, PersonalisationPage } from '../lib/hygraphClient';
import { usePersonalization } from '../lib/PersonalizationContext';
import { ProductImage } from '../components/ProductImage';
import { useLoading } from '../lib/LoadingContext';
import { useLocalization } from '../lib/LocalizationContext';
import '../styles/PersonalizationShowcase.css';
import { createPreviewAttributes } from '../lib/hygraphPreview';

export const PersonalizationShowcase: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [pageData, setPageData] = useState<PersonalisationPage | null>(null);
    const { setIsLoading } = useLoading();
    const [activeTab, setActiveTab] = useState<'products' | 'blogs'>('products');
    const [showDebug, setShowDebug] = useState(false);
    const { segments, selectedSegment, setSelectedSegment } = usePersonalization();
    const { locale } = useLocalization();

    useEffect(() => {
        let cancelled = false;

        const loadDocs = async () => {
            setIsLoading(true);
            try {
                const [prodData, blogData, lpData] = await Promise.all([
                    fetchProducts(),
                    fetchBlogPosts(),
                    fetchPersonalisationPageData(locale)
                ]);
                if (!cancelled) {
                    setProducts(prodData || []);
                    setBlogPosts(blogData || []);
                    setPageData(lpData);
                }
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };
        loadDocs();

        return () => {
            cancelled = true;
        };
    }, [locale]);

    const getPersonalizedProduct = (product: Product) => {
        if (!selectedSegment) return product;

        const variant = product.variants?.find(v =>
            v.segments.some(s => s.id === selectedSegment.id)
        );

        if (!variant) return product;

        return {
            ...product,
            title: variant.title || product.title,
            shortDescription: variant.shortDescription || product.shortDescription,
            productPrice: variant.productPrice || product.productPrice,
            gallery: variant.gallery || product.gallery,
            isPersonalized: true,
            variantId: variant.id,
            original: {
                title: product.title,
                shortDescription: product.shortDescription,
                price: product.productPrice?.price,
                gallery: product.gallery
            }
        };
    };

    const getPersonalizedBlogPost = (post: BlogPost) => {
        if (!selectedSegment) return post;

        const variant = post.variants?.find(v =>
            v.segments.some(s => s.id === selectedSegment.id)
        );

        if (!variant) return post;

        return {
            ...post,
            title: variant.title || post.title,
            excerpt: variant.excerpt || post.excerpt,
            feturedImage: variant.feturedImage || post.feturedImage,
            isPersonalized: true,
            variantId: variant.id,
            original: {
                title: post.title,
                excerpt: post.excerpt,
                feturedImage: post.feturedImage
            }
        };
    };

    return (
        <div className="personalization-showcase fade-in">
            <header className="showcase-header">
                <h1 {...(pageData?.id ? createPreviewAttributes({ entryId: pageData.id, modelApiId: 'PersonalisationPage', fieldApiId: 'title' }) : {})}>
                    {pageData?.title}
                </h1>
                <p {...(pageData?.id ? createPreviewAttributes({ entryId: pageData.id, fieldApiId: 'subtitle' }) : {})}>
                    {pageData?.subtitle}
                </p>
            </header>

            <section className="showcase-controls">
                <div className="persona-switcher-large">
                    <button
                        className={`persona-btn ${!selectedSegment ? 'active' : ''}`}
                        onClick={() => setSelectedSegment(null)}
                    >
                        Default Visitor
                    </button>
                    {segments.map(segment => (
                        <button
                            key={segment.id}
                            className={`persona-btn ${selectedSegment?.id === segment.id ? 'active' : ''}`}
                            onClick={() => setSelectedSegment(segment)}
                            {...createPreviewAttributes({ entryId: segment.id, fieldApiId: 'name' })}
                        >
                            {segment.name}
                        </button>
                    ))}
                </div>

                <div className="tab-switcher">
                    <button
                        className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
                        onClick={() => setActiveTab('products')}
                    >
                        Products
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'blogs' ? 'active' : ''}`}
                        onClick={() => setActiveTab('blogs')}
                    >
                        Blog Posts
                    </button>
                </div>

                <div className="debug-toggle">
                    <label>
                        <input
                            type="checkbox"
                            checked={showDebug}
                            onChange={(e) => setShowDebug(e.target.checked)}
                        />
                        Show Personalization Details
                    </label>
                </div>
            </section>

            {activeTab === 'products' ? (
                <div className="showcase-grid">
                    {products.map(p => {
                        const personalized = getPersonalizedProduct(p) as any;
                        const hasVariant = personalized.isPersonalized;
                        const productUrl = `/product/${personalized.productSlug || p.id}`;
                        const editId = (hasVariant && personalized.variantId) ? personalized.variantId : p.id;

                        return (
                            <div
                                key={p.id}
                                className={`showcase-card ${hasVariant && showDebug ? 'highlighted' : ''}`}
                                {...createPreviewAttributes({ entryId: editId })}
                            >
                                {hasVariant && (
                                    <div className="card-badge">✨ {selectedSegment?.name} Variant</div>
                                )}

                                <LocalizedLink to={productUrl} className="card-link-wrapper">
                                    <div className="card-image-wrapper">
                                        <ProductImage
                                            image={personalized.gallery?.[0]}
                                            alt={personalized.title}
                                            className="card-image"
                                            {...createPreviewAttributes({ entryId: editId, fieldApiId: 'gallery' })}
                                        />
                                    </div>

                                    <div className="card-content">
                                        <h3
                                            className="card-title"
                                            {...createPreviewAttributes({ entryId: editId, fieldApiId: 'title' })}
                                        >
                                            {personalized.title}
                                        </h3>
                                        <p
                                            className="card-description"
                                            {...createPreviewAttributes({ entryId: editId, fieldApiId: 'shortDescription' })}
                                        >
                                            {personalized.shortDescription}
                                        </p>

                                        <div className="card-footer">
                                            <span
                                                className="card-price"
                                                {...createPreviewAttributes({ entryId: editId, fieldApiId: 'productPrice' })}
                                            >
                                                ${personalized.productPrice?.price || personalized.price || '0.00'}
                                            </span>
                                            <span className="btn btn-primary btn-sm">View Product</span>
                                        </div>

                                        {hasVariant && showDebug && (
                                            <div className="debug-info">
                                                <div className="debug-item">
                                                    <span className="debug-label">Title:</span>
                                                    <span className="debug-value">{personalized.original.title}</span>
                                                    <span className="debug-new-value">→ {personalized.title}</span>
                                                </div>
                                                {personalized.original.price !== personalized.productPrice?.price && (
                                                    <div className="debug-item">
                                                        <span className="debug-label">Price:</span>
                                                        <span className="debug-value">${personalized.original.price}</span>
                                                        <span className="debug-new-value">→ ${personalized.productPrice?.price}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </LocalizedLink>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="showcase-grid">
                    {blogPosts.map(post => {
                        const personalized = getPersonalizedBlogPost(post) as any;
                        const hasVariant = personalized.isPersonalized;
                        const postUrl = `/blog/${personalized.blogSlug || post.id}`;
                        const editId = (hasVariant && personalized.variantId) ? personalized.variantId : post.id;

                        return (
                            <div
                                key={post.id}
                                className={`showcase-card ${hasVariant && showDebug ? 'highlighted' : ''}`}
                                {...createPreviewAttributes({ entryId: editId })}
                            >
                                {hasVariant && (
                                    <div className="card-badge">✨ {selectedSegment?.name} Variant</div>
                                )}

                                <LocalizedLink to={postUrl} className="card-link-wrapper">
                                    <div className="card-image-wrapper">
                                        <ProductImage
                                            image={personalized.feturedImage}
                                            alt={personalized.title}
                                            className="card-image"
                                            {...createPreviewAttributes({ entryId: editId, fieldApiId: 'feturedImage' })}
                                        />
                                    </div>

                                    <div className="card-content">
                                        <h3
                                            className="card-title"
                                            {...createPreviewAttributes({ entryId: editId, fieldApiId: 'title' })}
                                        >
                                            {personalized.title}
                                        </h3>
                                        <p
                                            className="card-description"
                                            {...createPreviewAttributes({ entryId: editId, fieldApiId: 'excerpt' })}
                                        >
                                            {personalized.excerpt}
                                        </p>

                                        <div className="card-footer">
                                            <span className="card-date">
                                                {new Date(post.createdAt || '').toLocaleDateString()}
                                            </span>
                                            <span className="btn btn-outline btn-sm">Read More</span>
                                        </div>

                                        {hasVariant && showDebug && (
                                            <div className="debug-info">
                                                <div className="debug-item">
                                                    <span className="debug-label">Title:</span>
                                                    <span className="debug-value">{personalized.original.title}</span>
                                                    <span className="debug-new-value">→ {personalized.title}</span>
                                                </div>
                                                <div className="debug-item">
                                                    <span className="debug-label">Excerpt:</span>
                                                    <span className="debug-value">{personalized.original.excerpt?.substring(0, 30)}...</span>
                                                    <span className="debug-new-value">→ {personalized.excerpt?.substring(0, 30)}...</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </LocalizedLink>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
