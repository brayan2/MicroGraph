import React from 'react';
import { InventoryVariant } from '../lib/hygraphClient';
import '../styles/VariantSelector.css';

interface VariantSelectorProps {
    variants: InventoryVariant[];
    selectedVariantId?: string;
    onSelect: (variantId: string) => void;
}

import { createPreviewAttributes } from '../lib/hygraphPreview';

export const VariantSelector: React.FC<VariantSelectorProps> = ({
    variants,
    selectedVariantId,
    onSelect,
}) => {
    if (variants.length === 0) return null;

    return (
        <div className="variant-selector">
            <h4>Options</h4>
            <div className="variant-options">
                {variants.map((variant) => (
                    <button
                        key={variant.id}
                        className={`variant-option ${selectedVariantId === variant.id ? 'active' : ''}`}
                        onClick={() => onSelect(variant.id)}
                        {...createPreviewAttributes({ entryId: variant.id })}
                    >
                        <span {...createPreviewAttributes({ entryId: variant.id, fieldApiId: 'name' })}>
                            {variant.name}
                        </span>
                        {variant.price ? ` (+$${variant.price})` : ''}
                    </button>
                ))}
            </div>
        </div>
    );
};
