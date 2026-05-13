// src/utils/products.js
export const PRODUCTS = [
  {
    id: 1,
    name: 'Arraw de Mil',
    slug: 'arraw-de-mil',
    shortDesc: 'Petits grains ronds précuits au sable filtré. Authentique, sans additifs.',
    longDesc: "L'Arraw de Mil est une céréale emblématique de la cuisine sénégalaise. Ces petits grains ronds sont soigneusement sélectionnés puis précuits au sable filtré selon la méthode ancestrale. Ce procédé unique préserve toutes les qualités nutritives du mil tout en réduisant considérablement le temps de préparation.",
    tag: 'Grains ronds · Précuit',
    badge: 'Bio',
    badgeColor: 'green',
    color: '#1a6b35',
    imgPosition: '15% center',
    ingredients: ['Mil 100% bio', 'Origine Sénégal', 'Sans gluten naturel', 'Sans additifs', 'Sans conservateurs'],
    nutrition: [
      ['Énergie', '360 kcal/100g'],
      ['Protéines', '11g/100g'],
      ['Glucides', '72g/100g'],
      ['Fibres', '8g/100g'],
      ['Lipides', '4g/100g'],
      ['Fer', '8mg/100g'],
    ],
    recipe: {
      title: 'Thiéré yapp (Couscous au poulet)',
      steps: "1. Faire bouillir eau salée avec légumes (carottes, navets). 2. Ajouter poulet assaisonné, cuire 30 min. 3. Verser l'Arraw précuit dans un bol, ajouter 200ml d'eau chaude, couvrir 5 min. 4. Égrainer à la fourchette et servir avec la sauce."
    },
    reviews: [
      { name: 'Mariama D.', city: 'Dakar', stars: 5, text: 'Parfait ! Les grains sont bien cuits, prêts rapidement. Authentique et délicieux !' },
      { name: 'Moussa K.', city: 'Saint-Louis', stars: 5, text: 'Utilisé chaque vendredi pour le thiéré. Vraiment excellent, on sent le côté authentique.' },
    ]
  },
  {
    id: 2,
    name: 'Thiéré de Mil',
    slug: 'thiere-de-mil',
    shortDesc: 'Couscous fin et doré, précuit. Le plus commandé — texture légère, saveur authentique.',
    longDesc: "Le Thiéré de Mil est le couscous sénégalais par excellence. Ces grains fins et dorés sont obtenus par un roulage minutieux du mil et une cuisson au sable filtré. Précuit pour vous, il se prépare en quelques minutes tout en conservant l'authenticité du goût ancestral.",
    tag: 'Couscous de mil · Précuit',
    badge: '⭐ Populaire',
    badgeColor: 'gold',
    color: '#c8982a',
    imgPosition: '50% center',
    ingredients: ['Mil 100% bio', 'Origine Sénégal', 'Précuit au sable filtré', 'Sans additifs', 'Qualité premium'],
    nutrition: [
      ['Énergie', '355 kcal/100g'],
      ['Protéines', '10g/100g'],
      ['Glucides', '73g/100g'],
      ['Fibres', '7g/100g'],
      ['Lipides', '3.5g/100g'],
      ['Fer', '7mg/100g'],
    ],
    recipe: {
      title: 'Thiébou Yapp avec Thiéré',
      steps: "1. Préparer sauce tomate avec oignons, ail, épices. 2. Ajouter viande et légumes, cuire 30 min. 3. Verser le Thiéré précuit, ajouter 180ml eau bouillante, couvrir 5 min, égrainer. 4. Servir avec la sauce par-dessus."
    },
    reviews: [
      { name: 'Fatou B.', city: 'Dakar, Médina', stars: 5, text: 'Le meilleur Thiéré ! La texture est parfaite et ça se prépare très vite. Ma famille adore.' },
      { name: 'Ibrahima S.', city: 'Thiès', stars: 5, text: 'Commandé plusieurs fois. Qualité constante à chaque livraison.' },
    ]
  },
  {
    id: 3,
    name: 'Thiakry de Mil',
    slug: 'thiakry-de-mil',
    shortDesc: 'Le dessert sénégalais emblématique. Parfait avec du lait caillé. 100% naturel.',
    longDesc: "Le Thiakry est LE dessert sénégalais incontournable. Ces grains de mil travaillés selon le savoir-faire traditionnel ont une texture unique en bouche. Précuit avec soin, il s'associe parfaitement au lait caillé sucré pour créer un dessert inoubliable.",
    tag: 'Dessert traditionnel · Précuit',
    badge: 'Artisanal',
    badgeColor: 'earth',
    color: '#b5873a',
    imgPosition: '85% center',
    ingredients: ['Mil 100% bio', 'Origine Sénégal', 'Savoir-faire traditionnel', 'Texture artisanale', 'Sans additifs'],
    nutrition: [
      ['Énergie', '350 kcal/100g'],
      ['Protéines', '10g/100g'],
      ['Glucides', '71g/100g'],
      ['Fibres', '8g/100g'],
      ['Lipides', '4g/100g'],
      ['Calcium', '20mg/100g'],
    ],
    recipe: {
      title: 'Thiakry au lait caillé (dessert traditionnel)',
      steps: "1. Tremper le Thiakry précuit dans eau tiède 10 min, égoutter. 2. Mélanger avec lait caillé (yaourt) sucré selon goût. 3. Ajouter vanille ou noix de coco râpée. 4. Servir frais, décoré de raisins secs."
    },
    reviews: [
      { name: 'Aissatou N.', city: 'Dakar', stars: 5, text: 'Exactement le goût de mon enfance ! Authentique et délicieux. Bravo Bio Sén !' },
      { name: 'Rokhaya D.', city: 'Ziguinchor', stars: 5, text: 'Je prépare ça pour les fêtes et tout le monde en redemande. Qualité au top.' },
    ]
  }
]

