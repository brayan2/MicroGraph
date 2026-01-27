import React from "react";
import type { Asset } from "../lib/hygraphClient";
import "./ProductImage.css";

interface ProductImageProps {
  image?: Asset | null;
  alt?: string;
  className?: string;
  fallbackText?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  image,
  alt,
  className = "",
  fallbackText = "No image available"
}) => {
  if (image?.url) {
    return (
      <img
        src={image.url}
        alt={image.altText || alt || "Product image"}
        className={`product-image ${className}`}
        loading="lazy"
      />
    );
  }

  return (
    <div className={`product-image-placeholder ${className}`}>
      <span>{fallbackText}</span>
    </div>
  );
};

