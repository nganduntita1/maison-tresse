/* Maison Tresse — catalogue & content.
   Photos are Unsplash placeholders; swap `img` ids (or use full URLs) for real product shots. */
window.MT_DATA = (() => {
  const img = (id, w = 900, h) =>
    id.startsWith('http') || id.startsWith('data:')
      ? id
      : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=78`;

  const products = [
    {
      id: 'sable-silk', name: 'Sable Silk', style: 'Bone Straight', tags: ['straight'],
      color: '1B Natural Black', swatches: ['#16100d', '#3a2419', '#5b3420'],
      length: 26, lengths: [18, 22, 26, 30], lace: 'HD 13×4 lace', density: '180%',
      price: 289, compare: 349, rating: 4.9, reviews: 1284, badge: 'Bestseller', best: true,
      img: '1619218533116-f050e7d91d91',
      desc: 'Glass-like, bone-straight virgin hair that swings with every turn. Pre-plucked hairline, bleached knots and an HD lace that melts into every skin tone.'
    },
    {
      id: 'riviera-curl', name: 'Riviera Deep Curl', style: 'Deep Curl', tags: ['curly'],
      color: '1B Natural Black', swatches: ['#16100d', '#5b3420'],
      length: 20, lengths: [16, 20, 24], lace: 'HD 13×6 lace', density: '200%',
      price: 259, rating: 4.8, reviews: 932, badge: 'New', best: true,
      img: '1508002366005-75a695ee2d17',
      desc: 'Bouncy, defined curls with sun-kissed movement. Wash, scrunch and go — the pattern springs right back.'
    },
    {
      id: 'honey-wave', name: 'Honey Body Wave', style: 'Body Wave', tags: ['wavy', 'colored'], keywords: 'blonde',
      color: '#27 Honey Blonde', swatches: ['#b77b3f', '#d9a465', '#3a2419'],
      length: 24, lengths: [20, 24, 28], lace: 'HD 13×4 lace', density: '180%',
      price: 319, compare: 379, rating: 4.9, reviews: 1108, badge: 'Bestseller', best: true,
      img: '1512084747998-038941f49b84',
      desc: 'Pre-coloured honey blonde with soft, glossy S-waves. Dimension built in, root to tip.'
    },
    {
      id: 'platinum-613', name: 'Platinum 613', style: 'Body Wave', tags: ['wavy', 'colored'], keywords: 'blonde platinum',
      color: '613 Platinum Blonde', swatches: ['#e8d2a6', '#d9a465'],
      length: 26, lengths: [22, 26, 30], lace: 'Full HD lace', density: '180%',
      price: 359, rating: 4.7, reviews: 486, badge: 'Limited', best: true,
      img: '1588747020611-6ae361065b72',
      desc: 'Our lightest blonde: a 613 canvas you can wear as it comes or tone to any shade you dream up.'
    },
    {
      id: 'chestnut-spiral', name: 'Chestnut Spiral', style: 'Spiral Curl', tags: ['curly', 'colored'],
      color: '#4 Chestnut', swatches: ['#5b3420', '#16100d'],
      length: 22, lengths: [18, 22, 26], lace: 'HD 5×5 closure', density: '200%',
      price: 269, rating: 4.8, reviews: 721,
      img: '1611590027211-b954fd027b51',
      desc: 'Warm chestnut spirals with natural volume. Glueless, breathable and beginner-friendly.'
    },
    {
      id: 'copper-coil', name: 'Copper Coil', style: 'Tight Curl', tags: ['curly', 'colored'], keywords: 'red ginger',
      color: '#350 Copper', swatches: ['#a5461d', '#5b3420'],
      length: 18, lengths: [14, 18, 22], lace: 'HD 13×4 lace', density: '200%',
      price: 249, rating: 4.8, reviews: 402, badge: 'New',
      img: '1594185230805-68f37369b450',
      desc: 'A spiced copper with tight, juicy coils. Turns heads in every light.'
    },
    {
      id: 'coco-bob', name: 'Coco Curly Bob', style: 'Curly Bob', tags: ['bob', 'curly'], keywords: 'short',
      color: '#2 Espresso', swatches: ['#3a2419', '#16100d'],
      length: 12, lengths: [10, 12, 14], lace: 'HD 5×5 closure', density: '180%',
      price: 179, compare: 219, rating: 4.9, reviews: 1530, badge: 'Under $200', best: true,
      img: '1596663125334-e2bdd5387b66',
      desc: 'Our cult-favourite curly bob. Light, glueless and ready in under five minutes.'
    },
    {
      id: 'bronde-glam', name: 'Bronde Glam Wave', style: 'Glam Wave', tags: ['wavy', 'colored'], keywords: 'blonde balayage brown',
      color: 'Balayage 4/27', swatches: ['#7a4a2c', '#d9a465'],
      length: 22, lengths: [18, 22, 26], lace: 'HD 13×4 lace', density: '180%',
      price: 299, rating: 4.8, reviews: 655,
      img: '1440589473619-3cde28941638',
      desc: 'Hand-painted balayage — brunette roots melting into caramel-blonde ends.'
    },
    {
      id: 'crown-afro', name: 'Kinky Crown Afro', style: 'Kinky Coily', tags: ['coily'], keywords: 'afro 4c natural',
      color: '1B Natural Black', swatches: ['#16100d', '#3a2419'],
      length: 16, lengths: [12, 16, 20], lace: 'HD 13×4 lace', density: '250%',
      price: 239, rating: 4.9, reviews: 867, badge: 'Bestseller', best: true,
      img: '1632765854612-9b02b6ec2b15',
      desc: '4C-inspired kinky texture with full, cloud-soft volume and an undetectable, natural hairline.'
    },
    {
      id: 'midnight-water', name: 'Midnight Water Wave', style: 'Water Wave', tags: ['wavy', 'curly'],
      color: '1B Natural Black', swatches: ['#16100d'],
      length: 28, lengths: [24, 28, 32], lace: 'HD 13×6 lace', density: '200%',
      price: 339, rating: 4.8, reviews: 590,
      img: '1535579710123-3c0f261c474e',
      desc: 'Long, wet-look water waves with endless definition and a deep parting space.'
    },
    {
      id: 'espresso-silk', name: 'Espresso Silk Wave', style: 'Loose Wave', tags: ['wavy'], keywords: 'brown',
      color: '#2 Espresso', swatches: ['#3a2419', '#5b3420'],
      length: 26, lengths: [22, 26, 30], lace: 'HD 13×4 lace', density: '180%',
      price: 279, rating: 4.9, reviews: 744,
      img: '1595784279873-62b38b5e7cd6',
      desc: 'Rich espresso brown with soft, romantic waves. Everyday luxe.'
    },
    {
      id: 'ebene-curl', name: 'Ébène Long Curl', style: 'Long Curl', tags: ['curly'],
      color: '1B Natural Black', swatches: ['#16100d'],
      length: 30, lengths: [26, 30, 34], lace: 'Full HD lace', density: '250%',
      price: 389, rating: 5.0, reviews: 318, badge: 'Couture',
      img: '1569430548104-6ca1cda3ec41',
      desc: 'Our most dramatic unit: waist-grazing curls on full lace for limitless styling.'
    }
  ];

  const lookbook = [
    { img: '1632765866070-3fadf25d3d5b', product: 'crown-afro', alt: 'Woman with a voluminous afro, hands raised to her hair' },
    { img: '1649976389678-48bf204d813d', product: 'sable-silk', alt: 'Model flipping long hair against a yellow backdrop' },
    { img: '1529123202249-4f6224196c9b', product: 'crown-afro', alt: 'Smiling woman with a natural afro outdoors' },
    { img: '1654340419015-02be081b96a1', product: 'espresso-silk', alt: 'Black and white portrait with long flowing hair' },
    { img: '1583147610149-78ac5cb5a303', product: 'riviera-curl', alt: 'Woman with curly hair wearing round sunglasses' },
    { img: '1701163802831-12dea78536ed', product: 'copper-coil', alt: 'Woman with copper red hair' },
    { img: '1616104130421-6eccff73df1d', product: 'chestnut-spiral', alt: 'Curly hair fanned out around a smiling face' },
    { img: '1709810529099-0ce6102692df', product: 'crown-afro', alt: 'Woman with an afro against a red backdrop' },
    { img: '1613498382159-0972b7b4c9f1', product: 'coco-bob', alt: 'Short curly hair and a leather jacket' },
    { img: '1588527962980-72746d95973e', product: 'riviera-curl', alt: 'Back view of defined black curls' },
    { img: '1707162740897-cf2f057d2a41', product: 'crown-afro', alt: 'Model with a rounded afro in a black outfit' },
    { img: '1549768960-6e7b0c8b5d94', product: 'midnight-water', alt: 'Woman running her hands through long hair' }
  ];

  const avatars = ['1632765854612-9b02b6ec2b15', '1508002366005-75a695ee2d17', '1611590027211-b954fd027b51', '1594185230805-68f37369b450'];

  // Placeholder testimonials for the prototype — replace with real reviews.
  const reviews = [
    { name: 'Amara O.', city: 'Atlanta, GA', product: 'Sable Silk', text: 'The lace genuinely disappeared. Everyone at work asked who did my silk press — it was a wig the whole time.' },
    { name: 'Jess M.', city: 'London, UK', product: 'Honey Body Wave', text: 'Even prettier in person. Zero shedding after six washes and it arrived pre-plucked and ready to wear.' },
    { name: 'Naledi K.', city: 'Johannesburg', product: 'Kinky Crown Afro', text: 'Finally a kinky texture that looks like my own hair. The density is perfect — full but never bulky.' },
    { name: 'Camille R.', city: 'Paris, FR', product: 'Platinum 613', text: 'I toned it to a soft champagne and it took the colour beautifully. Knots already bleached. Perfection.' },
    { name: 'Destiny W.', city: 'Houston, TX', product: 'Coco Curly Bob', text: 'Glueless, light, and it took me four minutes to put on. I now own it in two colours.' },
    { name: 'Priya S.', city: 'Toronto, CA', product: 'Espresso Silk Wave', text: 'I was nervous ordering my first wig online. The try-on guarantee sold me — I never sent it back.' },
    { name: 'Imani B.', city: 'Lagos, NG', product: 'Riviera Deep Curl', text: 'Curls stay defined with just water and leave-in. Their stylists helped me choose the perfect length.' },
    { name: 'Sofia L.', city: 'Miami, FL', product: 'Ébène Long Curl', text: 'Full lace means I can wear a high ponytail. Worth every cent — it feels couture.' },
    { name: 'Keisha T.', city: 'Chicago, IL', product: 'Wig Studio custom', text: 'I designed mine in the Wig Studio and it arrived exactly like the preview. Obsessed is an understatement.' },
    { name: 'Hana Y.', city: 'Seoul, KR', product: 'Midnight Water Wave', text: 'The unboxing felt like a luxury gift. The hair is silky, soft and so easy to style.' }
  ];

  const studio = {
    minLen: 12, maxLen: 30, perInch: 8,
    textures: [
      { id: 'straight', label: 'Straight', base: 149, p: { amp: 2, freq: 0.02, curl: 0, volume: 0.12, puff: 0, shine: 0.62, coh: 0.9 } },
      { id: 'bodywave', label: 'Body Wave', base: 159, p: { amp: 17, freq: 0.026, curl: 0.12, volume: 0.34, puff: 0.06, shine: 0.5, coh: 0.85 } },
      { id: 'deepwave', label: 'Deep Wave', base: 169, p: { amp: 12, freq: 0.05, curl: 0.4, volume: 0.52, puff: 0.14, shine: 0.38, coh: 0.55 } },
      { id: 'curly', label: 'Curly', base: 179, p: { amp: 11, freq: 0.1, curl: 0.95, volume: 0.82, puff: 0.32, shine: 0.24, coh: 0.15 } },
      { id: 'kinky', label: 'Kinky Coily', base: 189, p: { amp: 6, freq: 0.2, curl: 1.05, volume: 1.25, puff: 1, shine: 0.1, coh: 0 } }
    ],
    colors: [
      { id: '1b', label: '1B Natural Black', root: '#0d0a09', mid: '#1f1714', tip: '#2e231d', fee: 0 },
      { id: '2', label: '#2 Espresso', root: '#1a110d', mid: '#3b2519', tip: '#4f3324', fee: 0 },
      { id: '4', label: '#4 Chestnut', root: '#2a170f', mid: '#613822', tip: '#85532f', fee: 15 },
      { id: '27', label: '#27 Honey Blonde', root: '#5a381f', mid: '#b47a3c', tip: '#dcaa6a', fee: 35 },
      { id: '613', label: '613 Platinum', root: '#a88a5f', mid: '#e3cc9e', tip: '#f6ead0', fee: 60 },
      { id: '99j', label: '99J Burgundy', root: '#24090f', mid: '#5c1424', tip: '#822236', fee: 35 },
      { id: '350', label: '#350 Copper', root: '#4a1d0c', mid: '#a1441c', tip: '#cc6a31', fee: 35 },
      { id: 'ombre', label: 'Ombré 1B/27', root: '#100b09', mid: '#3d2618', tip: '#c98e4d', fee: 45 }
    ],
    densities: [
      { id: '150', label: '150%', fee: 0, count: 330 },
      { id: '180', label: '180%', fee: 40, count: 440 },
      { id: '250', label: '250%', fee: 95, count: 600 }
    ],
    laces: [
      { id: '5x5', label: '5×5 Closure', fee: 0 },
      { id: '13x4', label: '13×4 HD', fee: 40 },
      { id: 'full', label: 'Full Lace', fee: 140 }
    ],
    initial: { texture: 'bodywave', length: 22, color: '1b', density: '180', lace: '13x4' }
  };

  const atelier = ['The archive', 'On the block', 'In the colour bar', 'Final fitting'];

  return { img, products, lookbook, avatars, reviews, studio, atelier, freeShip: 250 };
})();
