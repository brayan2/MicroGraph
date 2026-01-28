export type Asset = {
  id: string;
  url: string;
  fileName?: string | null;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  mimeType?: string | null;
  title?: string | null;
};

export type HeroBanner = {
  id: string;
  title: string;
  subtitle?: string | null;
  image?: Asset | null;
  ctaText?: string | null;
  ctaLink?: string | null;
};

export type ButtonCta = {
  __typename: 'ButtonCta';
  id: string;
  buttonLabel: string;
  buttonTarget?: LandingPage | Product | BlogPageData | CollectionPageData | PersonalisationPage | null;
};

export type Cta = {
  __typename: 'Cta';
  id: string;
  ctaLabel?: string | null;
  ctaSubheading?: string | null;
  buttonDetails: ButtonCta[];
};

export type InventoryVariant = {
  id: string;
  name: string;
  price?: number | null;
  sku?: string | null;
  color?: string | null;
  size?: string | null;
};

export type Segment = {
  id: string;
  name: string;
  description?: string | null;
};

export type Category = {
  id: string;
  categoryName: string;
  categorySlug: string;
  parentCategory?: Category[] | null;
  childrenCategories?: Category | null;
};

export type Review = {
  id: string;
  name: string;
  rating: number;
  comment?: string | null;
};

export type Taxonomy = {
  id?: string;
  displayName: string;
  apiId?: string;
  value?: string;
};

/**
 * Helper to transform native TaxonomyNode value (apiId) to a human-readable name.
 * e.g., "BestSeller" -> "Best Seller"
 */
export function getTaxonomyDisplayName(value: string | undefined | null): string {
  if (!value) return "";
  // Split by capital letters and join with spaces
  return value.replace(/([A-Z])/g, " $1").trim();
}

export type Product = {
  __typename: 'Product';
  id: string;
  title: string;
  productSlug?: string | null;
  shortDescription?: string | null;
  productStatus?: 'inStock' | 'outOfStock' | 'preOrder' | string | null;
  productDescription?: RichText | null;
  productSku?: string | null;
  price?: number | null;
  productPrice?: { price: number } | null;
  productAttributes?: { attributeKey: string[] } | null;
  productSeller?: {
    id: string;
    sellerName: string;
    sellerSlug: string;
    aboutSeller?: string | null;
    sellerImage?: Asset | null;
  } | null;
  gallery?: Asset[] | null;
  inventoryVariants?: InventoryVariant[] | null;
  categories?: Category[] | null;
  productCategory?: Array<{ id: string; categoryName: string; categorySlug: string }> | null;
  reviews?: Review[] | null;
  variants?: Array<{
    id: string;
    title?: string | null;
    shortDescription?: string | null;
    productPrice?: { price: number } | null;
    segments: Segment[];
    gallery?: Asset[] | null;
  }>;
  productVariants?: Array<ClothesVariants | ShoesVariant> | null;
  relatedProducts?: {
    product: Product[];
  } | null;
  shuffle?: boolean | null;
  taxonomies?: Taxonomy[] | null;
};

export type ClothesVariants = {
  __typename: 'ClothesVariants';
  id: string;
  label: string;
  clothesSize: string;
  clothesColor: string;
  variantGallery?: Asset[] | null;
};

export type ShoesVariant = {
  __typename: 'ShoesVariant';
  id: string;
  label: string;
  shoesSize: string;
  shoesColor: string;
  variantGallery?: Asset[] | null;
};

export type BlogAuthor = {
  __typename?: 'BlogAuthor';
  id: string;
  authorName: string;
  authorSlug?: string;
  authorAbout?: string | null;
  authorImage?: Asset | null;
  caseDescription?: RichText | null;
};

export type BlogPost = {
  __typename: 'BlogPost';
  id: string;
  title?: string | null;
  blogSlug?: string | null;
  excerpt?: string | null;
  body?: RichText | null;
  blogTime?: string | null;
  createdAt?: string | null;
  feturedImage?: Asset | null;
  blogAuthor?: BlogAuthor | null;
  variants?: Array<{
    id: string;
    title?: string | null;
    excerpt?: string | null;
    feturedImage?: Asset | null;
    segments: Segment[];
  }>;
  taxonomies?: Taxonomy[] | null;
};

