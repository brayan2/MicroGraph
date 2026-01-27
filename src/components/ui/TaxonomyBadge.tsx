import React from 'react';
import { Link } from 'react-router-dom';
import './TaxonomyBadge.css';

type TaxonomyBadgeProps = {
    label: string;
    value?: string;
    className?: string;
    clickable?: boolean;
};

export const TaxonomyBadge: React.FC<TaxonomyBadgeProps> = ({ label, value, className = '', clickable = true }) => {
    const content = (
        <span className={`taxonomy-badge ${className}`}>
            {label}
        </span>
    );

    if (value && clickable) {
        return (
            <Link to={`/taxonomy/${value}`} className="taxonomy-badge-link" onClick={(e) => e.stopPropagation()}>
                {content}
            </Link>
        );
    }

    return content;
};
