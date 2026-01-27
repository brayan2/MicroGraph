
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
        console.error("Errors:", JSON.stringify(json.errors, null, 2));
        return null;
    }
    return json.data;
}

async function finalizeSlider() {
    console.log("Fetching current sections and products...");
    const data = await graphqlRequest(`
    query {
      landingPages(where: { pageSlug: "home-v3" }) {
        id
        sections {
          ... on HeroSlider {
            __typename
            id
            title
          }
          ... on Cta {
            __typename
            id
            ctaTxt
          }
          ... on ProductGrid {
            __typename
            id
          }
          ... on BlogTeasersSection {
            __typename
            id
          }
          ... on RemoteReviewsSection {
            __typename
            id
          }
        }
      }
      products(first: 5) {
        id
        title
      }
    }
  `);

    if (!data?.landingPages?.[0]) {
        console.error("Landing page not found");
        return;
    }

    const lp = data.landingPages[0];
    const products = data.products || [];
    const productIds = products.map(p => p.id);

    console.log("Current sections order:", lp.sections.map(s => s.__typename || "Unknown"));

    // Find the slider
    let sliderIndex = lp.sections.findIndex(s => s.__typename === "HeroSlider");
    let sliderId = null;

    if (sliderIndex !== -1) {
        sliderId = lp.sections[sliderIndex].id;
        console.log(`Found existing slider with ID: ${sliderId}`);
    } else {
        console.log("No HeroSlider found in sections. We will create one.");
    }

    // Update logic:
    // We want to update the HeroSlider to have products, then update LandingPage to have it at the top.

    if (sliderId) {
        console.log("Updating HeroSlider with products...");
        await graphqlRequest(`
      mutation UpdateHeroSlider($id: ID!, $productIds: [ID!]) {
        updateHeroSlider(
          where: { id: $id }
          data: { items: { connect: { where: { id_in: $productIds } } } }
        ) {
          id
        }
        publishHeroSlider(where: { id: $id }, to: PUBLISHED) { id }
      }
    `, { id: sliderId, productIds });
    }

    // Reorder sections
    let newSections = [...lp.sections];
    if (sliderIndex !== -1) {
        const [slider] = newSections.splice(sliderIndex, 1);
        newSections.unshift(slider);
    } else {
        // If somehow not found in previous check but maybe it exists as a model? 
        // Let's just create a new one embedded if it wasn't there.
        newSections.unshift({
            HeroSlider: {
                title: "Featured Collection",
                items: { connect: productIds.map(id => ({ where: { id } })) }
            }
        });
    }

    console.log("New sections order:", newSections.map(s => s.__typename || "NewHeroSlider"));

    // In Hygraph, setting a Modular field requires a slightly different syntax for update if we want to overwrite.
    // We'll use the 'set' approach if supported, or clear and recreate.
    // Actually, 'sections: { set: [...] }' is often available.

    const formattedSections = newSections.map(s => {
        if (s.__typename === "HeroSlider") return { HeroSlider: { id: s.id } };
        if (s.__typename === "Cta") return { Cta: { id: s.id } };
        if (s.__typename === "ProductGrid") return { ProductGrid: { id: s.id } };
        if (s.__typename === "BlogTeasersSection") return { BlogTeasersSection: { id: s.id } };
        if (s.__typename === "RemoteReviewsSection") return { RemoteReviewsSection: { id: s.id } };
        return s; // Fallback
    });

    console.log("Updating LandingPage sections...");
    const updateRes = await graphqlRequest(`
    mutation UpdateLP($id: ID!, $sections: [LandingPagesectionsMemberUpdateInput!]) {
      updateLandingPage(
        where: { id: $id }
        data: { sections: { set: $sections } }
      ) {
        id
      }
      publishLandingPage(where: { id: $id }, to: PUBLISHED) { id }
    }
  `, { id: lp.id, sections: formattedSections });

    if (updateRes) {
        console.log("Successfully updated LandingPage and published!");
    }
}

finalizeSlider();
