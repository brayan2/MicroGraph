
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
    console.log("Fetching current Homepage sections...");

    // 1. Fetch Page
    const lpData = await graphqlRequest(`
    query {
      landingPages(where: { pageSlug: "home-v3" }, first: 1) {
        id
        sections {
          ... on Cta { __typename id }
          ... on ProductGrid { __typename id }
          ... on HeroSlider { __typename id items { id } }
          ... on BlogTeasersSection { __typename id }
          ... on RemoteReviewsSection { __typename id }
        }
      }
    }
  `);

    const landingPage = lpData.landingPages[0];
    if (!landingPage) throw new Error("Landing Page 'home-v3' not found.");

    // 2. Find Slider & Reorder
    const sliderIndex = landingPage.sections.findIndex(s => s.__typename === 'HeroSlider');

    if (sliderIndex === -1) {
        throw new Error("HeroSlider not found on the page.");
    }

    const slider = landingPage.sections[sliderIndex];
    console.log(`Found HeroSlider (ID: ${slider.id}) at index ${sliderIndex}. Moving to top.`);

    /* 
       Logic: Remove from current position, unshift to front.
    */
    const newSections = [...landingPage.sections];
    newSections.splice(sliderIndex, 1); // remove
    newSections.unshift(slider); // add to front

    /*
       Logic 2: Check items. If items are empty, user asked to "Assign products".
       But I cannot update the HeroSlider directly (no permission).
       However, I can notify the user if it's empty.
    */
    if (!slider.items || slider.items.length === 0) {
        console.warn("WARNING: HeroSlider has no items! I cannot add them (permission denined), but I will position the slider.");
    }


    // 3. Update Landing Page
    // Construct Update Input: { [TypeName]: { where: { id: ID } } }
    const sectionsInput = newSections.map(s => {
        return { [s.__typename]: { where: { id: s.id } } };
    });

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

    await graphqlRequest(updateLpMutation, {
        id: landingPage.id,
        sections: sectionsInput
    });

    console.log("Publishing Landing Page...");
    await graphqlRequest(`mutation { publishLandingPage(where: { id: "${landingPage.id}" }, to: PUBLISHED) { id } }`);

    console.log("HeroSlider moved to top successfully!");
}

main().catch(console.error);
