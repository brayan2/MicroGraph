// Mock database of reviews
// In a real app, this would come from a database query
const masterReviews = [
    // --- 4 SENTENCES (Longest) ---
    {
        id: 'rem-1',
        name: 'Alice Johnson',
        avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
        rating: 5,
        content: {
            en: 'Absolutely love this product! I was skeptical at first because of the price, but the quality is outstanding. It fits perfectly and shows zero signs of wear after three weeks. Highly recommended for anyone looking for reliability.',
            de: 'Ich liebe dieses Produkt absolut! Ich war anfangs wegen des Preises skeptisch, aber die Qualität ist hervorragend. Es passt perfekt und zeigt nach drei Wochen keinerlei Abnutzungserscheinungen. Sehr empfehlenswert für alle, die Zuverlässigkeit suchen.',
            fr: 'J\'adore absolument ce produit ! J\'étais sceptique au début à cause du prix, mais la qualité est exceptionnelle. Il me va parfaitement et ne montre aucun signe d\'usure après trois semaines. Hautement recommandé pour ceux qui cherchent la fiabilité.',
            es: '¡Me encanta este producto! Al principio era escéptica por el precio, pero la calidad es excelente. Me queda perfecto y no muestra signos de desgaste después de tres semanas. Muy recomendado para cualquiera que busque fiabilidad.'
        }
    },
    {
        id: 'rem-2',
        name: 'Michael Chen',
        avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
        rating: 4,
        content: {
            en: 'Great value for the price. Delivery was super fast and the item was properly packaged to prevent damage. I have been using it daily and it holds up well. Would definitely consider buying again for a gift.',
            de: 'Tolles Preis-Leistungs-Verhältnis. Die Lieferung war super schnell und der Artikel war ordentlich verpackt, um Schäden zu vermeiden. Ich benutze es täglich und es hält gut. Würde definitiv in Betracht ziehen, es wieder als Geschenk zu kaufen.',
            fr: 'Excellent rapport qualité-prix. La livraison a été super rapide et l\'article était bien emballé pour éviter les dommages. Je l\'utilise quotidiennement et il tient bien. J\'envisagerais certainement d\'acheter à nouveau pour un cadeau.',
            es: 'Gran valor por el precio. La entrega fue súper rápida y el artículo estaba bien empaquetado para evitar daños. Lo uso a diario y aguanta bien. Definitivamente consideraría comprar de nuevo para un regalo.'
        }
    },
    {
        id: 'rem-3',
        name: 'Sophie Dubois',
        avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
        rating: 5,
        content: {
            en: 'Exceeded my expectations in every way. The packaging was beautiful and eco-friendly, which is a big plus. The item itself feels very premium and I received so many compliments! I am already planning to buy another one.',
            de: 'Hat meine Erwartungen in jeder Hinsicht übertroffen. Die Verpackung war schön und umweltfreundlich, was ein großer Pluspunkt ist. Der Artikel selbst fühlt sich sehr hochwertig an und ich habe so viele Komplimente bekommen! Ich plane bereits, ein weiteres zu kaufen.',
            fr: 'A dépassé mes attentes à tous égards. L\'emballage était beau et écologique, ce qui est un gros plus. L\'article lui-même semble très haut de gamme et j\'ai reçu tellement de compliments ! Je prévois déjà d\'en acheter un autre.',
            es: 'Superó mis expectativas en todos los sentidos. El embalaje era hermoso y ecológico, lo cual es un gran punto a favor. El artículo en sí se siente muy premium y recibí muchos cumplidos! Ya estoy planeando comprar otro.'
        }
    },
    {
        id: 'rem-4',
        name: 'Lucas Müller',
        avatarUrl: 'https://randomuser.me/api/portraits/men/86.jpg',
        rating: 5,
        content: {
            en: 'Simply the best purchase I have made this year. It combines style and function perfectly. The attention to detail is evident in every stitch. I cannot recommend this enough to my friends.',
            de: 'Einfach der beste Kauf, den ich dieses Jahr getätigt habe. Es verbindet Stil und Funktion perfekt. Die Liebe zum Detail ist in jedem Stich erkennbar. Ich kann das meinen Freunden nicht genug empfehlen.',
            fr: 'Tout simplement le meilleur achat que j\'ai fait cette année. Il combine parfaitement style et fonction. L\'attention portée aux détails est évidente dans chaque couture. Je ne peux pas recommander cela assez à mes amis.',
            es: 'Simplemente la mejor compra que he hecho este año. Combina estilo y función a la perfección. La atención al detalle es evidente en cada puntada. No puedo recomendar esto lo suficiente a mis amigos.'
        }
    },
    {
        id: 'rem-5',
        name: 'Elena Rodriguez',
        avatarUrl: 'https://randomuser.me/api/portraits/women/24.jpg',
        rating: 4,
        content: {
            en: 'Very stylish and comfortable to wear. I use it almost every day for work and it looks professional. Ideally, I would have liked more color options. Still, it fits true to size and feels great.',
            de: 'Sehr stilvoll und angenehm zu tragen. Ich benutze es fast jeden Tag für die Arbeit und es sieht professionell aus. Idealerweise hätte ich mir mehr Farboptionen gewünscht. Trotzdem fällt es größengerecht aus und fühlt sich toll an.',
            fr: 'Très élégant et confortable à porter. Je l\'utilise presque tous les jours pour le travail et il a l\'air professionnel. Idéalement, j\'aurais aimé plus d\'options de couleurs. Toujours est-il qu\'il taille correctement et qu\'il est agréable.',
            es: 'Muy elegante y cómodo de llevar. Lo uso casi todos los días para el trabajo y se ve profesional. Idealmente, me hubieran gustado más opciones de color. Aún así, se ajusta a la talla real y se siente genial.'
        }
    },
    {
        id: 'rem-6',
        name: 'David Smith',
        avatarUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
        rating: 3,
        content: {
            en: 'It is okay, but I expected a slightly different color based on the photos. The quality is decent, but not spectacular. It does the job it is supposed to do. I might look for a different brand next time.',
            de: 'Es ist okay, aber ich hatte aufgrund der Fotos eine etwas andere Farbe erwartet. Die Qualität ist anständig, aber nicht spektakulär. Es erledigt den Job, den es tun soll. Ich könnte beim nächsten Mal nach einer anderen Marke suchen.',
            fr: 'C\'est correct, mais je m\'attendais à une couleur légèrement différente d\'après les photos. La qualité est correcte, mais pas spectaculaire. Il fait le travail qu\'il est censé faire. Je pourrais chercher une autre marque la prochaine fois.',
            es: 'Está bien, pero esperaba un color ligeramente diferente basado en las fotos. La calidad es decente, pero no espectacular. Hace el trabajo que se supone que debe hacer. Podría buscar una marca diferente la próxima vez.'
        }
    },

    // --- 3 SENTENCES ---
    {
        id: 'rem-7',
        name: 'Emma Wilson',
        avatarUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
        rating: 5,
        content: {
            en: 'Customer service was amazing when I needed help with sizing. The product itself is perfect and arrived quickly. I will be a customer for life.',
            de: 'Der Kundenservice war fantastisch, als ich Hilfe bei der Größe brauchte. Das Produkt selbst ist perfekt und kam schnell an. Ich werde ein Kunde fürs Leben sein.',
            fr: 'Le service client était incroyable quand j\'avais besoin d\'aide pour la taille. Le produit lui-même est parfait et est arrivé rapidement. Je serai un client à vie.',
            es: 'El servicio al cliente fue increíble cuando necesité ayuda con la talla. El producto en sí es perfecto y llegó rápidamente. Seré cliente de por vida.'
        }
    },
    {
        id: 'rem-8',
        name: 'Lars Jensen',
        avatarUrl: 'https://randomuser.me/api/portraits/men/54.jpg',
        rating: 5,
        content: {
            en: 'A masterpiece of design that is simple yet functional. It fits perfectly into my minimalist apartment. Everyone ask me where I got it.',
            de: 'Ein Meisterwerk des Designs, das einfach und doch funktional ist. Es passt perfekt in meine minimalistische Wohnung. Jeder fragt mich, woher ich es habe.',
            fr: 'Un chef-d\'œuvre de design qui est simple mais fonctionnel. Il s\'intègre parfaitement dans mon appartement minimaliste. Tout le monde me demande où je l\'ai eu.',
            es: 'Una obra maestra del diseño que es simple pero funcional. Encaja perfectamente en mi apartamento minimalista. Todos me preguntan dónde lo conseguí.'
        }
    },
    {
        id: 'rem-9',
        name: 'Isabella Garcia',
        avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
        rating: 4,
        content: {
            en: 'Good quality and arrived right on time. The texture is really nice and soft against the skin. Will buy again from this store.',
            de: 'Gute Qualität und pünktlich angekommen. Die Textur ist wirklich schön und weich auf der Haut. Werde wieder in diesem Laden kaufen.',
            fr: 'Bonne qualité et arrivé juste à temps. La texture est vraiment agréable et douce contre la peau. J\'achèterai à nouveau dans ce magasin.',
            es: 'Buena calidad y llegó justo a tiempo. La textura es realmente agradable y suave contra la piel. Compraré de nuevo en esta tienda.'
        }
    },
    {
        id: 'rem-10',
        name: 'Thomas Weber',
        avatarUrl: 'https://randomuser.me/api/portraits/men/67.jpg',
        rating: 5,
        content: {
            en: 'The fit is exactly as described on the website. Very happy with my purchase decision. It feels durable enough to last years.',
            de: 'Die Passform ist genau wie auf der Website beschrieben. Sehr zufrieden mit meiner Kaufentscheidung. Es fühlt sich langlebig genug an, um Jahre zu halten.',
            fr: 'La coupe est exactement comme décrits sur le site web. Très content de ma décision d\'achat. Il semble assez durable pour durer des années.',
            es: 'El ajuste es exactamente como se describe en el sitio web. Muy feliz con mi decisión de compra. Se siente lo suficientemente duradero como para durar años.'
        }
    },
    {
        id: 'rem-11',
        name: 'Clara Rossi',
        avatarUrl: 'https://randomuser.me/api/portraits/women/52.jpg',
        rating: 5,
        content: {
            en: 'Looks even better in person than it did online. The colors are vibrant and true to the picture. Highly satisfied with this order!',
            de: 'Sieht persönlich noch besser aus als online. Die Farben sind lebendig und bildgetreu. Hochzufrieden mit dieser Bestellung!',
            fr: 'Ressemble encore mieux en personne qu\'en ligne. Les couleurs sont vibrantes et fidèles à l\'image. Très satisfait de cette commande !',
            es: 'Se ve aún mejor en persona que en línea. Los colores son vibrantes y fieles a la imagen. ¡Muy satisfecho con este pedido!'
        }
    },
    {
        id: 'rem-12',
        name: 'James O\'Connell',
        avatarUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
        rating: 4,
        content: {
            en: 'Solid product that does exactly what it says. No complaints so far with the performance. Easy to use right out of the box.',
            de: 'Solides Produkt, das genau das tut, was es sagt. Bisher keine Beschwerden über die Leistung. Einfach sofort einsatzbereit.',
            fr: 'Produit solide qui fait exactement ce qu\'il dit. Aucune plainte jusqu\'à présent sur la performance. Facile à utiliser dès la sortie de la boîte.',
            es: 'Producto sólido que hace exactamente lo que dice. Sin quejas hasta ahora con el rendimiento. Fácil de usar nada más sacarlo de la caja.'
        }
    },

    // --- 2 SENTENCES ---
    {
        id: 'rem-13',
        name: 'John Doe',
        avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
        rating: 3,
        content: {
            en: 'It works fine, but nothing special. I expected a bit more features for the price.',
            de: 'Es funktioniert gut, aber nichts Besonderes. Ich hatte für den Preis etwas mehr Funktionen erwartet.',
            fr: 'Ça marche bien, mais rien de spécial. Je m\'attendais à un peu plus de fonctionnalités pour le prix.',
            es: 'Funciona bien, pero nada especial. Esperaba un poco más de características por el precio.'
        }
    },
    {
        id: 'rem-14',
        name: 'Jane Smith',
        avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
        rating: 5,
        content: {
            en: 'Highly recommended to everyone! You will not regret this purchase.',
            de: 'Jedem sehr zu empfehlen! Sie werden diesen Kauf nicht bereuen.',
            fr: 'Hautement recommandé à tout le monde ! Vous ne regretterez pas cet achat.',
            es: '¡Muy recomendado a todos! No te arrepentirás de esta compra.'
        }
    },
    {
        id: 'rem-15',
        name: 'Nina Petrova',
        avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
        rating: 4,
        content: {
            en: 'After weeks of research, I settled on this model. It handles everything I throw at it.',
            de: 'Nach wochenlanger Recherche habe ich mich für dieses Modell entschieden. Es bewältigt alles, was ich ihm zumute.',
            fr: 'Après des semaines de recherche, je me suis décidé pour ce modèle. Il gère tout ce que je lui demande.',
            es: 'Después de semanas de investigación, me decidí por este modelo. Maneja todo lo que le echo.'
        }
    },
    {
        id: 'rem-16',
        name: 'Hiroshi Tanaka',
        avatarUrl: 'https://randomuser.me/api/portraits/men/78.jpg',
        rating: 5,
        content: {
            en: 'Simple, effective, and beautiful design. It integrates perfectly into my daily routine.',
            de: 'Einfaches, effektives und schönes Design. Es integriert sich perfekt in meinen Alltag.',
            fr: 'Design simple, efficace et beau. Il s\'intègre parfaitement dans ma routine quotidienne.',
            es: 'Diseño simple, efectivo y hermoso. Se integra perfectamente en mi rutina diaria.'
        }
    },
    {
        id: 'rem-17',
        name: 'Sarah Connor',
        avatarUrl: 'https://randomuser.me/api/portraits/women/12.jpg',
        rating: 5,
        content: {
            en: 'Saved me so much time every day. Essential for anyone with a busy schedule.',
            de: 'Hat mir jeden Tag so viel Zeit gespart. Unverzichtbar für jeden mit einem vollen Terminkalender.',
            fr: 'M\'a fait gagner tellement de temps chaque jour. Essentiel pour toute personne ayant un emploi du temps chargé.',
            es: 'Me ahorró mucho tiempo todos los días. Esencial para cualquier persona con una agenda apretada.'
        }
    },
    {
        id: 'rem-18',
        name: 'Robert Brown',
        avatarUrl: 'https://randomuser.me/api/portraits/men/15.jpg',
        rating: 4,
        content: {
            en: 'Decent quality for the money spent. I am satisfied with the results.',
            de: 'Anständige Qualität für das ausgegebene Geld. Ich bin mit den Ergebnissen zufrieden.',
            fr: 'Qualité correcte pour l\'argent dépensé. Je suis satisfait des résultats.',
            es: 'Calidad decente por el dinero gastado. Estoy satisfecho con los resultados.'
        }
    },

    // --- 1 SENTENCE (Longer than 3 words) ---
    {
        id: 'rem-19',
        name: 'Emily Davis',
        avatarUrl: 'https://randomuser.me/api/portraits/women/28.jpg',
        rating: 5,
        content: {
            en: 'I absolutely love it and use it daily.',
            de: 'Ich liebe es absolut und benutze es täglich.',
            fr: 'Je l\'adore absolument et je l\'utilise quotidiennement.',
            es: 'Me encanta absolutamente y lo uso a diario.'
        }
    },
    {
        id: 'rem-20',
        name: 'Markus Weber',
        avatarUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
        rating: 3,
        content: {
            en: 'It functions fine, but the material feels cheap.',
            de: 'Es funktioniert gut, aber das Material fühlt sich billig an.',
            fr: 'Il fonctionne bien, mais le matériau semble bon marché.',
            es: 'Funciona bien, pero el material se siente barato.'
        }
    },
    {
        id: 'rem-21',
        name: 'Kevin White',
        avatarUrl: 'https://randomuser.me/api/portraits/men/60.jpg',
        rating: 2,
        content: {
            en: 'The package arrived damaged and deeply scratched.',
            de: 'Das Paket kam beschädigt und tief zerkratzt an.',
            fr: 'Le colis est arrivé endommagé et profondément rayé.',
            es: 'El paquete llegó dañado y profundamente rayado.'
        }
    },
    {
        id: 'rem-22',
        name: 'Lisa Black',
        avatarUrl: 'https://randomuser.me/api/portraits/women/61.jpg',
        rating: 5,
        content: {
            en: 'This is barely distinguishable from the professional version.',
            de: 'Dies ist kaum von der professionellen Version zu unterscheiden.',
            fr: 'C\'est à peine distinguable de la version professionnelle.',
            es: 'Esto es apenas distinguible de la versión profesional.'
        }
    },
    {
        id: 'rem-23',
        name: 'Tom Green',
        avatarUrl: 'https://randomuser.me/api/portraits/men/62.jpg',
        rating: 4,
        content: {
            en: 'Good stuff that really helps with organization.',
            de: 'Gutes Zeug, das wirklich bei der Organisation hilft.',
            fr: 'Bon matériel qui aide vraiment à l\'organisation.',
            es: 'Buena cosa que realmente ayuda con la organización.'
        }
    },
    {
        id: 'rem-24',
        name: 'Anna Schmidt',
        avatarUrl: 'https://randomuser.me/api/portraits/women/15.jpg',
        rating: 5,
        content: {
            en: 'I would recommend this to all my friends.',
            de: 'Ich würde dies all meinen Freunden empfehlen.',
            fr: 'Je recommanderais ceci à tous mes amis.',
            es: 'Recomendaría esto a todos mis amigos.'
        }
    },
    {
        id: 'rem-25',
        name: 'Peter Jones',
        avatarUrl: 'https://randomuser.me/api/portraits/men/19.jpg',
        rating: 4,
        content: {
            en: 'Very happy with the quick shipping time.',
            de: 'Sehr zufrieden mit der schnellen Versandzeit.',
            fr: 'Très content du délai d\'expédition rapide.',
            es: 'Muy feliz con el tiempo de envío rápido.'
        }
    }
];

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { productId, locale = 'en' } = req.query;

    if (!productId) {
        return res.status(400).json({ error: 'ProductId is required' });
    }

    // Deterministic selection based on productId
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
        hash = ((hash << 5) - hash) + productId.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash);

    // Vary the count: range 3 to 12
    const count = 3 + (seed % 10);

    const selectedReviews = [];
    const usedIndices = new Set();

    // Ensure varied lengths by mixing index selection strategies
    for (let i = 0; i < count; i++) {
        // use varying strides to pick from diverse parts of the array
        let index = (seed + i * 7) % masterReviews.length;

        // Linear probe if collision
        while (usedIndices.has(index)) {
            index = (index + 1) % masterReviews.length;
        }
        usedIndices.add(index);

        const review = masterReviews[index];

        selectedReviews.push({
            id: review.id,
            name: review.name,
            avatarUrl: review.avatarUrl,
            rating: review.rating,
            comment: review.content[locale] || review.content['en']
        });
    }

    // Deterministic sort to mix lengths
    selectedReviews.sort((a, b) => {
        const valA = a.id.charCodeAt(4);
        const valB = b.id.charCodeAt(4);
        return valA - valB;
    });

    res.status(200).json(selectedReviews);
}
