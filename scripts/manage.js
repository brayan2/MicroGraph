
const { graphqlRequest } = require('./config');

const unique = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const getUrl = (path) => `https://micro-store.demo${path}?uid=${unique()}`;

/**
 * Seed the database with master content
 */
const seedData = async () => {
    console.log("Starting master seeding process...");

    // 0. Prefetch Asset
    const assets = (await graphqlRequest("{ assets(first: 1) { id } }"))?.assets || [];
    const mainAssetId = assets[0]?.id;
    if (!mainAssetId) {
        console.error("No assets found. Upload an asset first.");
        return;
    }

    // 1. Blog Author
    const authorRes = await graphqlRequest(`
        mutation {
            upsertBlogAuthor(
                where: { authorSlug: "master-brian" }
                upsert: {
                    create: {
                        authorName: "Brian Master",
                        authorSlug: "master-brian",
                        authorAbout: "Founder of Micro-Store.",
                        caseDescription: { children: [{ type: "paragraph", children: [{ text: "Expert in minimalist design." }] }] }
                    },
                    update: { authorName: "Brian Master" }
                }
            ) { id }
        }
    `);
    const authorId = authorRes?.upsertBlogAuthor?.id;
    if (authorId) await graphqlRequest(`mutation { publishBlogAuthor(where: { id: "${authorId}" }, to: PUBLISHED) { id } }`);

    // 2. Navigation
    const navRes = await graphqlRequest(`
        mutation {
            createNavigation(data: {
                title: "Primary Nav ${unique()}", 
                navItmes: {
                    create: {
                        label: "Main Menu",
                        mulitpleLinks: {
                            create: [
                                { Link: { url: "${getUrl('/')}", openNewTab: false } },
                                { Link: { url: "${getUrl('/collection')}", openNewTab: false } },
                                { Link: { url: "${getUrl('/blog')}", openNewTab: false } }
                            ]
                        }
                    }
                }
            }) { id }
        }
    `);
    if (navRes?.createNavigation) await graphqlRequest(`mutation { publishNavigation(where: { id: "${navRes.createNavigation.id}" }, to: PUBLISHED) { id } }`);

    // 3. Product with Variants
    const prodRes = await graphqlRequest(`
        mutation CreateProduct($assetId: ID!) {
            upsertProduct(
                where: { productSlug: "ultimate-tee" }
                upsert: {
                    create: {
                        title: "Ultimate Artist Tee",
                        productSlug: "ultimate-tee",
                        productStatus: inStock,
                        productPrice: { create: { price: 55.0 } },
                        gallery: { connect: [{ id: $assetId }] },
                        productAttributes: { create: { attributeKey: [material] } },
                        productVariants: {
                            create: [
                                { ClothesVariants: { label: "White - M", clothesSize: m, clothesColor: white } },
                                { ClothesVariants: { label: "Black - L", clothesSize: l, clothesColor: black } }
                             ]
                        }
                    },
                    update: { title: "Ultimate Artist Tee" }
                }
            ) { id }
        }
    `, { assetId: mainAssetId });
    if (prodRes?.upsertProduct) await graphqlRequest(`mutation { publishProduct(where: { id: "${prodRes.upsertProduct.id}" }, to: PUBLISHED) { id } }`);

    // 4. Landing Page
    const lpRes = await graphqlRequest(`
        mutation {
            upsertLandingPage(
                where: { pageSlug: "home-v3" }
                upsert: {
                    create: {
                        title: "Home",
                        pageSlug: "home-v3",
                        seoV2: {
                            create: [
                                { ctaTxt: "Minimalist Life", buttonLabel: "Join", buttonLink: { create: { url: "${getUrl('/join')}", openNewTab: false } } }
                            ]
                        },
                        sections: {
                            create: [
                                { Cta: { ctaTxt: "Welcome to Micro-Store", buttonLabel: "Shop Now", buttonLink: { create: { url: "${getUrl('/collection')}", openNewTab: false } } } },
                                { ProductGrid: { heading: "Featured Products" } },
                                { Cta: { ctaTxt: "Ready to get started?", buttonLabel: "Browse Collection", buttonLink: { create: { url: "${getUrl('/collection')}", openNewTab: false } } } }
                            ]
                        }
                    },
                    update: { title: "Home" }
                }
            ) { id }
        }
    `);
    if (lpRes?.upsertLandingPage) await graphqlRequest(`mutation { publishLandingPage(where: { id: "${lpRes.upsertLandingPage.id}" }, to: PUBLISHED) { id } }`);

    console.log("Master seeding complete!");
};

/**
 * Test nested related products query
 */
const testRelated = async () => {
    console.log("Testing relatedProducts nested query...");

    const data = await graphqlRequest(`
    query {
      products(first: 3) {
        title
        relatedProducts {
          id
          product {
            id
            title
            productPrice { price }
          }
        }
      }
    }
  `);

    if (data?.products) {
        data.products.forEach(p => {
            console.log(`\nProduct: ${p.title}`);
            if (p.relatedProducts) {
                console.log(`  Related Wrapper ID: ${p.relatedProducts.id}`);
                console.log(`  Inner Products: ${p.relatedProducts.product.length}`);
                p.relatedProducts.product.forEach(rp => console.log(`    - ${rp.title}`));
            } else {
                console.log("  relatedProducts is null");
            }
        });
    }
};

const main = async () => {
    const args = process.argv.slice(2);
    const command = args[0];

    switch (command) {
        case 'seed':
            await seedData();
            break;
        case 'test-related':
            await testRelated();
            break;
        default:
            console.log("Usage: node scripts/manage.js <command>");
            console.log("Commands:");
            console.log("  seed          - Seed the database with master content");
            console.log("  test-related  - Test nested related products query");
    }
};

main().catch(console.error);
