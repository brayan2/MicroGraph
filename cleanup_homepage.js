
const endpoint = "https://api-ap-southeast-2.hygraph.com/v2/cmfc5wvn401kl08v2so36gw1l/master";
const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImdjbXMtbWFpbi1wcm9kdWN0aW9uIn0.eyJ2ZXJzaW9uIjozLCJpYXQiOjE3NjQ2NjU5NzgsImF1ZCI6WyJodHRwczovL2FwaS1hcC1zb3V0aGVhc3QtMi5oeWdyYXBoLmNvbS92Mi9jbWZjNXd2bjQwMWtsMDh2MnNvMzZndzFsL21hc3RlciIsIm1hbmFnZW1lbnQtbmV4dC5ncmFwaGNtcy5jb20iXSwiaXNzIjoiaHR0cHM6Ly9tYW5hZ2VtZW50LWFwLXNvdXRoZWFzdC0yLmh5Z3JhcGguY29tLyIsInN1YiI6IjIwMmRlYzM2LTg2YjYtNDM3OC1hYmIwLTFiYzRjNjg4ZGQzOSIsImp0aSI6ImNtaW9jazczaDAxbmQwNzJ0MDF4ODM2dTcifQ.cbNOHhSkxNysJqx9gsY3pFFzoPkJOPx1AY_vR4EJJWRto4qG4RN-1y2YpeVR24aSGZ5rRMUjVHRfgFOe-xgdiVPCHQw36xrbzuTocGtWOr6eSPMuNm7uZDEuiWNdiGTbxMuzh0OvGN8tXLGcMsVUw3w6TFcLP3Rv5xAaXSISeN5OJL6_Cq7oT0SP9SP7KbcD1sVFYXCoC9DTchHbJYNd0I6CecOUH3Sy8mzuXr6YQxJ73FtoXQJwwefpY4Xg3rTLeOCl7JrAQ85tWe8qmMCuFEQdUXU2kMY9Ok9nVIQDL7ZdoLpftW89giihrJivqv6CTOBADV8XUu5VLMeXbLuSBRb4xmcbDOIX0_7THK_gZAolKQ3KZdbxgrNd1246Mv1P472SwFLCc0Hs3jpalxGBCk9Za4DtHEEGpmb96u84VCpna-a7g2LoHiZZMcOZYXMpJi1iRwVJKk_1Ij87_SCM9OFme9rWG0AM_-3qI0wSbq3O8oFfhLVqU8kFu7yYa5n-XO8VqzuFsVVnc1V0UukJ9Mv1KrOt7Y_DgWebT0DO5WcMfr9wCijcutP3jUFjVKQYE7qSX3VsigJngPdDeY0vDDujWK4pTdvg9V14MpQPKUcVShpJU0gweTmOboVZp6VGHwxVAN5dhUrdOiLawnPRhSyVHSZUt-lTovHUY3iaZgQ";

const client = {
  request: async (query, variables = {}) => {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) {
      console.error(JSON.stringify(json.errors, null, 2));
      throw new Error("GraphQL Error");
    }
    return json.data;
  }
};

async function cleanupHomepage() {
  console.log("Starting Homepage Cleanup (Recreation Strategy)...");

  // 1. Get Landing Page ID and Current Sections to extract data
  const data = await client.request(`
    query {
      landingPages(where: { pageSlug: "home-v3" }) {
        id
        sections {
          __typename
          ... on Cta {
            id
            ctaTxt
            buttonLabel
            buttonLink { url openNewTab }
            ctaNested { ctaTxt buttonLabel }
          }
          ... on ProductGrid {
            id
            heading
            products { id }
          }
        }
      }
    }
  `);

  if (!data.landingPages.length) throw new Error("Landing page not found");
  const landingPage = data.landingPages[0];
  const allSections = landingPage.sections;

  // Identify the "Good" data to preserve
  const goodGrid = allSections.find(s => s.__typename === 'ProductGrid' && s.products && s.products.length > 0);

  // extract data variables
  const productIds = goodGrid ? goodGrid.products.map(p => ({ id: p.id })) : [];

  // IDs to delete (ALL current IDs)
  const idsToDelete = allSections.map(s => {
    // Map __typename to key
    return { [s.__typename]: { id: s.id } };
  });

  console.log(`Found ${idsToDelete.length} sections to delete.`);
  console.log("Recreating 3 clean sections (Hero -> Grid -> Footer) with links...");

  // 2. Delete ALL and Create NEW in correct order
  await client.request(`
    mutation ResetLandingPageSections($id: ID!, $idsToDelete: [LandingPagesectionsUnionWhereUniqueInput!], $productConnect: [ProductWhereUniqueInput!]) {
      updateLandingPage(
        where: { id: $id }
        data: {
          sections: {
            delete: $idsToDelete,
            create: [
              {
                Cta: {
                  data: {
                    ctaTxt: "Welcome to Micro-Store",
                    buttonLabel: "Shop Now",
                    buttonLink: {
                      create: {
                        url: "https://micro-store.demo/collection?v=home",
                        openNewTab: false
                      }
                    },
                    ctaNested: {
                      create: [
                        { ctaTxt: "Discover amazing products powered by Hygraph CMS" },
                        { 
                          buttonLabel: "Read Blog",
                          buttonLink: {
                            create: {
                              url: "https://micro-store.demo/blog?v=home",
                              openNewTab: false
                            }
                          }
                        }
                      ]
                    }
                  }
                }
              },
              {
                ProductGrid: {
                  data: {
                    heading: "Featured Products",
                    products: { connect: $productConnect }
                  }
                }
              },
              {
                Cta: {
                  data: {
                    ctaTxt: "Ready to get started?",
                    buttonLabel: "Browse Collection",
                    buttonLink: {
                      create: {
                        url: "https://micro-store.demo/collection?v=footer",
                        openNewTab: false
                      }
                    }
                  }
                }
              }
            ]
          }
        }
      ) {
        id
        sections {
          __typename
        }
      }
    }
  `, {
    id: landingPage.id,
    idsToDelete: idsToDelete,
    productConnect: productIds
  });

  // 3. Publish
  console.log("Publishing Landing Page...");
  await client.request(`
    mutation PublishAll($id: ID!) {
      publishLandingPage(where: { id: $id }, to: PUBLISHED) { id }
    }
  `, {
    id: landingPage.id
  });

  console.log("✅ Homepage cleaned up and Links created!");
}

cleanupHomepage().catch(console.error);
