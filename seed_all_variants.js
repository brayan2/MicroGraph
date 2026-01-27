
const fs = require('fs');
const env = fs.readFileSync('/Users/briangathuita/Documents/Micro-Store/.env', 'utf8');
const endpoint = env.match(/VITE_HYGRAPH_ENDPOINT=(.*)/)[1].trim();
const token = env.match(/VITE_HYGRAPH_TOKEN=(.*)/)[1].trim();

async function graphqlRequest(query, variables) {
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        body: JSON.stringify({ query, variables })
    });
    const json = await res.json();
    if (json.errors) console.error("Error:", JSON.stringify(json.errors, null, 2));
    return json.data;
}

async function main() {
    // 1. Get Segments
    const segData = await graphqlRequest(`query { segments { id name } }`);
    const segments = segData.segments;
    const vip = segments.find(s => s.name === 'VIP');
    const newbie = segments.find(s => s.name === 'New Visitor');
    const minimalist = segments.find(s => s.name === 'Minimalist');

    // 2. Get Products
    const prodData = await graphqlRequest(`query { products(first: 20) { id title productPrice { price } } }`);
    const products = prodData.products;

    // 3. Get Blog Posts
    const blogData = await graphqlRequest(`query { blogPosts(first: 20) { id title excerpt } }`);
    const blogPosts = blogData.blogPosts;

    console.log(`Seeding variants for ${products.length} products and ${blogPosts.length} blog posts...`);

    // Helper to create product variants
    async function seedProductVariants(p) {
        console.log(`  Seeding variants for Product: ${p.title} (${p.id})`);

        // Remove old variants if any (clean slate) - though deleteMany is safer
        // Actually we don't have a clear field for deleteMany easily in the update mutation without knowing the variant IDs
        // We'll just add new ones for now or assume we're adding

        const mutations = [
            // VIP
            vip ? {
                title: `${p.title} - VIP Exclusive`,
                shortDescription: `A premium version of our ${p.title} reserved for our most valued customers. Crafted with even greater attention to detail.`,
                productPrice: { create: { price: (p.productPrice?.price || 0) * 1.5 } },
                segments: { connect: [{ id: vip.id }] }
            } : null,
            // Minimalist
            minimalist ? {
                title: `${p.title.split(' ')[0]} Essential`,
                shortDescription: `The essence of ${p.title}. No filler, just the core experience you love.`,
                productPrice: { create: { price: (p.productPrice?.price || 0) * 0.9 } },
                segments: { connect: [{ id: minimalist.id }] }
            } : null,
            // New Visitor
            newbie ? {
                title: `Welcome Special: ${p.title}`,
                shortDescription: `New here? We've tailored our classic ${p.title} just for your first visit. Discover why we're different.`,
                productPrice: { create: { price: (p.productPrice?.price || 0) * 0.8 } }, // Discount for new visitors
                segments: { connect: [{ id: newbie.id }] }
            } : null
        ].filter(Boolean);

        for (const vData of mutations) {
            const res = await graphqlRequest(`
                mutation($productId: ID!, $vData: [ProductVariantCreateInput!]!) {
                    updateProduct(
                        where: { id: $productId }
                        data: {
                            variants: { create: $vData }
                        }
                    ) {
                        id
                        variants { id title stage }
                    }
                }
            `, { productId: p.id, vData: [vData] });

            const newVariant = res?.updateProduct?.variants?.find(v => v.title === vData.title);
            if (newVariant) {
                await graphqlRequest(`mutation($id: ID!) { publishProductVariant(where: { id: $id }, to: PUBLISHED) { id } }`, { id: newVariant.id });
            }
        }
        await graphqlRequest(`mutation($id: ID!) { publishProduct(where: { id: $id }, to: PUBLISHED) { id } }`, { id: p.id });
    }

    // Helper to create blog variants
    async function seedBlogVariants(b) {
        console.log(`  Seeding variants for BlogPost: ${b.title} (${b.id})`);

        const mutations = [
            // VIP
            vip ? {
                excerpt: `[VIP Exclusive Content] An in-depth advanced analysis of ${b.title} that goes beyond the basics.`,
                segments: { connect: [{ id: vip.id }] }
            } : null,
            // New Visitor
            newbie ? {
                excerpt: `Welcome to our community! Since you're new, we've summarized ${b.title} to get you up to speed quickly.`,
                segments: { connect: [{ id: newbie.id }] }
            } : null
        ].filter(Boolean);

        for (const vData of mutations) {
            const res = await graphqlRequest(`
                mutation($blogId: ID!, $vData: [BlogPostVariantCreateInput!]!) {
                    updateBlogPost(
                        where: { id: $blogId }
                        data: {
                            variants: { create: $vData }
                        }
                    ) {
                        id
                        variants(last: 1) { id stage }
                    }
                }
            `, { blogId: b.id, vData: [vData] });

            const newVariant = res?.updateBlogPost?.variants?.[0];
            if (newVariant) {
                await graphqlRequest(`mutation($id: ID!) { publishBlogPostVariant(where: { id: $id }, to: PUBLISHED) { id } }`, { id: newVariant.id });
            }
        }
        await graphqlRequest(`mutation($id: ID!) { publishBlogPost(where: { id: $id }, to: PUBLISHED) { id } }`, { id: b.id });
    }

    // 4. Run seeding
    for (const p of products) await seedProductVariants(p);
    for (const b of blogPosts) await seedBlogVariants(b);

    // 5. Create Personalization Landing Page entries if needed
    console.log("Creating Personalization Landing Page...");
    await graphqlRequest(`
        mutation {
            upsertLandingPage(
                where: { pageSlug: "personalization" }
                upsert: {
                    create: {
                        title: "Personalization Showcase"
                        pageSlug: "personalization"
                        sections: { create: [] }
                    }
                    update: {
                        title: "Personalization Showcase"
                    }
                }
            ) { id }
        }
    `);
    await graphqlRequest(`mutation { publishLandingPage(where: { pageSlug: "personalization" }, to: PUBLISHED) { id } }`);

    console.log("Seeding complete!");
}

main();
