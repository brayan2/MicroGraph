
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

async function run() {
    console.log("Fetching current homepage and products...");
    const data = await graphqlRequest(`
    query {
      landingPages(where: { pageSlug: "home-v3" }) {
        id
        sections {
          ... on Cta { __typename id ctaTxt buttonLabel buttonLink { url } }
          ... on ProductGrid { __typename id heading }
          ... on BlogTeasersSection { __typename id heading }
          ... on RemoteReviewsSection { __typename id heading }
          ... on HeroSlider { __typename id title }
        }
      }
      products(first: 5) { id }
    }
  `);

    if (!data?.landingPages?.[0]) return console.error("Home v3 not found");
    const lp = data.landingPages[0];
    const prodIds = data.products.map(p => p.id);

    console.log("Existing sections:", lp.sections.map(s => s.__typename || "Unknown"));

    // Format sections for re-creation. We'll prepend the HeroSlider.
    // We exclude any existing sliders to avoid duplicates.
    const otherSections = lp.sections.filter(s => s.__typename !== "HeroSlider");

    const createInput = [
        {
            HeroSlider: {
                title: "Featured Highlights",
                items: { connect: prodIds.map(id => ({ id })) }
            }
        },
        ...otherSections.map(s => {
            const type = s.__typename;
            if (type === "Cta") {
                return { Cta: { ctaTxt: s.ctaTxt, buttonLabel: s.buttonLabel, buttonLink: s.buttonLink ? { create: { url: s.buttonLink.url } } : null } };
            }
            if (type === "ProductGrid") {
                return { ProductGrid: { heading: s.heading } };
            }
            if (type === "BlogTeasersSection") {
                return { BlogTeasersSection: { heading: s.heading } };
            }
            if (type === "RemoteReviewsSection") {
                return { RemoteReviewsSection: { heading: s.heading } };
            }
            return null;
        }).filter(Boolean)
    ];

    console.log("Updating LandingPage sections...");
    const updateRes = await graphqlRequest(`
    mutation UpdateLP($id: ID!, $sections: [LandingPagesectionsUnionCreateInput!]) {
      updateLandingPage(
        where: { id: $id }
        data: {
          sections: {
            delete: { all: true },
            create: $sections
          }
        }
      ) {
        id
      }
    }
  `, { id: lp.id, sections: createInput });

    if (updateRes) {
        console.log("Success! Publishing...");
        await graphqlRequest(`mutation { publishLandingPage(where: { id: "${lp.id}" }, to: PUBLISHED) { id } }`);
    }
}

run();
