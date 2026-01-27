import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProducts, Product } from '../lib/hygraphClient';
import '../styles/Search.css';

export const Search: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 2) {
            setIsSearching(true);
            try {
                const data = await searchProducts(value);
                setResults(data);
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setIsSearching(false);
            }
        } else {
            setResults([]);
        }
    };

    const handleSelect = (productSlug: string) => {
        setQuery('');
        setResults([]);
        navigate(`/product/${productSlug}`);
    };

    return (
        <div className="search-container">
            <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={handleSearch}
                className="search-input"
            />
            {results.length > 0 && (
                <div className="search-results">
                    {results.map((product) => (
                        <div
                            key={product.id}
                            className="search-result-item"
                            onClick={() => handleSelect(product.productSlug || product.id)}
                        >
                            <img src={product.gallery?.[0]?.url} alt={product.title} />
                            <div className="search-result-info">
                                <span className="search-result-title">{product.title}</span>
                                <span className="search-result-price">${product.price || '0.00'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isSearching && <div className="search-loader">Searching...</div>}
        </div>
    );
};
