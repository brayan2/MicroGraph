
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

const getUniqueUrl = (url) => {
    // Generate a unique suffix
    const suffix = `uid=${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    if (!url || url === "#") {
        return `#?${suffix}`;
    }

    // Check if url already has query params
    const separator = url.includes('?') ? '&' : '?';
    // Append unique suffix (preserving original params to be safe, or replacing?)
    // To be safe against "same value" error, we ALWAYS append.
    return `${url}${separator}${suffix}`;
};

async function main() {
    console.log("Fetching current page data...");
    const lpData = await graphqlRequest(`
    query {
      landingPages(where: { pageSlug: "home-v3" }, first: 1) {
        id
        sections {
          __typename
          ... on Cta { 
             id ctaTxt buttonLabel 
             buttonLink { url openNewTab } 
             ctaNested { 
               ctaTxt buttonLabel 
               buttonLink { url openNewTab } 
             }
          }
          ... on ProductGrid { id heading products { id } }
          ... on HeroSlider { id title items { id } }
        }
      }
    }
  `);

    const landingPage = lpData.landingPages[0];
    const oldSections = landingPage.sections;
    console.log("Existing sections:", oldSections.map(s => s.__typename));

    const existingSlider = oldSections.find(s => s.__typename === 'HeroSlider');
    let productsToConnect = [];
    if (existingSlider && existingSlider.items) {
        productsToConnect = existingSlider.items.map(p => ({ id: p.id }));
    } else {
        const pData = await graphqlRequest(`query { products(first: 5) { id } }`);
        productsToConnect = pData.products.map(p => ({ id: p.id }));
    }

    const newSectionsCreateInput = [];

    // 1. HeroSlider (Top)
    newSectionsCreateInput.push({
        HeroSlider: {
            data: {
                title: existingSlider?.title || "Featured Collection",
                items: { connect: productsToConnect }
            }
        }
    });

    // 2. Others
    for (const s of oldSections) {
        if (s.__typename === 'HeroSlider') continue;

        if (s.__typename === 'Cta') {
            const nestedCreate = s.ctaNested ? s.ctaNested.map(sub => ({
                ctaTxt: sub.ctaTxt,
                buttonLabel: sub.buttonLabel,
                buttonLink: sub.buttonLink ? { create: { url: getUniqueUrl(sub.buttonLink.url), openNewTab: sub.buttonLink.openNewTab } } : null
            })) : [];

            newSectionsCreateInput.push({
                Cta: {
                    data: {
                        ctaTxt: s.ctaTxt,
                        buttonLabel: s.buttonLabel,
                        // Note: creating NEW unique link 
                        buttonLink: s.buttonLink ? { create: { url: getUniqueUrl(s.buttonLink.url), openNewTab: s.buttonLink.openNewTab } } : null,
                        ctaNested: { create: nestedCreate }
                    }
                }
            });
        }
        else if (s.__typename === 'ProductGrid') {
            const pConnect = s.products ? s.products.map(p => ({ id: p.id })) : [];
            newSectionsCreateInput.push({
                ProductGrid: {
                    data: {
                        heading: s.heading,
                        products: { connect: pConnect }
                    }
                }
            });
        }
    }

    // Debug: Log URLs
    console.log("Plan - Sections to create:");
    newSectionsCreateInput.forEach((s, i) => {
        if (s.Cta) {
            console.log(`[${i}] Cta Link: ${s.Cta.data.buttonLink?.create?.url}`);
        }
    });

    // 3. EXECUTE
    console.log("Deleting old sections...");

    const deleteInputs = oldSections.map(s => {
        return { [s.__typename]: { id: s.id } };
    });

    if (deleteInputs.length > 0) {
        await graphqlRequest(`
        mutation DeleteSections($id: ID!, $idsToDelete: [LandingPagesectionsUnionWhereUniqueInput!]!) {
          updateLandingPage(
            where: { id: $id }
            data: {
              sections: {
                delete: $idsToDelete
              }
            }
          ) { id }
        }
      `, { id: landingPage.id, idsToDelete: deleteInputs });
    }

    console.log("Creating new sections in order...");
    await graphqlRequest(`
    mutation CreateSections($id: ID!, $sectionsToCreate: [LandingPagesectionsUnionCreateWithPositionInput!]!) {
      updateLandingPage(
        where: { id: $id }
        data: {
          sections: {
            create: $sectionsToCreate
          }
        }
      ) { id }
    }
  `, { id: landingPage.id, sectionsToCreate: newSectionsCreateInput });

    await graphqlRequest(`mutation { publishLandingPage(where: { id: "${landingPage.id}" }, to: PUBLISHED) { id } }`);
    console.log("Success! Homepage reordered.");
}

main().catch(console.error);
