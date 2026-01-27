import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useLocalization } from '../lib/LocalizationContext';

interface LocalizedLinkProps extends LinkProps {
    // Add any custom props if needed
}

export const LocalizedLink: React.FC<LocalizedLinkProps> = ({ to, children, ...props }) => {
    const { locale } = useLocalization();

    const getLocalizedPath = (path: string | Partial<import("react-router-dom").Path>) => {
        if (typeof path === 'string') {
            if (path.startsWith('http')) return path; // Don't localize external links
            // If path is absolute (starts with /), prepend locale.
            // If it's relative, we assume the user knows what they are doing or we can leave it (but for this app we mostly use absolute paths).
            if (path.startsWith('/')) {
                // Avoid double prefixes if logic is complex, but here we assume 'to' is the base path.
                // e.g. /collection -> /en/collection
                return `/${locale}${path === '/' ? '' : path}`;
            }
            return path;
        }
        // Handle object path if needed (rarely used in this simple app but good for completeness)
        return {
            ...path,
            pathname: `/${locale}${path.pathname?.startsWith('/') ? '' : '/'}${path.pathname}`
        };
    };

    return (
        <Link to={getLocalizedPath(to) as any} {...props}>
            {children}
        </Link>
    );
};
