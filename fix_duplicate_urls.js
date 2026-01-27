
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
        return null;
    }
    return json.data;
}

async function main() {
    console.log("Fetching all Links...");

    const linksData = await graphqlRequest(`
    query {
      links(first: 100) {
        id
        url
        openNewTab
      }
    }
  `);

    if (!linksData) {
        console.error("Failed to fetch links");
        return;
    }

    const links = linksData.links;
    console.log(`Found ${links.length} links total.`);

    // Find duplicates
    const urlMap = {};
    links.forEach(link => {
        if (!urlMap[link.url]) {
            urlMap[link.url] = [];
        }
        urlMap[link.url].push(link);
    });

    const duplicates = Object.entries(urlMap).filter(([url, items]) => items.length > 1);

    console.log(`\nFound ${duplicates.length} duplicate URLs:`);
    duplicates.forEach(([url, items]) => {
        console.log(`\n  URL: ${url}`);
        console.log(`  Instances: ${items.length}`);
        items.forEach((item, idx) => {
            console.log(`    ${idx + 1}. ID: ${item.id}`);
        });
    });

    // Delete duplicates (keep first, delete rest)
    for (const [url, items] of duplicates) {
        console.log(`\nProcessing duplicates for: ${url}`);
        const toDelete = items.slice(1); // Keep first, delete rest

        for (const link of toDelete) {
            console.log(`  Deleting Link ID: ${link.id}`);
            try {
                await graphqlRequest(`
          mutation {
            deleteLink(where: { id: "${link.id}" }) { id }
          }
        `);
                console.log(`    ✓ Deleted`);
            } catch (e) {
                console.error(`    ✗ Failed:`, e.message);
            }
        }
    }

    console.log("\nDone! Now attempting to publish landing page...");

    const landingPageId = "cmkqow2o3rhdm072v3pecq1dk";
    const publishResult = await graphqlRequest(`
    mutation {
      publishLandingPage(where: { id: "${landingPageId}" }, to: PUBLISHED) { id }
    }
  `);

    if (publishResult) {
        console.log("✓ Landing page published successfully!");
    } else {
        console.error("✗ Failed to publish landing page");
    }
}

main().catch(console.error);