export type Link = {
  id: string;
  url: string;
  openNewTab?: boolean | null;
};

export type SubNav = {
  id: string;
  subLabel?: string | null;
  subNavItems?: Array<LandingPage | Product | BlogPost | BlogPageData | CollectionPageData | Category> | null;
  target?: BlogPost[] | null; // Added for SubNav2 support
};

export type NavItem = {
  id: string;
  label: string;
  target?: BlogAuthor | BlogPost | (LandingPage & { lpSlug?: string }) | Product | (BlogPageData & { bpSlug?: string }) | (CollectionPageData & { cpSlug?: string }) | Category | null;
  subNavs?: Array<SubNav> | null;
};

export type Navigation = {
  id: string;
  title: string;
  logo?: Asset | null;
  navItems?: NavItem[] | null;
};

export type Seo = {
  id: string;
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  image?: Asset | null;
};

export type CollectionPageData = {
  __typename: 'CollectionPage';
  id: string;
  title: string;
  subtitle?: string | null;
  pageSlug: string;
  seo?: Seo | null;
  seoV2?: any;
};

export type PersonalisationPage = {
  __typename: 'PersonalisationPage';
  id: string;
  title: string;
  subtitle?: string | null;
  pageSlug: string;
  seo?: Seo | null;
};

export type BlogPageData = {
  __typename: 'BlogPage';
  id: string;
  title: string;
  subtitle?: string | null;
  pageSlug: string;
  seo?: any;
  seoV2?: any;
};

export type ProductSeller = {
  __typename: 'ProductSeller';
  id: string;
  sellerName: string;
  sellerSlug?: string;
  aboutSeller?: string | null;
  sellerImage?: Asset | null;
};

export type Grid = {
  __typename: 'Grid';
  id: string;
  title?: string | null;
  grid: Array<Product | BlogPost | BlogAuthor | ProductSeller>;
};

export type LandingPage = {
  __typename: 'LandingPage';
  id: string;
  title: string;
  pageSlug: string;
  sections: Array<Cta | ProductGrid | RemoteReviewsSection | HeroSlider | Grid>;
  seo?: any;
  seoV2?: any;
};

export type BlogTeasersSection = {
  __typename: 'BlogTeasersSection';
  id: string;
  heading?: string | null;
  blogPost?: BlogPost[] | null;
};



export type ProductGrid = {
  __typename: 'ProductGrid';
  id: string;
  heading?: string | null;
  products?: Product[] | null;
};

export type HeroSlider = {
  __typename: 'HeroSlider';
  id: string;
  title?: string | null;
  items: Product[];
};

export type RemoteReviewsSection = {
  __typename: 'RemoteReviewsSection';
  id: string;
  heading?: string | null;
};

export type RichText = {
  raw?: any;
  text?: string | null;
  references?: Asset[];
};

export type RichTextNode = {
  type?: string | null;
  text?: string | null;
  children?: RichTextNode[];
  bold?: boolean | null;
  italic?: boolean | null;
  underline?: boolean | null;
  src?: string | null;
  title?: string | null;
  width?: number | null;
  height?: number | null;
  handle?: string | null;
  mimeType?: string | null;
  nodeId?: string | null;
  nodeType?: string | null;
};

export function applyPersonalization<T extends { variants?: any[] }>(item: T, segmentId?: string): T {
  if (!segmentId || !item.variants || item.variants.length === 0) return item;

  const variant = item.variants.find(v =>
    v.segments?.some((s: any) => s.id === segmentId)
  );

  if (!variant) return item;

  // Merge variant fields onto item
  return {
    ...item,
    ...variant,
    // Ensure nested fields are also handled if needed
  };
}

const endpoint = import.meta.env.VITE_HYGRAPH_ENDPOINT as string | undefined;
const token = import.meta.env.VITE_HYGRAPH_TOKEN as string | undefined;

if (!endpoint) {
  console.warn("VITE_HYGRAPH_ENDPOINT is not set. Product queries will fail.");
}

