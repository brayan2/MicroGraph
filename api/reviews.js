export default function handler(req, res) {
    // Enable CORS for all requests, including from Hygraph
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Localized review pool
    const reviewPool = {
        en: [
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
        ],
        de: [
            { name: 'Alex Rivera', rating: 5, comment: 'Einfach das Beste! Hat alle meine Erwartungen übertroffen.' },
            { name: 'Sam Chen', rating: 4, comment: 'Tolle Qualität und Design. Kleine Versandverzögerung, aber das Warten hat sich gelohnt.' },
            { name: 'Jordan Smith', rating: 3, comment: 'Es ist okay, aber ich habe für den Preis etwas mehr erwartet.' },
            { name: 'Taylor Lee', rating: 2, comment: 'Nicht das, was ich gesucht habe. Das Material fühlte sich etwas billig an.' },
            { name: 'Morgan Black', rating: 1, comment: 'Sehr enttäuscht. Der Artikel kam beschädigt an und der Kundenservice war langsam.' }
        ],
        fr: [
            { name: 'Alex Rivera', rating: 5, comment: 'Tout simplement le meilleur ! A dépassé toutes mes attentes.' },
            { name: 'Sam Chen', rating: 4, comment: 'Excellente qualité et design. Petit retard de livraison mais le jeu en vaut la chandelle.' },
            { name: 'Jordan Smith', rating: 3, comment: 'C\'est correct, mais j\'en attendais un peu plus pour le prix.' },
            { name: 'Taylor Lee', rating: 2, comment: 'Pas ce que je cherchais. Le matériau semblait un peu bon marché.' }
        ],
        es: [
            { name: 'Alex Rivera', rating: 5, comment: '¡Simplemente lo mejor! Superó todas mis expectativas.' },
            { name: 'Sam Chen', rating: 4, comment: 'Gran calidad y diseño. Pequeño retraso en el envío pero valió la pena la espera.' },
            { name: 'Jordan Smith', rating: 3, comment: 'Está bien, pero esperaba un poco más por el precio.' },
            { name: 'Taylor Lee', rating: 2, comment: 'No es lo que buscaba. El material se sentía un poco barato.' }
        ]
    };

    const reviewsData = {
        'product-1': { en: reviewPool.en.slice(0, 5), de: reviewPool.de.slice(0, 3) },
        'product-2': { en: reviewPool.en.slice(5, 10) }
    };

    try {
        // Extract productId and locale from query
        const { productId, locale } = req.query;
        const lang = (locale || 'en').toLowerCase();
        const activePool = reviewPool[lang] || reviewPool.en;

        console.log(`Review request: productId=${productId}, locale=${locale}`);

        let reviews = reviewsData[productId]?.[lang] || reviewsData[productId]?.en;

        if (!reviews) {
            // Pick reviews based on productId hash if possible
            const idValue = productId ? productId.length : 0;
            const startIdx = idValue % activePool.length;

            reviews = [
                { ...activePool[startIdx], id: `rem-auto-1-${productId || 'none'}` },
                { ...activePool[(startIdx + 2) % activePool.length], id: `rem-auto-2-${productId || 'none'}` },
                { ...activePool[(startIdx + 4) % activePool.length], id: `rem-auto-3-${productId || 'none'}` }
            ];
        } else {
            reviews = reviews.map((r, i) => ({ ...r, id: `rem-static-${i}-${productId}` }));
        }

        // ALWAYS return JSON
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("API Error:", error);
        // Fallback to empty array on any error to satisfy GraphQL List type
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).json([]);
    }
}