export const PRICES = {
  '500g': 800,
  '1kg': 1600
}

export const PROMO_CODES = {
  'BIOS10': { pct: 0.10, label: '10% de réduction' },
  'BIO20': { pct: 0.20, label: '20% de réduction' },
  'SENEGAL15': { pct: 0.15, label: '15% de réduction' },
  'BIOSEN10': { pct: 0.10, label: '10% de réduction' },
}

export const STATUS_MAP = {
  pending:   { label: 'En attente',  color: '#8a6010', bg: '#fff8e0', dot: '#c8982a', step: 0 },
  confirmed: { label: 'Confirmée',   color: '#1a5a30', bg: '#e0f0e8', dot: '#1a6b35', step: 1 },
  shipped:   { label: 'Expédiée',    color: '#1a3a6a', bg: '#e0eef8', dot: '#1a5a8a', step: 2 },
  delivered: { label: 'Livrée',      color: '#1a4a15', bg: '#e8f5e0', dot: '#2a8a1a', step: 3 },
  cancelled: { label: 'Annulée',     color: '#8a1a1a', bg: '#fde8e8', dot: '#c82a2a', step: -1 },
}

export const STOCK_KEYS = [
  { key: 'Arraw-500g',   label: 'Arraw 500g',   max: 100 },
  { key: 'Arraw-1kg',    label: 'Arraw 1kg',    max: 50  },
  { key: 'Thiéré-500g',  label: 'Thiéré 500g',  max: 100 },
  { key: 'Thiéré-1kg',   label: 'Thiéré 1kg',   max: 50  },
  { key: 'Thiakry-500g', label: 'Thiakry 500g', max: 80  },
  { key: 'Thiakry-1kg',  label: 'Thiakry 1kg',  max: 40  },
]

export const WHATSAPP_NUMBER = '221770686034'
export const CONTACT_EMAIL   = 'siregaye990@gmail.com'
export const CONTACT_PHONE   = '+221 77 068 60 34'