let currentLocale = 'en';
if (typeof window !== 'undefined') {
  const pathParts = window.location.pathname.split('/');
  const langInPath = pathParts[1];
  if (['en', 'de', 'fr', 'es'].includes(langInPath)) {
    currentLocale = langInPath;
  }
}

export const setClientLocale = (locale: string) => {
  currentLocale = locale;
};

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  if (!endpoint) {
    return null;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "gcms-locales": `${currentLocale}, en`,
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query, variables })
    });

    const json = await res.json();

    if (json.errors) {
      console.error("Hygraph GraphQL errors for query:", query.substring(0, 100) + "...");
      console.error("Variables:", JSON.stringify(variables));
      console.error("Full Errors:", JSON.stringify(json.errors, null, 2));

      const isSchemaError = json.errors.some((err: any) =>
        err.message?.includes('Unknown field') ||
        err.message?.includes('Cannot query field') ||
        err.message?.includes('Unknown type')
      );

      if (isSchemaError) {
        return null;
      }
      throw new Error("Hygraph GraphQL error");
    }

    if (!res.ok) {
      console.error("Hygraph request failed", res.status, json);
      throw new Error(`Hygraph request failed with status ${res.status}`);
    }

    return json.data as T;
  } catch (err) {
    console.error("GraphQL Request Exception:", err);
    return null;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  const query = /* GraphQL */ `
    query ListProducts {
      products(orderBy: createdAt_DESC, first: 100) {
        id
        title
        productSlug
        shortDescription
        productStatus
        productSku
        productPrice { price }
        productCategory {
           categorySlug
        }
        gallery {
          id
          url
          fileName
          width
          height
          altText
          caption
        }
        variants {
          id
          title
          shortDescription
          productPrice { price }
          gallery { id url fileName width height altText caption }
          segments { id name }
        }
      }
      productTaxonomies(first: 1000) {
        productSlug
        taxonomies {
          value
        }
      }
    }
  `;

  const data = await graphqlRequest<{ products: Product[], productTaxonomies: { productSlug: string, taxonomies: { value: string }[] }[] }>(query);
  const products = data?.products ?? [];
  const taxonomyMap = new Map<string, Taxonomy[]>();

  data?.productTaxonomies?.forEach(pt => {
    if (pt.productSlug) {
      const taxes: Taxonomy[] = pt.taxonomies.map(t => ({
        displayName: getTaxonomyDisplayName(t.value),
        value: t.value
      }));
      taxonomyMap.set(pt.productSlug, taxes);
    }
  });

  return products.map(p => ({
    ...p,
    taxonomies: taxonomyMap.get(p.productSlug || p.id) || [],
    productCategory: p.productCategory || null
  }));
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  // Try to fetch by slug first, then fallback to ID if slug not found
  const query = /* GraphQL */ `
    query GetProductBySlug($slug: String!) {
      products(where: { productSlug: $slug }, first: 1) {
        id
        title
        productSlug
        shortDescription
        productStatus
        productSku
        productPrice { price }
        productDescription {
          raw
          text
          references {
            ... on Asset {
              id
              url
              fileName
              mimeType
              width
              height
              altText
            }
          }
        }
        gallery {
          id
          url
          fileName
          width
          height
          altText
          caption
        }
        variants {
          id
          title
          shortDescription
          productPrice { price }
          gallery { id url fileName width height altText caption }
          segments { id name }
        }
      }
      productTaxonomies(where: { productSlug: $slug }) {
        taxonomies {
          value
        }
      }
    }
  `;

  const data = await graphqlRequest<{ products: Product[], productTaxonomies: { taxonomies: { value: string }[] }[] }>(query, { slug });
  const product = data?.products?.[0];
  const taxonomies = data?.productTaxonomies?.[0]?.taxonomies.map(t => ({
    displayName: getTaxonomyDisplayName(t.value),
    value: t.value
  })) || [];

  if (!product) {
    // Try fallback by ID if slug not found
    const queryById = /* GraphQL */ `
      query GetProductById($id: ID!) {
        products(where: { id: $id }, first: 1) {
          id
          title
          productSlug
          shortDescription
          productStatus
          productSku
          productDescription {
            raw
            text
          }
        }
        productTaxonomies(where: { productSlug: $id }) {
            taxonomies {
                value
            }
        }
      }
    `;

    const dataById = await graphqlRequest<{ products: Product[], productTaxonomies: { taxonomies: { value: string }[] }[] }>(queryById, { id: slug });
    const productById = dataById?.products?.[0] ?? null;
    if (productById) {
      productById.taxonomies = dataById?.productTaxonomies?.[0]?.taxonomies.map(t => ({
        displayName: getTaxonomyDisplayName(t.value),
        value: t.value
      })) || [];
    }
    return productById;
  }

  product.taxonomies = taxonomies;
  return product;
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const query = /* GraphQL */ `
    query ListBlogPosts {
      blogPosts(orderBy: createdAt_DESC, first: 100) {
        id
        title
        blogSlug
        excerpt
        blogTime
        createdAt
        feturedImage {
          id
          url
          fileName
          width
          height
          altText
          caption
        }
        variants {
          id
          title
          excerpt
          feturedImage { id url fileName width height altText caption }
          segments { id name }
        }
        taxonomies {
          value
        }
      }
    }
  `;

  const data = await graphqlRequest<{ blogPosts: any[] }>(query);
  return (data?.blogPosts || []).map(post => ({
    ...post,
    taxonomies: post.taxonomies?.map((t: any) => ({
      displayName: getTaxonomyDisplayName(t.value),
      value: t.value
    })) || []
  }));
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  // Try to fetch by slug first, then fallback to ID if slug not found
  const query = /* GraphQL */ `
    query GetBlogPostBySlug($slug: String!) {
      blogPosts(where: { blogSlug: $slug }, first: 1) {
        id
        title
        blogSlug
        excerpt
        blogTime
        createdAt
        body {
          raw
          text
          references {
            ... on Asset {
              id
              url
              fileName
              mimeType
              width
              height
              altText
            }
          }
        }
        feturedImage {
          id
          url
          fileName
          width
          height
          altText
          caption
        }
        variants {
          id
          title
          excerpt
          feturedImage { id url fileName width height altText caption }
          segments { id name }
        }
        taxonomies {
          value
        }
      }
    }
  `;

  const data = await graphqlRequest<{ blogPosts: any[] }>(query, { slug });
  const blogPost = data?.blogPosts?.[0];

  if (!blogPost) {
    const queryById = /* GraphQL */ `
      query GetBlogPostById($id: ID!) {
        blogPosts(where: { id: $id }, first: 1) {
          id
          title
          blogSlug
          excerpt
          blogTime
          createdAt
            body {
              raw
              text
            }
            taxonomies {
              value
            }
        }
      }
    `;

    const dataById = await graphqlRequest<{ blogPosts: any[] }>(queryById, { id: slug });
    const post = dataById?.blogPosts?.[0] ?? null;
    if (post) {
      post.taxonomies = post.taxonomies?.map((t: any) => ({
        displayName: getTaxonomyDisplayName(t.value),
        value: t.value
      })) || [];
    }
    return post;
  }

  blogPost.taxonomies = blogPost.taxonomies?.map((t: any) => ({
    displayName: getTaxonomyDisplayName(t.value),
    value: t.value
  })) || [];

  return blogPost;
}

