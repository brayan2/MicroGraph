# CS Demo Storefront

A modern e-commerce storefront built with React, Vite, TypeScript, and Hygraph CMS.

## Features

- 🏠 **Homepage** - Beautiful landing page with hero section, featured products, blog teasers, and CTA sections
- 📦 **Product Collection** - Browse all products with filtering by status (In Stock, Out of Stock, Pre-Order)
- 🛍️ **Product Detail Pages** - Individual product pages with full descriptions and details
- 📝 **Blog Listing** - View all blog posts in a modern grid layout
- 📄 **Blog Post Pages** - Rich content blog posts with full text rendering
- 🧭 **Navigation** - Sticky navigation bar with active route highlighting
- 🎨 **Modern UI** - Dark theme with gradient accents and smooth animations

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Hygraph CMS** - Headless CMS for content management

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository and navigate to the project directory:
```bash
cd cs-demo
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Hygraph credentials:
```env
VITE_HYGRAPH_ENDPOINT=https://api-ap-southeast-2.hygraph.com/v2/YOUR_PROJECT_ID/master
VITE_HYGRAPH_TOKEN=your_hygraph_token_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx   # Main navigation bar
│   ├── Footer.tsx       # Site footer
│   └── ProductList.tsx  # Legacy product list (can be removed)
├── pages/               # Page components
│   ├── HomePage.tsx     # Homepage with multiple sections
│   ├── CollectionPage.tsx  # Product collection/listing
│   ├── ProductPage.tsx     # Individual product detail
│   ├── BlogPage.tsx        # Blog post listing
│   └── BlogPostPage.tsx    # Individual blog post
├── lib/
│   └── hygraphClient.ts    # Hygraph GraphQL client
├── styles/              # Page-specific styles
└── App.tsx              # Main app component with routing
```

## Available Routes

- `/` - Homepage
- `/collection` - Product collection page
- `/product/:slug` - Individual product detail page
- `/blog` - Blog listing page
- `/blog/:slug` - Individual blog post page

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

## Development

The project uses:
- **Vite** for fast hot module replacement (HMR)
- **TypeScript** for type checking
- **React Router** for client-side navigation

## Hygraph Models

The frontend is configured to work with the following Hygraph models:
- `Product` - Store products with titles, descriptions, slugs, and status
- `BlogPost` - Blog posts with titles, excerpts, body content, and slugs

Make sure your Hygraph project has these models configured with the appropriate fields.

## License

MIT
