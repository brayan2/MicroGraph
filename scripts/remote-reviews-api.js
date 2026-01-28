const http = require('http');
const url = require('url');

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
    'cm6f8isre02v707u7d7isvqve': [
        reviewPool[0],
        reviewPool[2],
        reviewPool[4],
        reviewPool[5],
        reviewPool[12]
    ]
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (path === '/reviews' && req.method === 'GET') {
        const productId = parsedUrl.query.productId;

        let reviews = reviewsData[productId];

        if (!reviews) {
            const startIdx = productId ? (productId.charCodeAt(0) % reviewPool.length) : 0;
            reviews = [
                { ...reviewPool[startIdx], id: `rem-auto-1-${productId}` },
                { ...reviewPool[(startIdx + 2) % reviewPool.length], id: `rem-auto-2-${productId}` },
                { ...reviewPool[(startIdx + 4) % reviewPool.length], id: `rem-auto-3-${productId}` }
            ];
        } else {
            reviews = reviews.map((r, i) => ({ ...r, id: `rem-static-${i}-${productId}` }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(reviews));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Remote Reviews API running at http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/reviews?productId=cm6f8isre02v707u7d7isvqve`);
});
