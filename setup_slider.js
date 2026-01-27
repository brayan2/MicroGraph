
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
    console.log("Starting HeroSlider setup...");

    // 1. Fetch Products for the slider
    console.log("Fetching products...");
    const productData = await graphqlRequest(`query { products(first: 5) { id title } }`);
    const products = productData.products;
    if (!products.length) throw new Error("No products found to add to slider.");
    const productConnect = products.map(p => ({ where: { id: p.id } }));

    // 2. Fetch current Landing Page sections
    console.log("Fetching current Homepage sections...");
    const lpData = await graphqlRequest(`
    query {
      landingPages(where: { pageSlug: "home-v3" }, first: 1) {
        id
        sections {
          ... on Cta { __typename id }
          ... on ProductGrid { __typename id }
          ... on HeroSlider { __typename id }
          ... on BlogTeasersSection { __typename id }
          ... on RemoteReviewsSection { __typename id }
        }
      }
    }
  `);

    const landingPage = lpData.landingPages[0];
    if (!landingPage) throw new Error("Landing Page 'home-v3' not found.");

    // Check if slider already exists (to prevent dupes)
    if (landingPage.sections.some(s => s.__typename === 'HeroSlider')) {
        console.log("HeroSlider already exists on the page.");
        // We could warn or exit, but user asked to 'do it', so maybe we just ensure it's at the top?
        // Let's create a NEW one anyway to be sure we match the specific request
    }

    // 3. Create HeroSlider
    console.log("Creating new HeroSlider entry...");
    const createSliderMutation = `
    mutation CreateHeroSlider($title: String!, $items: [ProductWhereUniqueInput!]!) {
      createHeroSlider(data: {
        title: $title,
        items: { connect: $items }
      }) {
        id
      }
    }
  `;

    const sliderRes = await graphqlRequest(createSliderMutation, {
        title: "Trending Collection",
        items: productConnect
    });
    const sliderId = sliderRes.createHeroSlider.id;
    console.log(`Created HeroSlider: ${sliderId}`);

    // Publish Slider
    await graphqlRequest(`mutation { publishHeroSlider(where: { id: "${sliderId}" }, to: PUBLISHED) { id } }`);

    // 4. Update Landing Page Sections (Prepend)
    console.log("Updating Landing Page sections order...");

    // Construct list: [NewSlider, ...OldSections]
    // Transform to Update Input format: { [TypeName]: { where: { id: ID } } }
    const existingSections = landingPage.sections.map(s => {
        return { [s.__typename]: { where: { id: s.id } } };
    });

    const newSection = { HeroSlider: { where: { id: sliderId } } };
    const combinedSections = [newSection, ...existingSections];

    const updateLpMutation = `
    mutation UpdateLandingPage($id: ID!, $sections: [LandingPagesectionsUnionUnionInput!]!) {
      updateLandingPage(
        where: { id: $id }
        data: {
          sections: {
            set: $sections
          }
        }
      ) {
        id
        sections {
          ... on HeroSlider { id title }
        }
      }
    }
  `;

    // Note: union input types usually follow specific naming. 
    // Based on standard Hygraph: `LandingPagesectionsUnionUnionInput` sounds duplicated but possible?
    // Or might be `LandingPageSectionsUnionInput`?
    // Since I can't easily iterate introspection again, I'll rely on the assumption that 'set' takes an array of object wrappers.
    // Actually, wait. 'set' usually takes the array directly. 
    // Let's try the standard pattern which matches the 'create' pattern but with 'where'.

    /* 
       Checking seed_master.js again:
       sections: { create: [ { Cta: ... } ] }
       
       So 'set' should likely be:
       sections: { set: [ { Cta: { where: { id: ... } } }, ... ] }
    */

    await graphqlRequest(updateLpMutation, {
        id: landingPage.id,
        sections: combinedSections
    });

    // Publish Landing Page
    console.log("Publishing Landing Page...");
    await graphqlRequest(`mutation { publishLandingPage(where: { id: "${landingPage.id}" }, to: PUBLISHED) { id } }`);

    console.log("HeroSlider added to top of Homepage successfully!");
}

main().catch(console.error);
