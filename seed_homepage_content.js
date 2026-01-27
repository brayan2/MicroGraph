
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

async function seedHomepageContent() {
  console.log("Starting Homepage Content Seeding (Component Strategy)...");

  // 1. Get Home Page ID and Products
  const initData = await client.request(`
    query {
      landingPages(where: { pageSlug: "home-v3" }) { id }
      products(first: 6) { id title }
    }
  `);

  if (!initData.landingPages.length) {
    console.error("Landing Page 'home-v3' not found.");
    return;
  }

  const landingPageId = initData.landingPages[0].id;
  const products = initData.products;
  console.log(`Found Landing Page: ${landingPageId}`);

  // 2. Update Landing Page with Components
  const productConnect = products.map(p => ({ id: p.id }));

  console.log("Updating Landing Page sections...");

  await client.request(`
    mutation UpdateLandingPage($id: ID!, $productConnect: [ProductWhereUniqueInput!]) {
      updateLandingPage(
        where: { id: $id }
        data: {
          sections: {
            create: [
              {
                Cta: {
                  data: {
                    ctaTxt: "Welcome to Micro-Store",
                    buttonLabel: "Shop Now",
                    ctaNested: {
                      create: [
                        {
                          ctaTxt: "Discover amazing products powered by Hygraph CMS"
                        },
                        {
                          buttonLabel: "Read Blog"
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
                     products: {
                       connect: $productConnect
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
          ... on Cta { ctaTxt }
          ... on ProductGrid { heading }
        }
      }
    }
  `, {
    id: landingPageId,
    productConnect: productConnect
  });

  // 3. Publish
  console.log("Publishing Landing Page...");
  await client.request(`
    mutation PublishAll($id: ID!) {
      publishLandingPage(where: { id: $id }, to: PUBLISHED) { id }
    }
  `, {
    id: landingPageId
  });

  console.log("✅ Homepage content seeded and published successfully!");
}

seedHomepageContent().catch(console.error);
