import React from 'react';
import { Review } from '../lib/hygraphClient';
import { createPreviewAttributes } from '../lib/hygraphPreview';
import '../styles/ProductReview.css';

interface ProductReviewProps {
    reviews: Review[];
    productId: string;
    title?: string;
    titleEntryId?: string;
    titleFieldApiId?: string;
}

export const ProductReview: React.FC<ProductReviewProps> = ({
    reviews,
    productId,
    title = 'Customer Reviews',
    titleEntryId,
    titleFieldApiId = 'reviewsSectionTitle'
}) => {
    return (
        <div className="product-reviews-section">
            <h3
                {...(titleEntryId ? createPreviewAttributes({
                    entryId: titleEntryId,
                    fieldApiId: titleFieldApiId,
                    componentChain: [{ fieldApiId: 'heading' }]
                }) : {})}
            >
                {title}
            </h3>
            {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review.id} className="review-item">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    {review.avatarUrl && (
                                        <img
                                            src={review.avatarUrl}
                                            alt={`${review.name}'s profile`}
                                            className="reviewer-avatar"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <span className="review-author">
                                        {review.name}
                                        {review.id.startsWith('rem-') && <span className="remote-badge">Verified System Review</span>}
                                    </span>
                                </div>
                                <span className="review-rating">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </span>
                            </div>
                            {review.comment && <p className="review-comment">{review.comment}</p>}
                        </div>
                    ))}
                </div>
            )}
            <div className="add-review-demo">
                <p><small>(Demo: Review submission would be implemented here via an API route)</small></p>
                <button className="btn btn-secondary btn-small" disabled>Write a Review</button>
            </div>
        </div>
    );
};
