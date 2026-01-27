
const endpoint = "https://api-ap-southeast-2.hygraph.com/v2/cmfc5wvn401kl08v2so36gw1l/master";
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NjQ2NjU5NzgsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aGVhc3QtMi5oeWdyYXBoLmNvbS92Mi9jbWZjNXd2bjQwMWtsMDh2MnNvMzZndzFsL21hc3RlciIsIm1hbmFnZW1lbnQtbmV4dC5ncmFwaGNtcy5jb20iXSwiaXNzIjoiaHR0cHM6Ly9tYW5hZ2VtZW50LWFwLXNvdXRoZWFzdC0yLmh5Z3JhcGguY29tLyIsInN1YiI6IjIwMmRlYzM2LTg2YjYtNDM3OC1hYmIwLTFiYzRjNjg4ZGQzOSIsImp0aSI6ImNtaW9jazczaDAxbmQwNzJ0MDF4ODM2dTcifQ.cbNOHhSkxNysJqx9gsY3pFFzoPkJOPx1AY_vR4EJJWRto4qG4RN-1y2YpeVR24aSGZ5rRMUjVHRfgFOe-xgdiVPCHQw36xrbzuTocGtWOr6eSPMuNm7uZDEuiWNdiGTbxMuzh0OvGN8tXLGcMsVUw3w6TFcLP3Rv5xAaXSISeN5OJL6_Cq7oT0SP9SP7KbcD1sVFYXCoC9DTchHbJYNd0I6CecOUH3Sy8mzuXr6YQxJ73FtoXQJwwefpY4Xg3rTLeOCl7JrAQ85tWe8qmMCuFEQdUXU2kMY9Ok9nVIQDL7ZdoLpftW89giihrJivqv6CTOBADV8XUu5VLMeXbLuSBRb4xmcbDOIX0_7THK_gZAolKQ3KZdbxgrNd1246Mv1P472SwFLCc0Hs3jpalxGBCk9Za4DtHEEGpmb96u84VCpna-a7g2LoHiZZMcOZYXMpJi1iRwVJKk_1Ij87_SCM9OFme9rWG0AM_-3qI0wSbq3O8oFfhLVqU8kFu7yYa5n-XO8VqzuFsVVnc1V0UukJ9Mv1KrOt7Y_DgWebT0DO5WcMfr9wCijcutP3jUFjVKQYE7qSX3VsigJngPdDeY0vDDujWK4pTdvg9V14MpQPKUcVShpJU0gweTmOboVZp6VGHwxVAN5dhUrdOiLawnPRhSyVHSZUt-lTovHUY3iaZgQ";

async function graphqlRequest(query, variables) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) {
    console.error("Mutation Errors:", JSON.stringify(json.errors, null, 2));
    return null;
  }
  return json.data;
}

const unique = () => Date.now().toString(36) + Math.random().toString(36).substr(2);
const getUrl = (path) => `https://micro-store.demo${path}?uid=${unique()}`;

const seedEverything = async () => {
  console.log("Starting master seeding process...");

  // 0. Prefetch Asset
  const assets = (await graphqlRequest("{ assets(first: 1) { id } }"))?.assets || [];
  const mainAssetId = assets[0]?.id;
  if (!mainAssetId) return console.error("No assets found.");

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
}

seedEverything().catch(console.error);