export async function fetchBlogPostWithVariants(slug: string, segmentName?: string): Promise<BlogPost | null> {
  const query = /* GraphQL */ `
    query GetBlogPostWithVariants($slug: String!, $segmentName: String) {
      blogPosts(where: { blogSlug: $slug }, first: 1) {
        id
        title
        blogSlug
        excerpt
        blogTime
        createdAt
        body {
          raw
          text
          references {
            ... on Asset {
              id
              url
              fileName
              mimeType
              width
              height
              altText
            }
          }
        }
        feturedImage {
          id
          url
          fileName
          width
          height
          altText
          caption
        }
        blogAuthor {
          id
          authorName
          authorAbout
          authorImage { url altText }
        }
        variants(where: { segments_some: { name: $segmentName } }) {
          id
          title
          excerpt
          feturedImage { id url fileName width height altText caption }
          segments { id name }
        }
        taxonomies {
          value
        }
      }
    }
  `;

  const data = await graphqlRequest<{ blogPosts: any[] }>(query, { slug, segmentName });
  const post = data?.blogPosts?.[0] ?? null;
  if (post) {
    post.taxonomies = post.taxonomies?.map((t: any) => ({
      displayName: getTaxonomyDisplayName(t.value),
      value: t.value
    })) || [];
  }
  return post;
}

