export default function handler(req, res) {
    // Enable CORS for all requests, including from Hygraph
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    const reviewPool = [
        { name: 'Alex Rivera', rating: 5, comment: 'Simply the best! Exceeded all my expectations.' },
        { name: 'Sam Chen', rating: 4, comment: 'Great quality and design. Minor shipping delay but worth the wait.' },
        { name: 'Jordan Smith', rating: 3, comment: 'It is okay, but I expected a bit more for the price.' },
        { name: 'Taylor Lee', rating: 2, comment: 'Not what I was looking for. The material felt a bit cheap.' },
        { name: 'Morgan Black', rating: 1, comment: 'Very disappointed. Item arrived damaged and customer service was slow.' },
        { name: 'Casey Jones', rating: 5, comment: 'Absolutely brilliant. I use it every single day!' },
        { name: 'Riley Evans', rating: 4, comment: 'Highly recommended for anyone looking for reliability.' },
        { name: 'Quinn Taylor', rating: 5, comment: 'A game changer for my workflow. Five stars!' },
        { name: 'Skyler White', rating: 2, comment: 'Color was slightly different from the photos. Returning it.' },
        { name: 'Peyton Reed', rating: 4, comment: 'Solid build, feels like it will last a long time.' },
        { name: 'Dakota Sky', rating: 3, comment: 'Functional but nothing special. It does the job.' },
        { name: 'Emerson Cole', rating: 5, comment: 'Pure perfection. Do not hesitate to buy!' },
        { name: 'Avery Brooks', rating: 1, comment: 'Stopped working after two days. Do not waste your money.' }
    ];

    const reviewsData = {
        'product-1': reviewPool.slice(0, 5),
        'product-2': reviewPool.slice(5, 10)
    };

    // Extract productId from query
    const { productId } = req.query;

    // Log the request for debugging in Vercel Console
    console.log(`Review request received for productId: ${productId}`);

    if (req.method === 'GET') {
        let reviews = reviewsData[productId];

        if (!reviews) {
            // Pick reviews based on productId hash if possible
            const idValue = productId ? productId.length : 0;
            const startIdx = idValue % reviewPool.length;

            reviews = [
                { ...reviewPool[startIdx], id: `rem-auto-1-${productId || 'none'}` },
                { ...reviewPool[(startIdx + 2) % reviewPool.length], id: `rem-auto-2-${productId || 'none'}` },
                { ...reviewPool[(startIdx + 4) % reviewPool.length], id: `rem-auto-3-${productId || 'none'}` }
            ];
        } else {
            reviews = reviews.map((r, i) => ({ ...r, id: `rem-static-${i}-${productId}` }));
        }

        // ALWAYS return JSON
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(reviews);
    }

    // Default 404 in JSON format
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ error: 'Not Found', path: req.url });
}
