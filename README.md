# MicroGraph

This project is a React-based generic e-commerce and blog application designed to showcase the powerful features of **Hygraph**, a federated content platform. It demonstrates how to build dynamic, high-performance applications with features like Live Preview, Localization, and programmatic content management.

## 🚀 Key Hygraph Features Showcased

### 1. **Live Preview & Click-to-Edit**
MicroGraph integrates the `@hygraph/preview-sdk` to provide a seamless editing experience.
- **Click-to-Edit**: Reviewers can click the "Edit" pencil icon on any component in the live application to directly open that content entry in the Hygraph schema editor.
- **Real-time Previews**: Content changes in Hygraph are instantly reflected in the application before publishing.

### 2. **Native Localization**
The application supports multi-language content tailored to different regions.
- Uses Hygraph's **Localization API** to fetch content based on the user's selected locale.
- Demonstrates handling of localized fields for Products, Blogs, and Navigation menus.

### 3. **Programmatic Content Management (Mutations)**
The `scripts/` directory includes examples of how to interact with Hygraph's **Mutation API**.
- **Seeding Data**: Scripts to programmatically create and publish content entries (Products, Landing Pages, Authors).
- **Schema Management**: Demonstrates how to structure complex content relationships (e.g., deeply nested Navigation, Related Products).

### 4. **Flexible Content Modeling**
Shows how Hygraph handles diverse content types:
- **Products**: Complex models with variants, pricing, and assets.
- **Landing Pages**: Modular "Sections" (Polymorphic relations) allowing content editors to build pages by stacking components like Hero Sliders, CTAs, and Grids.
- **Navigation**: Recursive / Tree-like structures for multi-level menus.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+ recommended for script support)
- A Hygraph project (Clone the schema or use your own)

### 1. Clone the repository
```bash
git clone https://github.com/brayan2/MicroGraph.git
cd MicroGraph
```

### 2. Environment Setup
Create a `.env` file in the root directory with your Hygraph credentials:

```bash
VITE_HYGRAPH_ENDPOINT=your_hygraph_endpoint
VITE_HYGRAPH_TOKEN=your_hygraph_token
VITE_HYGRAPH_PREVIEW_TOKEN=your_hygraph_preview_token
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📦 Scripts

This project includes utility scripts to manage Hygraph content.

**Run scripts safely using your `.env` file:**

```bash
# Seed master data (Authors, Navigation, Products)
node --env-file=.env scripts/manage.js seed

# Test nested queries
node --env-file=.env scripts/manage.js test-related
```

## Deployment

You can deploy this project to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fbrayan2%2FMicroGraph)