export async function fetchFeaturedProducts(limit: number = 6): Promise<Product[]> {
  const query = /* GraphQL */ `
    query GetFeaturedProducts($limit: Int!) {
      products(orderBy: createdAt_DESC, first: $limit) {
        id
        title
        productSlug
        shortDescription
        productStatus
        productPrice { price }
        productAttributes { id attributeKey }
        productSeller {
          id
          sellerName
          sellerSlug
          aboutSeller
          sellerImage { url altText }
        }
        shuffle
        gallery {
          id
          url
          fileName
          width
          height
          altText
          caption
        }
        variants {
          id
          title
          shortDescription
          productPrice { price }
          gallery { id url fileName width height altText caption }
          segments { id name }
        }
      }
    }
  `;

  const data = await graphqlRequest<{ products: Product[] }>(query, { limit });
  return data?.products ?? [];
}

export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const query = /* GraphQL */ `
    query SearchProducts($searchTerm: String!) {
      products(where: { _search: $searchTerm }, first: 20) {
        id
        title
        productSlug
        shortDescription
        productStatus
        productPrice { price }
        productAttributes { id attributeKey }
        productSeller {
          id
          sellerName
          sellerSlug
          aboutSeller
          sellerImage { url altText }
        }
        shuffle
        gallery {
          url
          altText
        }
        variants {
          id
          title
          shortDescription
          productPrice { price }
          gallery { id url fileName width height altText caption }
          segments { id name }
        }
      }
    }
  `;

  const data = await graphqlRequest<{ products: Product[] }>(query, { searchTerm });
  return data?.products ?? [];
}

export async function fetchCategories(): Promise<Category[]> {
  const query = /* GraphQL */ `
    query GetCategories {
      productCategories(where: { parentCategory_none: {} }) {
        id
        categoryName
        categorySlug
        childrenCategories {
          id
          categoryName
          categorySlug
        }
      }
    }
  `;

  const data = await graphqlRequest<{ productCategories: Category[] }>(query);
  return data?.productCategories ?? [];
}

export async function fetchSegments(): Promise<Segment[]> {
  const query = /* GraphQL */ `
    query GetSegments {
      segments {
        id
        name
        description
      }
    }
  `;

  const data = await graphqlRequest<{ segments: Segment[] }>(query);
  return data?.segments ?? [];
}

export async function fetchProductWithVariants(slug: string, segmentName?: string): Promise<Product | null> {
  const queryWithVariants = /* GraphQL */ `
    query GetProductWithVariants($slug: String!, $segmentName: String) {
      products(where: { productSlug: $slug }, first: 1) {
        id
        title
        productSlug
        shortDescription
        productStatus
        productSku
        productPrice { price }
        productAttributes { id attributeKey }
        productCategory { id categoryName categorySlug }
        productSeller {
          id
          sellerName
          sellerSlug
          aboutSeller
          sellerImage { url altText }
        }
        shuffle
        productDescription {
          raw
          text
        }
        gallery {
          url
          altText
        }
        variants(where: { segments_some: { name: $segmentName } }) {
          id
          title
          shortDescription
          productPrice { price }
          gallery { id url fileName width height altText caption }
          segments { id name }
        }
        productVariants {
          ... on ClothesVariants {
            __typename
            id
            label
            clothesSize
            clothesColor
          }
          ... on ShoesVariant {
            __typename
            id
            label
            shoesSize
            shoesColor
          }
        }
        relatedProducts {
          product {
            id
            title
            productSlug
            productPrice { price }
            gallery {
              url
              altText
            }
          }
        }
      }
      productTaxonomies(where: { productSlug: $slug }) {
        taxonomies {
          value
        }
      }
    }
  `;

  const data = await graphqlRequest<{ products: Product[], productTaxonomies: { taxonomies: { value: string }[] }[] }>(queryWithVariants, { slug, segmentName });

  if (data?.products?.[0]) {
    const product = data.products[0];
    product.taxonomies = data?.productTaxonomies?.[0]?.taxonomies.map(t => ({
      displayName: getTaxonomyDisplayName(t.value),
      value: t.value
    })) || [];
    return product;
  }

  return fetchProductBySlug(slug);
}

