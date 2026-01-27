
const fs = require('fs');
const env = fs.readFileSync('/Users/briangathuita/Documents/Micro-Store/.env', 'utf8');
const endpoint = env.match(/VITE_HYGRAPH_ENDPOINT=(.*)/)[1].trim();
const token = env.match(/VITE_HYGRAPH_TOKEN=(.*)/)[1].trim();

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function graphqlRequest(query, variables, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
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
        } catch (err) {
            console.warn(`Attempt ${i + 1} failed: ${err.message}`);
            if (i === retries - 1) throw err;
            await delay(1000 * (i + 1));
        }
    }
}

async function main() {
    console.log("Fetching blog posts and segments...");
    const [blogData, segmentData] = await Promise.all([
        graphqlRequest(`{ blogPosts(first: 20) { id title blogSlug excerpt variants { id segments { name } } } }`),
        graphqlRequest(`{ segments { id name } }`)
    ]);

    const segments = segmentData.segments;
    const vipSegment = segments.find(s => s.name === 'VIP');
    const nvSegment = segments.find(s => s.name === 'New Visitor');
    const minSegment = segments.find(s => s.name === 'Minimalist');

    for (const post of blogData.blogPosts) {
        console.log(`Processing "${post.title}"...`);

        const segmentConfigs = [
            {
                name: 'VIP',
                id: vipSegment?.id,
                title: `[VIP Exclusive] ${post.title}`,
                excerpt: `Deep dive into ${post.title}. Discover advanced tips and master-level insights for our VIP members.`
            },
            {
                name: 'New Visitor',
                id: nvSegment?.id,
                title: `Welcome! Guide to ${post.title}`,
                excerpt: `New here? Here is everything you need to know about ${post.title} to get started today.`
            },
            {
                name: 'Minimalist',
                id: minSegment?.id,
                title: `Essentials: ${post.title}`,
                excerpt: `Pure and simple. The core facts about ${post.title} without any fluff.`
            }
        ];

        for (const config of segmentConfigs) {
            if (!config.id) continue;

            const existingVariant = post.variants?.find(v => v.segments.some(s => s.name === config.name));

            if (existingVariant) {
                console.log(`  Updating ${config.name} variant...`);
                await graphqlRequest(`
                    mutation($postId: ID!, $variantId: ID!, $title: String!, $excerpt: String!) {
                        updateBlogPost(
                            where: { id: $postId }
                            data: {
                                variants: {
                                    update: {
                                        where: { id: $variantId }
                                        data: { title: $title, excerpt: $excerpt }
                                    }
                                }
                            }
                        ) { id }
                    }
                `, { postId: post.id, variantId: existingVariant.id, title: config.title, excerpt: config.excerpt });
                await graphqlRequest(`mutation($id: ID!) { publishBlogPostVariant(where: { id: $id }, to: PUBLISHED) { id } }`, { id: existingVariant.id });
            } else {
                console.log(`  Creating ${config.name} variant...`);
                const createResult = await graphqlRequest(`
                    mutation($postId: ID!, $title: String!, $excerpt: String!, $segmentId: ID!) {
                        updateBlogPost(
                            where: { id: $postId }
                            data: {
                                variants: {
                                    create: {
                                        title: $title,
                                        excerpt: $excerpt,
                                        segments: { connect: { id: $segmentId } }
                                    }
                                }
                            }
                        ) { 
                            variants(last: 1) { id }
                        }
                    }
                `, { postId: post.id, title: config.title, excerpt: config.excerpt, segmentId: config.id });

                if (createResult?.updateBlogPost?.variants?.[0]?.id) {
                    await graphqlRequest(`mutation($id: ID!) { publishBlogPostVariant(where: { id: $id }, to: PUBLISHED) { id } }`, { id: createResult.updateBlogPost.variants[0].id });
                }
            }
            await delay(200);
        }
        await graphqlRequest(`mutation($id: ID!) { publishBlogPost(where: { id: $id }, to: PUBLISHED) { id } }`, { id: post.id });
    }

    console.log("Blog variants seeded!");
}

main();
