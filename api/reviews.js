export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    // A more extensive pool of reviews to simulate a real database
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
        'product-2': reviewPool.slice(5, 10),
        'cm6f8isre02v707u7d7isvqve': [ // Specific ID from previous demo
            reviewPool[0],
            reviewPool[2],
            reviewPool[4],
            reviewPool[5],
            reviewPool[12]
        ]
    };

    if (req.method === 'GET') {
        const { productId } = req.query;

        // Return specific data if found, otherwise return a generated set based on productId
        // This ensures every product has some reviews for the demo
        let reviews = reviewsData[productId];

        if (!reviews) {
            // Generate deterministic but "random" looking reviews for any productId
            // Use the first letter of productId to pick a starting point
            const startIdx = productId ? (productId.charCodeAt(0) % reviewPool.length) : 0;
            reviews = [
                { ...reviewPool[startIdx], id: `rem-auto-1-${productId}` },
                { ...reviewPool[(startIdx + 2) % reviewPool.length], id: `rem-auto-2-${productId}` },
                { ...reviewPool[(startIdx + 4) % reviewPool.length], id: `rem-auto-3-${productId}` }
            ];
        } else {
            // Add IDs to the static data
            reviews = reviews.map((r, i) => ({ ...r, id: `rem-static-${i}-${productId}` }));
        }

        res.status(200).json(reviews);
    } else {
        res.status(404).send('Not Found');
    }
}
