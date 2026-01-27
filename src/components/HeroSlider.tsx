import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { LocalizedLink } from './LocalizedLink';
import { Product } from '../lib/hygraphClient';
import { createPreviewAttributes } from '../lib/hygraphPreview';
import './HeroSlider.css';

interface HeroSliderProps {
    products: Product[];
    autoPlayDuration?: number; // ms
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ products, autoPlayDuration = 5000 }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const startTime = useRef<number>(Date.now());

    const activeProduct = products[activeIndex];

    // Reset progress when index changes
    useEffect(() => {
        setProgress(0);
        startTime.current = Date.now();

        if (progressInterval.current) clearInterval(progressInterval.current);

        progressInterval.current = setInterval(() => {
            const elapsed = Date.now() - startTime.current;
            const newProgress = Math.min((elapsed / autoPlayDuration) * 100, 100);

            setProgress(newProgress);

            if (elapsed >= autoPlayDuration) {
                handleNext();
            }
        }, 100); // 10fps update for smoothish bar

        return () => {
            if (progressInterval.current) clearInterval(progressInterval.current);
        };
    }, [activeIndex, autoPlayDuration]);

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % products.length);
    };

    const handleItemClick = (index: number) => {
        setActiveIndex(index);
    };

    if (!products || products.length === 0) return null;

    return (
        <div className="hero-slider-container">
            {/* Left Pane: Main Image */}
            <div className="slider-main-image">
                <div key={activeProduct.id} className="fade-in" style={{ width: '100%', height: '100%' }}>
                    <img
                        src={activeProduct.gallery?.[0]?.url || activeProduct.productSeller?.sellerImage?.url || '/placeholder.jpg'}
                        alt={activeProduct.title}
                        {...createPreviewAttributes({ entryId: activeProduct.id })}
                    />
                    <div className="slider-content-overlay">
                        <h2
                            className="slider-title"
                            {...createPreviewAttributes({ entryId: activeProduct.id, fieldApiId: 'title' })}
                        >
                            {activeProduct.title}
                        </h2>
                        <p
                            className="slider-description"
                            {...createPreviewAttributes({ entryId: activeProduct.id, fieldApiId: 'shortDescription' })}
                        >
                            {activeProduct.shortDescription}
                        </p>
                        <LocalizedLink to={`/product/${activeProduct.productSlug}`} className="slider-cta-btn">
                            Buy Now
                        </LocalizedLink>
                    </div>
                </div>
            </div>

            {/* Right Pane: List */}
            <div className="slider-list">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className={`slider-item ${index === activeIndex ? 'active' : ''}`}
                        onClick={() => handleItemClick(index)}
                        {...createPreviewAttributes({ entryId: product.id })}
                    >
                        {/* Progress Bar (Only for active item) */}
                        {index === activeIndex && (
                            <div className="slider-progress-bar">
                                <div className="slider-progress-fill" style={{ height: `${progress}%` }}></div>
                            </div>
                        )}

                        <img
                            src={product.gallery?.[0]?.url || product.productSeller?.sellerImage?.url || '/placeholder.jpg'}
                            alt={product.title}
                            className="slider-item-thumb"
                        />
                        <div className="slider-item-text">
                            <div
                                className="slider-item-title"
                                {...createPreviewAttributes({ entryId: product.id, fieldApiId: 'title' })}
                            >
                                {product.title}
                            </div>
                            {product.productPrice && (
                                <div className="slider-item-desc">${product.productPrice.price}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
