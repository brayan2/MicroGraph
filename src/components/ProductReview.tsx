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

const ITEMS_per_PAGE = 5;

export const ProductReview: React.FC<ProductReviewProps> = ({
    reviews,
    productId,
    title = 'Customer Reviews',
    titleEntryId,
    titleFieldApiId = 'reviewsSectionTitle'
}) => {
    const [currentPage, setCurrentPage] = React.useState(1);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const sectionRef = React.useRef<HTMLDivElement>(null);

    // Reset page when reviews change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [reviews.length, productId]);

    const totalPages = Math.ceil(reviews.length / ITEMS_per_PAGE);
    const paginatedReviews = reviews.slice(
        (currentPage - 1) * ITEMS_per_PAGE,
        currentPage * ITEMS_per_PAGE
    );

    const handlePageChange = (page: number) => {
        setIsTransitioning(true);

        // Scroll to top of section with offset
        const section = document.querySelector('.product-reviews-section');
        if (section) {
            const y = section.getBoundingClientRect().top + window.scrollY - 120; // Offset for sticky header
            window.scrollTo({ top: y, behavior: 'smooth' });
        }

        // Simulate loading delay for better UX
        setTimeout(() => {
            setCurrentPage(page);
            setIsTransitioning(false);
        }, 800);
    };

    return (
        <div className="product-reviews-section" ref={sectionRef}>
            <h3
                {...(titleEntryId ? createPreviewAttributes({
                    entryId: titleEntryId,
                    fieldApiId: titleFieldApiId,
                    componentChain: [{ fieldApiId: 'heading' }]
                }) : {})}
            >
                {title} ({reviews.length})
            </h3>
            {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
            ) : (
                <>
                    {isTransitioning ? (
                        <div className="reviews-loading-state">
                            <div className="review-spinner"></div>
                        </div>
                    ) : (
                        <div className="reviews-list fade-in-up" key={currentPage}>
                            {paginatedReviews.map((review) => (
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

                    {totalPages > 1 && (
                        <div className="reviews-pagination">
                            <button
                                className="page-btn"
                                disabled={currentPage === 1 || isTransitioning}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                &larr; Prev
                            </button>

                            <span className="page-info">
                                Page {currentPage} of {totalPages}
                            </span>

                            <button
                                className="page-btn"
                                disabled={currentPage === totalPages || isTransitioning}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next &rarr;
                            </button>
                        </div>
                    )}
                </>
            )}
            <div className="add-review-demo">
                <p><small>(Demo: Review submission would be implemented here via an API route)</small></p>
                <button className="btn btn-secondary btn-small" disabled>Write a Review</button>
            </div>
        </div>
    );
};
