export default function handler(req, res) {
    // CRITICAL: Set JSON content-type FIRST before any other operations
    res.setHeader('Content-Type', 'application/json');

    // Enable CORS for all requests, including from Hygraph
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Log the incoming request for debugging
    const timestamp = new Date().toISOString();
    const fullUrl = `${req.url}`;
    console.log(`[${timestamp}] Reviews API Request:`, {
        method: req.method,
        url: fullUrl,
        query: req.query,
        headers: {
            'user-agent': req.headers['user-agent'],
            'origin': req.headers['origin'],
            'referer': req.headers['referer']
        }
    });

    // Localized review pool - Expanded with longer, more detailed reviews
    const reviewPool = {
        en: [
            { name: 'Alexandra Martinez', rating: 5, comment: 'Absolutely outstanding product! The quality exceeded all my expectations and the attention to detail is remarkable. I have been using it daily for weeks now and it still looks brand new.' },
            { name: 'Benjamin Chen', rating: 5, comment: 'This is hands down the best purchase I have made this year. The craftsmanship is impeccable, and every feature works flawlessly. Worth every single penny!' },
            { name: 'Charlotte O\'Brien', rating: 4, comment: 'Really impressive overall quality and design. There was a minor delay in shipping, but customer service kept me informed. The product itself is fantastic and exactly as described.' },
            { name: 'David Thompson', rating: 5, comment: 'I was hesitant at first due to the price, but after using it for a month, I can confidently say it is worth the investment. Superb durability and elegant design throughout.' },
            { name: 'Emma Rodriguez', rating: 4, comment: 'Great product with excellent functionality. My only minor complaint is that the color in person is slightly darker than shown in the photos, but it still looks beautiful and works perfectly.' },
            { name: 'Felix Anderson', rating: 3, comment: 'It is a decent product that does what it is supposed to do. However, for the price point, I was expecting a bit more premium materials and packaging. Still satisfied overall.' },
            { name: 'Grace Kim', rating: 5, comment: 'Phenomenal! I have recommended this to all my friends and family. The build quality is exceptional and it has completely transformed my daily routine. Could not be happier!' },
            { name: 'Henry Williams', rating: 4, comment: 'Very solid construction and reliable performance. It arrived well-packaged and setup was straightforward. Deducting one star only because the instructions could be clearer.' },
            { name: 'Isabella Santos', rating: 2, comment: 'Unfortunately, this did not meet my expectations. The material feels cheaper than anticipated and there were some quality control issues. Considering returning it for a refund.' },
            { name: 'James Parker', rating: 5, comment: 'Pure perfection from start to finish! Every aspect of this product shows thoughtful design and premium quality. I use it every single day and it never disappoints.' },
            { name: 'Katherine Lee', rating: 4, comment: 'Really pleased with this purchase. It is well-made, functional, and aesthetically pleasing. The only improvement would be offering more color options, but that is just personal preference.' },
            { name: 'Leonardo Garcia', rating: 3, comment: 'Functional and does the job adequately. Nothing particularly special or innovative, but it is reliable and gets the work done. Fair value for the price paid.' },
            { name: 'Mia Johnson', rating: 1, comment: 'Very disappointed with this purchase. The item arrived damaged despite careful packaging, and it stopped functioning properly after just two days of light use. Would not recommend.' },
            { name: 'Noah Davis', rating: 5, comment: 'Exceptional quality and outstanding customer service! When I had a question about features, support responded within hours. The product itself is magnificent and built to last.' },
            { name: 'Olivia White', rating: 4, comment: 'Highly recommend for anyone looking for reliability and style. It has made such a positive difference in my routine. Shipping was fast and packaging was protective and eco-friendly.' },
            { name: 'Patrick Brown', rating: 2, comment: 'The photos online were misleading - the actual color and finish are quite different in person. Quality is okay but not great. Customer service was helpful with my concerns though.' },
            { name: 'Quinn Taylor', rating: 5, comment: 'This has been a complete game changer for my workflow! Intuitive design, premium materials, and flawless execution. I genuinely cannot find a single thing to criticize.' },
            { name: 'Rachel Green', rating: 4, comment: 'Very satisfied overall. The build feels sturdy and premium, and it looks even better in person than in the pictures. Would definitely purchase from this brand again.' },
            { name: 'Samuel Wright', rating: 3, comment: 'Meets basic expectations but lacks the wow factor I was hoping for. It is serviceable and will do the job, but there are probably better alternatives available at this price range.' },
            { name: 'Victoria Chang', rating: 5, comment: 'Do not hesitate to buy this! The attention to detail, quality of materials, and overall execution are simply outstanding. Best purchase I have made in months, absolutely thrilled!' }
        ],
        de: [
            { name: 'Alexander Müller', rating: 5, comment: 'Absolut herausragendes Produkt! Die Qualität hat alle meine Erwartungen übertroffen und die Liebe zum Detail ist bemerkenswert. Ich benutze es jetzt seit Wochen täglich und es sieht immer noch brandneu aus.' },
            { name: 'Bettina Schmidt', rating: 5, comment: 'Das ist ohne Zweifel der beste Kauf, den ich dieses Jahr getätigt habe. Die Handwerkskunst ist tadellos und jede Funktion funktioniert einwandfrei. Jeden einzelnen Cent wert!' },
            { name: 'Christian Weber', rating: 4, comment: 'Wirklich beeindruckende Gesamtqualität und Design. Es gab eine kleine Verzögerung beim Versand, aber der Kundenservice hielt mich auf dem Laufenden. Das Produkt selbst ist fantastisch und genau wie beschrieben.' },
            { name: 'Diana Fischer', rating: 5, comment: 'Ich war zunächst wegen des Preises zögerlich, aber nach einem Monat Nutzung kann ich mit Zuversicht sagen, dass es die Investition wert ist. Hervorragende Haltbarkeit und elegantes Design durchweg.' },
            { name: 'Erik Hoffmann', rating: 4, comment: 'Großartiges Produkt mit ausgezeichneter Funktionalität. Meine einzige kleine Beschwerde ist, dass die Farbe in Person etwas dunkler ist als auf den Fotos gezeigt, aber es sieht trotzdem schön aus und funktioniert perfekt.' },
            { name: 'Franziska Becker', rating: 3, comment: 'Es ist ein ordentliches Produkt, das tut, was es tun soll. Allerdings habe ich für diesen Preispunkt etwas hochwertigere Materialien und Verpackung erwartet. Insgesamt dennoch zufrieden.' },
            { name: 'Georg Klein', rating: 5, comment: 'Phänomenal! Ich habe dies allen meinen Freunden und Familie empfohlen. Die Verarbeitungsqualität ist außergewöhnlich und es hat meine tägliche Routine komplett verändert. Könnte nicht glücklicher sein!' },
            { name: 'Hannah Wolf', rating: 4, comment: 'Sehr solide Konstruktion und zuverlässige Leistung. Es kam gut verpackt an und die Einrichtung war unkompliziert. Ziehe nur einen Stern ab, weil die Anleitung klarer sein könnte.' },
            { name: 'Iris Zimmermann', rating: 2, comment: 'Leider hat dies meine Erwartungen nicht erfüllt. Das Material fühlt sich billiger an als erwartet und es gab einige Qualitätskontrollprobleme. Überlege, es zurückzugeben und eine Rückerstattung zu beantragen.' },
            { name: 'Julian Schäfer', rating: 5, comment: 'Absolute Perfektion von Anfang bis Ende! Jeder Aspekt dieses Produkts zeigt durchdachtes Design und erstklassige Qualität. Ich benutze es jeden einzelnen Tag und es enttäuscht nie.' },
            { name: 'Katharina Braun', rating: 4, comment: 'Wirklich zufrieden mit diesem Kauf. Es ist gut gemacht, funktional und ästhetisch ansprechend. Die einzige Verbesserung wäre, mehr Farboptionen anzubieten, aber das ist nur persönliche Präferenz.' },
            { name: 'Lars Richter', rating: 3, comment: 'Funktional und erledigt die Arbeit angemessen. Nichts besonders Spezielles oder Innovatives, aber es ist zuverlässig und erledigt die Arbeit. Fairer Wert für den gezahlten Preis.' },
            { name: 'Maria Koch', rating: 1, comment: 'Sehr enttäuscht von diesem Kauf. Der Artikel kam trotz sorgfältiger Verpackung beschädigt an und funktionierte nach nur zwei Tagen leichter Nutzung nicht mehr richtig. Würde nicht empfehlen.' },
            { name: 'Niklas Werner', rating: 5, comment: 'Außergewöhnliche Qualität und hervorragender Kundenservice! Als ich eine Frage zu Funktionen hatte, antwortete der Support innerhalb von Stunden. Das Produkt selbst ist großartig und für die Ewigkeit gebaut.' },
            { name: 'Olivia Lange', rating: 4, comment: 'Sehr empfehlenswert für alle, die Zuverlässigkeit und Stil suchen. Es hat einen so positiven Unterschied in meiner Routine gemacht. Versand war schnell und Verpackung war schützend und umweltfreundlich.' },
            { name: 'Paul Krüger', rating: 2, comment: 'Die Fotos online waren irreführend - die tatsächliche Farbe und Oberfläche sind in Person ganz anders. Qualität ist okay, aber nicht großartig. Kundenservice war jedoch hilfreich bei meinen Bedenken.' },
            { name: 'Quincy Meyer', rating: 5, comment: 'Dies war ein kompletter Gamechanger für meinen Arbeitsablauf! Intuitives Design, erstklassige Materialien und einwandfreie Ausführung. Ich kann wirklich nichts finden, was ich kritisieren könnte.' },
            { name: 'Rebecca Hartmann', rating: 4, comment: 'Sehr zufrieden insgesamt. Die Verarbeitung fühlt sich robust und hochwertig an, und es sieht in Person noch besser aus als auf den Bildern. Würde definitiv wieder von dieser Marke kaufen.' }
        ],
        fr: [
            { name: 'Alexandre Dubois', rating: 5, comment: 'Produit absolument exceptionnel ! La qualité a dépassé toutes mes attentes et l\'attention aux détails est remarquable. Je l\'utilise quotidiennement depuis des semaines et il est toujours comme neuf.' },
            { name: 'Brigitte Martin', rating: 5, comment: 'C\'est sans conteste le meilleur achat que j\'ai fait cette année. L\'artisanat est impeccable et chaque fonctionnalité fonctionne parfaitement. Vaut chaque centime dépensé !' },
            { name: 'Claude Bernard', rating: 4, comment: 'Qualité et design globalement vraiment impressionnants. Il y a eu un léger retard dans la livraison, mais le service client m\'a tenu informé. Le produit lui-même est fantastique et exactement comme décrit.' },
            { name: 'Dominique Petit', rating: 5, comment: 'J\'étais hésitant au début à cause du prix, mais après l\'avoir utilisé pendant un mois, je peux affirmer avec confiance qu\'il vaut l\'investissement. Durabilité superbe et design élégant partout.' },
            { name: 'Élise Rousseau', rating: 4, comment: 'Excellent produit avec une fonctionnalité excellente. Ma seule petite plainte est que la couleur en personne est légèrement plus foncée que celle montrée sur les photos, mais il est toujours magnifique et fonctionne parfaitement.' },
            { name: 'François Laurent', rating: 3, comment: 'C\'est un produit décent qui fait ce qu\'il est censé faire. Cependant, pour ce prix, je m\'attendais à des matériaux et un emballage un peu plus premium. Toujours satisfait dans l\'ensemble.' },
            { name: 'Geneviève Simon', rating: 5, comment: 'Phénoménal ! Je l\'ai recommandé à tous mes amis et famille. La qualité de fabrication est exceptionnelle et il a complètement transformé ma routine quotidienne. Je ne pourrais pas être plus heureux !' },
            { name: 'Henri Moreau', rating: 4, comment: 'Construction très solide et performance fiable. Il est arrivé bien emballé et la configuration était simple. Je retire une étoile uniquement parce que les instructions pourraient être plus claires.' },
            { name: 'Isabelle Girard', rating: 2, comment: 'Malheureusement, cela n\'a pas répondu à mes attentes. Le matériau semble moins cher que prévu et il y avait des problèmes de contrôle qualité. J\'envisage de le retourner pour un remboursement.' },
            { name: 'Jacques Bonnet', rating: 5, comment: 'Perfection pure du début à la fin ! Chaque aspect de ce produit montre un design réfléchi et une qualité premium. Je l\'utilise tous les jours et il ne déçoit jamais.' },
            { name: 'Karine Blanc', rating: 4, comment: 'Vraiment satisfait de cet achat. Il est bien fait, fonctionnel et esthétiquement plaisant. La seule amélioration serait d\'offrir plus d\'options de couleurs, mais c\'est juste une préférence personnelle.' },
            { name: 'Louis Garnier', rating: 3, comment: 'Fonctionnel et fait le travail de manière adéquate. Rien de particulièrement spécial ou innovant, mais il est fiable et accomplit le travail. Bon rapport qualité-prix pour le prix payé.' },
            { name: 'Marie Fournier', rating: 1, comment: 'Très déçu de cet achat. L\'article est arrivé endommagé malgré un emballage soigné, et il a cessé de fonctionner correctement après seulement deux jours d\'utilisation légère. Je ne recommande pas.' },
            { name: 'Nicolas Chevalier', rating: 5, comment: 'Qualité exceptionnelle et service client remarquable ! Quand j\'ai eu une question sur les fonctionnalités, le support a répondu en quelques heures. Le produit lui-même est magnifique et construit pour durer.' },
            { name: 'Odette Mercier', rating: 4, comment: 'Hautement recommandé pour tous ceux qui recherchent fiabilité et style. Il a fait une différence si positive dans ma routine. L\'expédition était rapide et l\'emballage était protecteur et écologique.' },
            { name: 'Pierre Lefebvre', rating: 2, comment: 'Les photos en ligne étaient trompeuses - la couleur et la finition réelles sont assez différentes en personne. La qualité est correcte mais pas géniale. Le service client était cependant utile avec mes préoccupations.' },
            { name: 'Quincy Renard', rating: 5, comment: 'Cela a complètement changé la donne pour mon flux de travail ! Design intuitif, matériaux premium et exécution impeccable. Je ne peux vraiment rien trouver à critiquer.' },
            { name: 'Rachel Fontaine', rating: 4, comment: 'Très satisfait dans l\'ensemble. La construction semble robuste et premium, et il est encore mieux en personne que sur les photos. Je rachèterais certainement de cette marque.' }
        ],
        es: [
            { name: 'Alejandro García', rating: 5, comment: '¡Producto absolutamente excepcional! La calidad superó todas mis expectativas y la atención al detalle es notable. Lo he estado usando diariamente durante semanas y todavía se ve como nuevo.' },
            { name: 'Beatriz López', rating: 5, comment: 'Esta es sin duda la mejor compra que he hecho este año. La artesanía es impecable y cada característica funciona perfectamente. ¡Vale cada centavo!' },
            { name: 'Carlos Martínez', rating: 4, comment: 'Calidad y diseño general realmente impresionantes. Hubo un pequeño retraso en el envío, pero el servicio al cliente me mantuvo informado. El producto en sí es fantástico y exactamente como se describe.' },
            { name: 'Diana Rodríguez', rating: 5, comment: 'Estaba dudoso al principio debido al precio, pero después de usarlo durante un mes, puedo decir con confianza que vale la inversión. Durabilidad excelente y diseño elegante en todo.' },
            { name: 'Eduardo Fernández', rating: 4, comment: 'Gran producto con excelente funcionalidad. Mi única pequeña queja es que el color en persona es ligeramente más oscuro que el mostrado en las fotos, pero aún se ve hermoso y funciona perfectamente.' },
            { name: 'Francisca González', rating: 3, comment: 'Es un producto decente que hace lo que se supone que debe hacer. Sin embargo, por este precio, esperaba materiales y embalaje un poco más premium. Aún así satisfecho en general.' },
            { name: 'Gabriel Sánchez', rating: 5, comment: '¡Fenomenal! Se lo he recomendado a todos mis amigos y familiares. La calidad de construcción es excepcional y ha transformado completamente mi rutina diaria. ¡No podría estar más feliz!' },
            { name: 'Helena Pérez', rating: 4, comment: 'Construcción muy sólida y rendimiento confiable. Llegó bien empaquetado y la configuración fue sencilla. Solo resto una estrella porque las instrucciones podrían ser más claras.' },
            { name: 'Ignacio Torres', rating: 2, comment: 'Desafortunadamente, esto no cumplió con mis expectativas. El material se siente más barato de lo esperado y hubo algunos problemas de control de calidad. Considerando devolverlo para un reembolso.' },
            { name: 'Julia Ramírez', rating: 5, comment: '¡Perfección pura de principio a fin! Cada aspecto de este producto muestra diseño reflexivo y calidad premium. Lo uso todos los días y nunca decepciona.' },
            { name: 'Kevin Flores', rating: 4, comment: 'Realmente satisfecho con esta compra. Está bien hecho, es funcional y estéticamente agradable. La única mejora sería ofrecer más opciones de color, pero eso es solo preferencia personal.' },
            { name: 'Laura Cruz', rating: 3, comment: 'Funcional y hace el trabajo adecuadamente. Nada particularmente especial o innovador, pero es confiable y completa el trabajo. Buen valor por el precio pagado.' },
            { name: 'Miguel Reyes', rating: 1, comment: 'Muy decepcionado con esta compra. El artículo llegó dañado a pesar del embalaje cuidadoso, y dejó de funcionar correctamente después de solo dos días de uso ligero. No lo recomendaría.' },
            { name: 'Natalia Morales', rating: 5, comment: '¡Calidad excepcional y servicio al cliente sobresaliente! Cuando tuve una pregunta sobre características, el soporte respondió en horas. El producto en sí es magnífico y construido para durar.' },
            { name: 'Oscar Jiménez', rating: 4, comment: 'Muy recomendado para cualquiera que busque confiabilidad y estilo. Ha hecho una diferencia tan positiva en mi rutina. El envío fue rápido y el embalaje era protector y ecológico.' },
            { name: 'Patricia Ruiz', rating: 2, comment: 'Las fotos en línea eran engañosas: el color y acabado real son bastante diferentes en persona. La calidad es aceptable pero no excelente. Sin embargo, el servicio al cliente fue útil con mis preocupaciones.' },
            { name: 'Quintín Herrera', rating: 5, comment: '¡Esto ha sido un cambio total para mi flujo de trabajo! Diseño intuitivo, materiales premium y ejecución impecable. Realmente no puedo encontrar nada que criticar.' },
            { name: 'Rosa Vargas', rating: 4, comment: 'Muy satisfecho en general. La construcción se siente robusta y premium, y se ve aún mejor en persona que en las fotos. Definitivamente volvería a comprar de esta marca.' }
        ]
    };

    const reviewsData = {
        'product-1': { en: reviewPool.en.slice(0, 5), de: reviewPool.de.slice(0, 3) },
        'product-2': { en: reviewPool.en.slice(5, 10) }
    };

    try {
        // Extract productId and locale from query
        const { productId, locale } = req.query;

        // Validate productId parameter
        if (!productId) {
            console.warn('[Reviews API] No productId provided, returning empty array');
            return res.status(200).json([]);
        }

        const lang = (locale || 'en').toLowerCase();
        const activePool = reviewPool[lang] || reviewPool.en;

        console.log(`[Reviews API] Processing: productId="${productId}", locale="${lang}"`);

        let reviews = reviewsData[productId]?.[lang] || reviewsData[productId]?.en;

        if (!reviews) {
            // Pick reviews based on productId hash if possible
            const idValue = productId ? productId.length : 0;
            const startIdx = idValue % activePool.length;

            reviews = [
                { ...activePool[startIdx], id: `rem-auto-1-${productId}` },
                { ...activePool[(startIdx + 2) % activePool.length], id: `rem-auto-2-${productId}` },
                { ...activePool[(startIdx + 4) % activePool.length], id: `rem-auto-3-${productId}` }
            ];

            console.log(`[Reviews API] Generated ${reviews.length} auto reviews for productId="${productId}"`);
        } else {
            reviews = reviews.map((r, i) => ({ ...r, id: `rem-static-${i}-${productId}` }));
            console.log(`[Reviews API] Returned ${reviews.length} static reviews for productId="${productId}"`);
        }

        // Return JSON response
        return res.status(200).json(reviews);
    } catch (error) {
        console.error("[Reviews API] Error processing request:", error);
        console.error("[Reviews API] Error stack:", error.stack);

        // ALWAYS return valid JSON, even on error
        return res.status(200).json([]);
    }
}
