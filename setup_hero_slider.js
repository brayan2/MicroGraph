
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
    console.error("GraphQL Error:", JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

async function main() {
  console.log("Fetching home-v3 landing page...");

  // 1. Fetch the landing page with sections
  const lpData = await graphqlRequest(`
    query {
      landingPages(where: { pageSlug: "home-v3" }, first: 1) {
        id
        sections {
          __typename
          ... on HeroSlider { id title }
        }
      }
    }
  `);

  if (!lpData.landingPages || lpData.landingPages.length === 0) {
    console.error("Landing page 'home-v3' not found!");
    return;
  }

  const landingPage = lpData.landingPages[0];
  console.log(`Found landing page: ${landingPage.id}`);

  // 2. Check if HeroSlider already exists
  const existingSlider = landingPage.sections?.find(s => s.__typename === 'HeroSlider');

  if (existingSlider) {
    console.log(`HeroSlider already exists: ${existingSlider.id}`);
    console.log("Checking if it has products assigned...");

    // Fetch full slider details
    const sliderData = await graphqlRequest(`
      query {
        heroSliders(where: { id: "${existingSlider.id}" }, first: 1) {
          id
          title
          items { id title }
        }
      }
    `);

    if (sliderData.heroSliders?.[0]?.items?.length > 0) {
      console.log(`Slider already has ${sliderData.heroSliders[0].items.length} products assigned. Skipping.`);
      return;
    }

    console.log("Slider has no products. Updating...");

    // Fetch products
    const productsData = await graphqlRequest(`
      query {
        products(first: 6, orderBy: createdAt_DESC) { id }
      }
    `);

    const productIds = productsData.products.map(p => p.id);

    // Update slider with products
    await graphqlRequest(`
      mutation {
        updateHeroSlider(
          where: { id: "${existingSlider.id}" }
          data: { items: { connect: ${JSON.stringify(productIds.map(id => ({ id })))} } }
        ) { id }
      }
    `);

    console.log(`Updated HeroSlider with ${productIds.length} products.`);

    // Publish
    await graphqlRequest(`mutation { publishHeroSlider(where: { id: "${existingSlider.id}" }, to: PUBLISHED) { id } }`);
    await graphqlRequest(`mutation { publishLandingPage(where: { id: "${landingPage.id}" }, to: PUBLISHED) { id } }`);

    console.log("Published changes.");

  } else {
    console.log("No HeroSlider found. Creating one...");

    // Fetch products
    const productsData = await graphqlRequest(`
      query {
        products(first: 6, orderBy: createdAt_DESC) { id }
      }
    `);

    const productIds = productsData.products.map(p => p.id);

    // Create HeroSlider
    const createResult = await graphqlRequest(`
      mutation {
        createHeroSlider(data: {
          title: "Featured Collection"
          items: { connect: ${JSON.stringify(productIds.map(id => ({ id })))} }
        }) { id }
      }
    `);

    const newSliderId = createResult.createHeroSlider.id;
    console.log(`Created HeroSlider: ${newSliderId}`);

    // Publish the slider
    await graphqlRequest(`mutation { publishHeroSlider(where: { id: "${newSliderId}" }, to: PUBLISHED) { id } }`);

    // Add to landing page at the beginning of sections
    await graphqlRequest(`
      mutation {
        updateLandingPage(
          where: { id: "${landingPage.id}" }
          data: {
            sections: {
              connect: {
                HeroSlider: { id: "${newSliderId}" }
                position: { start: true }
              }
            }
          }
        ) { id }
      }
    `);

    console.log("Added HeroSlider to landing page at the top.");

    // Publish landing page
    await graphqlRequest(`mutation { publishLandingPage(where: { id: "${landingPage.id}" }, to: PUBLISHED) { id } }`);

    console.log("Published landing page.");
  }

  console.log("Done!");
}

main().catch(console.error);
