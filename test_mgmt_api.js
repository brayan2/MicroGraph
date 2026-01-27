
const fs = require('fs');

async function testManagement() {
  const envContent = fs.readFileSync('.env', 'utf8');
  const tokenMatch = envContent.match(/VITE_HYGRAPH_TOKEN=(.*)/);
  if (!tokenMatch) {
    console.error("Token not found in .env");
    return;
  }
  const token = tokenMatch[1].trim();
  const endpoint = "https://management-next.graphcms.com/v2/cmfc5wvn401kl08v2so36gw1l/master";

  const query = `
    query {
      viewer {
        project(id: "cmfc5wvn401kl08v2so36gw1l") {
          id
          name
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(err);
  }
}

testManagement();
