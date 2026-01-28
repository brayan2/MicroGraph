const fs = require('fs');
const path = require('path');

// naive .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                env[key.trim()] = value.trim();
            }
        });
        return env;
    } catch (e) {
        console.warn('Could not read .env file');
        return {};
    }
}

const env = loadEnv();
const endpoint = env.VITE_HYGRAPH_ENDPOINT;
const token = env.VITE_HYGRAPH_TOKEN;

if (!endpoint || !token) {
    console.error('Missing VITE_HYGRAPH_ENDPOINT or VITE_HYGRAPH_TOKEN in .env');
    process.exit(1);
}

const typeToInspect = process.argv[2] || "Product";

async function inspectSchema() {
    // If user asks for "ALL", we just list all types? No, just support single type for now.
    // We also want to know possible types if it's a union.

    const query = `
    query Introspect {
      __type(name: "${typeToInspect}") {
        name
        kind
        fields {
            name
            type {
                name
                kind
                ofType {
                    name
                    kind
                }
            }
        }
        possibleTypes {
           name
           kind
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
        if (json.errors) {
            console.error('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
            return;
        }

        const data = json.data;
        console.log(`Type: ${typeToInspect}`);
        if (!data.__type) {
            console.log("Type not found.");
            return;
        }
        console.log("Kind:", data.__type.kind);
        if (data.__type.fields) {
            console.log("Fields:", JSON.stringify(data.__type.fields.map(f => ({
                name: f.name,
                type: f.type.name || f.type.ofType?.name || f.type.kind
            })), null, 2));
        }
        if (data.__type.possibleTypes) {
            console.log("Possible Types:", JSON.stringify(data.__type.possibleTypes.map(t => t.name), null, 2));
        }

    } catch (error) {
        console.error("Error inspecting schema:", error);
    }
}

inspectSchema();