export async function fetchLandingPage(slug: string = 'home'): Promise<LandingPage | null> {
  const query = /* GraphQL */ `
    query GetLandingPage($slug: String!) {
      landingPages(where: { pageSlug: $slug }, first: 1) {
        id
        title
        pageSlug
        sections {
          ... on Cta {
            __typename
            id
            ctaLabel
            ctaSubheading
            buttonDetails {
              ... on ButtonCta {
                __typename
                id
                buttonLabel
                buttonTarget {
                  __typename
                  ... on LandingPage { lpSlug: pageSlug }
                  ... on Product { productSlug }
                  ... on BlogPage { bpSlug: pageSlug }
                  ... on CollectionPage { cpSlug: pageSlug }
                  ... on PersonalisationPage { pageSlug }
                }
              }
            }
          }

          ... on RemoteReviewsSection {
            __typename
            id
            heading
          }
          ... on HeroSlider {
            __typename
            id
            sliderTitle: title
            items {
              id
              title
              productSlug
              shortDescription
              productPrice { price }
              productSeller {
                 id
                 sellerImage { url altText }
              }
              gallery {
                url
                altText
              }
              variants {
                id
                title
                shortDescription
                productPrice { price }
                gallery { id url fileName width height altText caption }
                segments { id name }
              }
            }
          }
          ... on Grid {
            __typename
            id
            gridTitle: title
            grid {
              __typename
              ... on Product {
                id
                productTitle: title
                productSlug
                shortDescription
                productPrice { price }
                gallery { id url fileName width height altText caption }
                productStatus
              }
              ... on BlogPost {
                id
                blogTitle: title
                blogSlug
                excerpt
                feturedImage {
                  url
                  altText
                }
                createdAt
                blogAuthor {
                  authorName
                  authorImage {
                    url
                  }
                }
              }
              ... on BlogAuthor {
                id
                authorName
                authorAbout
                authorImage {
                  url
                  altText
                }
              }
              ... on ProductSeller {
                id
                sellerName
                aboutSeller
                sellerImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphqlRequest<{ landingPages: any[] }>(query, { slug });

  // Post-process to handle aliased titles in Grid sections
  const page = data?.landingPages?.[0] ?? null;
  if (page) {
    page.sections?.forEach((section: any) => {
      // Map section-level titles
      if (section.__typename === 'HeroSlider' && section.sliderTitle) {
        section.title = section.sliderTitle;
      }
      if (section.__typename === 'Grid' && section.gridTitle) {
        section.title = section.gridTitle;
      }

      // Map Grid item titles
      if (section.__typename === 'Grid' && section.grid) {
        section.grid.forEach((item: any) => {
          if (item.__typename === 'Product' && item.productTitle) {
            item.title = item.productTitle;
          }
          if (item.__typename === 'BlogPost' && item.blogTitle) {
            item.title = item.blogTitle;
          }
        });
      }
    });
  }

  return page as LandingPage;
}


export async function fetchNavigation(locale: string = 'en'): Promise<Navigation | null> {
  const query = /* GraphQL */ `
    query GetNavigationV4($locale: [Locale!]!) {
      navigations(first: 1) {
        id
        title
        logo {
          id
          url
          altText
          width
          height
        }
        navItems(locales: $locale) {
          ... on NavItem {
            id
            label
            target(locales: $locale) {
              __typename
              ... on LandingPage { lpSlug: pageSlug }
              ... on BlogPage { bpSlug: pageSlug }
              ... on CollectionPage { cpSlug: pageSlug }
              ... on PersonalisationPage { pageSlug }
              ... on ProductCategory {
                categorySlug
                childrenCategories {
                  categoryName
                  categorySlug
                  childrenCategories {
                    categoryName
                    categorySlug
                  }
                }
              }
            }
            subNavs(locales: $locale) {
              __typename
              ... on SubNav1 {
                id
                subLabel
                subNavItems(locales: $locale) {
                  __typename
                  ... on Product { productSlug }
                  ... on BlogPost { blogSlug }
                  ... on BlogPage { bpSlug: pageSlug }
                  ... on CollectionPage { cpSlug: pageSlug }
                  ... on PersonalisationPage { pageSlug }
                  ... on ProductCategory {
                    categorySlug
                    childrenCategories {
                      categoryName
                      categorySlug
                      childrenCategories {
                        categoryName
                        categorySlug
                        childrenCategories {
                            categoryName
                            categorySlug
                        }
                      }
                    }
                  }
                }
              }
              ... on SubNav2 {
                id
                target {
                  __typename
                  ... on BlogPost {
                    id
                    title
                    blogSlug
                    createdAt
                    feturedImage {
                      url
                      width
                      height
                    }
                    taxonomies {
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const data = await graphqlRequest<{ navigations: Navigation[] }>(query, { locale: [locale] });
  const navigation = data?.navigations[0] || null;

  // Post-process to add display names to blog post taxonomies in Mega Menu (SubNav2)
  if (navigation?.navItems) {
    navigation.navItems.forEach(item => {
      if (item.subNavs) {
        item.subNavs.forEach(sub => {
          if ('target' in sub && Array.isArray(sub.target)) {
            sub.target.forEach((post: any) => {
              if (post.__typename === 'BlogPost' && post.taxonomies) {
                post.taxonomies = post.taxonomies.map((t: any) => ({
                  ...t,
                  displayName: getTaxonomyDisplayName(t.value)
                }));
              }
            });
          }
        });
      }
    });
  }

  return navigation;
}

export async function fetchProductsByCategory(categorySlug: string, excludeId?: string): Promise<Product[]> {
  const query = /* GraphQL */ `
    query GetProductsByCategory($categorySlug: String!) {
      products(where: { productCategory_some: { categorySlug: $categorySlug } }, first: 4) {
        id
        title
        productSlug
        productPrice { price }
        gallery {
          url
          altText
        }
      }
    }
  `;

  const data = await graphqlRequest<{ products: Product[] }>(query, { categorySlug });
  let products = data?.products ?? [];

  return products.slice(0, 3);
}

export async function fetchTaxonomyNodes(): Promise<Taxonomy[]> {
  // Aggregate from products and blog posts as a reliable way to get all USED tags
  const query = /* GraphQL */ `
    query GetAllTaxonomies {
      blogPosts(first: 100) {
        taxonomies {
          value
        }
      }
      productTaxonomies(first: 100) {
        taxonomies {
          value
        }
      }
    }
  `;

  try {
    const data = await graphqlRequest<{
      blogPosts: { taxonomies: { value: string }[] }[],
      productTaxonomies: { taxonomies: { value: string }[] }[]
    }>(query);

    const values = new Set<string>();

    data?.blogPosts?.forEach(p => p.taxonomies?.forEach(t => values.add(t.value)));
    data?.productTaxonomies?.forEach(pt => pt.taxonomies?.forEach(t => values.add(t.value)));

    return Array.from(values).map(v => ({
      displayName: getTaxonomyDisplayName(v),
      value: v
    }));
  } catch (e) {
    console.error("Failed to fetch taxonomy nodes", e);
    return [];
  }
}

export async function fetchContentByTaxonomy(value: string): Promise<{ products: Product[], blogPosts: BlogPost[] }> {
  // We use string for value and match against the TaxonomyNode.value
  const query = /* GraphQL */ `
    query GetContentByTaxonomy($value: String!) {
      productTaxonomies(where: { taxonomies_contains_some: [{ value: $value }] }) {
        productSlug
      }
      blogPosts(where: { taxonomies_contains_some: [{ value: $value }] }) {
        id
        title
        blogSlug
        excerpt
        blogTime
        feturedImage { url altText }
        taxonomies { value }
      }
    }
  `;

  const data = await graphqlRequest<{
    blogPosts: any[],
    productTaxonomies: { productSlug: string }[]
  }>(query, { value });

  if (!data) {
    return { products: [], blogPosts: [] };
  }

  const ptSlugs = (data.productTaxonomies || []).map(pt => pt.productSlug).filter(Boolean);

  // If there are products linked via the join model that weren't in the direct query, fetch them
  let allProducts: Product[] = [];
  if (ptSlugs.length > 0) {
    const queryBySlugs = /* GraphQL */ `
      query GetProductsBySlugs($slugs: [String!]) {
        products(where: { productSlug_in: $slugs }) {
          id
          title
          productSlug
          productPrice { price }
          gallery { url altText }
        }
        productTaxonomies(where: { productSlug_in: $slugs }) {
          productSlug
          taxonomies { value }
        }
      }
    `;
    const dataBySlugs = await graphqlRequest<{
      products: Product[],
      productTaxonomies: { productSlug: string, taxonomies: { value: string }[] }[]
    }>(queryBySlugs, { slugs: ptSlugs });

    if (dataBySlugs?.products) {
      const taxonomyMap = new Map<string, Taxonomy[]>();
      dataBySlugs.productTaxonomies?.forEach(pt => {
        if (pt.productSlug) {
          taxonomyMap.set(pt.productSlug, pt.taxonomies.map(t => ({
            displayName: getTaxonomyDisplayName(t.value),
            value: t.value
          })));
        }
      });

      // Merge unique by ID
      const existingIds = new Set(allProducts.map(p => p.id));
      dataBySlugs.products.forEach(p => {
        if (!existingIds.has(p.id)) {
          const productWithTax = {
            ...p,
            taxonomies: taxonomyMap.get(p.productSlug || p.id) || []
          };
          allProducts.push(productWithTax);
        }
      });
    }
  }

  // Final map to ensure display names are populated
  const finalProducts = allProducts.map(p => ({
    ...p,
    taxonomies: p.taxonomies?.map((t: any) => ({
      displayName: getTaxonomyDisplayName(t.value),
      value: t.value
    })) || []
  }));

  const blogPosts = (data?.blogPosts || []).map(post => ({
    ...post,
    taxonomies: post.taxonomies?.map((t: any) => ({
      displayName: getTaxonomyDisplayName(t.value),
      value: t.value
    })) || []
  }));

  return { products: finalProducts, blogPosts };
}

export async function fetchCollectionPageData(locale: string = 'en'): Promise<CollectionPageData | null> {
  const query = /* GraphQL */ `
    query GetCollectionPage($locale: [Locale!]!) {
      collectionPages(where: { pageSlug: "collection" }, locales: $locale, first: 1) {
        id
        title
        subtitle
        pageSlug
        seo { title description }
      }
    }
  `;
  const data = await graphqlRequest<{ collectionPages: CollectionPageData[] }>(query, { locale: [locale] });
  return data?.collectionPages?.[0] ?? null;
}

export async function fetchBlogPageData(locale: string = 'en'): Promise<BlogPageData | null> {
  const query = /* GraphQL */ `
    query GetBlogPage($locales: [Locale!]!) {
      blogPages(where: { pageSlug: "blog" }, locales: $locales) {
        id
        title
        subtitle
        pageSlug
        seo { title description }
      }
    }
  `;
  const data = await graphqlRequest<{ blogPages: BlogPageData[] }>(query, { locales: [locale] });
  return data?.blogPages?.[0] ?? null;
}

export async function fetchPersonalisationPageData(locale: string = 'en'): Promise<PersonalisationPage | null> {
  const query = /* GraphQL */ `
    query GetPersonalisationPage($locales: [Locale!]!) {
      personalisationPages(where: { pageSlug: "personalisation" }, locales: $locales) {
        id
        title
        subtitle
        pageSlug
      }
    }
  `;
  const data = await graphqlRequest<{ personalisationPages: PersonalisationPage[] }>(query, { locales: [locale] });
  return data?.personalisationPages?.[0] ?? null;
}
