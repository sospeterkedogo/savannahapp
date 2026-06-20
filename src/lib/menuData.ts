import type { MenuDetail } from '../types/app';

export const menuDetails = {
  mainmenu: {
    title: 'Main Menu',
    image: '/menudesigns/mainmenu.svg',
    description: 'A curated selection of our signature dishes, appetizers, and mains.',
    items: [
      {
        name: 'Grilled Salmon with Lemon Butter Sauce',
        description: 'Char-grilled fillet with greens and a bright lemon butter finish.',
        price: '$24',
      },
      {
        name: 'Classic Cheeseburger with Fries',
        description: 'House burger, melted cheese, crisp salad, pickles, and fries.',
        price: '$18',
      },
      {
        name: 'Caesar Salad with Grilled Chicken',
        description: 'Romaine, parmesan, croutons, Caesar dressing, and grilled chicken.',
        price: '$17',
      },
      {
        name: 'Margherita Pizza with Fresh Basil',
        description: 'Tomato, mozzarella, basil, and olive oil on a crisp base.',
        price: '$16',
      },
      {
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center and vanilla cream.',
        price: '$10',
      },
    ],
  },
  menupasta: {
    title: 'Pasta',
    image: '/menudesigns/mainmenu.svg',
    description: 'Handmade pastas with rich sauces and fresh ingredients.',
    items: [
      { name: 'Truffle Tagliatelle', description: 'Silky ribbons with truffle cream and parmesan.', price: '$21' },
      { name: 'Lobster Ravioli', description: 'Filled pasta with lobster, tomato, and herb butter.', price: '$26' },
      { name: 'Classic Spaghetti Carbonara', description: 'Pancetta, egg, pecorino, and cracked black pepper.', price: '$19' },
      { name: 'Pesto Genovese', description: 'Basil pesto, pine nuts, parmesan, and fresh pasta.', price: '$18' },
    ],
  },
  sdish: {
    title: 'Signature Dishes',
    image: '/menudesigns/sdish.svg',
    description: "Chef's most celebrated creations, crafted for a memorable dining experience.",
    items: [
      { name: 'Wagyu Beef Tartare', description: 'Hand-cut wagyu with capers, herbs, and toasted sourdough.', price: '$28' },
      { name: 'Miso Black Cod', description: 'Sweet miso glaze, jasmine rice, and pickled vegetables.', price: '$32' },
      { name: "Duck a l'Orange", description: 'Crisp duck breast with orange sauce and seasonal greens.', price: '$30' },
    ],
  },
  'smoke&grill': {
    title: 'Smoke & Grill',
    image: '/menudesigns/smoke&grill.svg',
    description: 'Charcoal-grilled specialties and smoked meats with bold flavors.',
    items: [
      { name: 'Smoked Brisket', description: 'Slow-smoked beef brisket with house BBQ sauce.', price: '$25' },
      { name: 'BBQ Ribs', description: 'Tender ribs glazed with smoky Savannah sauce.', price: '$24' },
      { name: 'Grilled Lamb Chops', description: 'Rosemary lamb chops with charred vegetables.', price: '$29' },
    ],
  },
  specialsteak: {
    title: 'Special Steak',
    image: '/menudesigns/specialsteak.svg',
    description: 'Premium cuts, expertly aged and grilled to perfection.',
    items: [
      { name: 'Tomahawk Ribeye', description: 'A generous bone-in ribeye for a showpiece steak dinner.', price: '$56' },
      { name: 'Filet Mignon', description: 'Tender center-cut filet with herb butter.', price: '$42' },
      { name: 'Porterhouse', description: 'Classic porterhouse with roasted garlic jus.', price: '$48' },
    ],
  },
  steak: {
    title: 'Steak',
    image: '/menudesigns/specialsteak.svg',
    description: 'Classic steakhouse favorites, cooked to your liking.',
    items: [
      { name: 'Sirloin', description: 'Lean, flavorful sirloin with fries and salad.', price: '$27' },
      { name: 'Ribeye', description: 'Marbled ribeye with peppercorn sauce.', price: '$34' },
      { name: 'T-Bone', description: 'Grilled T-bone with garlic butter and seasonal sides.', price: '$36' },
    ],
  },
  breakfast: {
    title: 'Breakfast',
    image: '/menudesigns/breakfast.svg',
    description: 'Start your day with our gourmet breakfast options.',
    items: [
      { name: 'Eggs Benedict', description: 'Poached eggs, hollandaise, ham, and toasted muffin.', price: '$15' },
      { name: 'Avocado Toast', description: 'Smashed avocado, chilli, lime, and sourdough.', price: '$13' },
      { name: 'French Toast', description: 'Brioche French toast with berries and maple syrup.', price: '$14' },
    ],
  },
  cocktail: {
    title: 'Cocktail',
    image: '/menudesigns/cocktail.svg',
    description: 'Signature cocktails crafted by our expert mixologists.',
    items: [
      { name: 'Savannah Gold', description: 'Bourbon, honey, lemon, and aromatic bitters.', price: '$13' },
      { name: 'Classic Martini', description: 'Gin or vodka with dry vermouth and olives.', price: '$12' },
      { name: 'Negroni', description: 'Gin, Campari, and sweet vermouth over ice.', price: '$12' },
    ],
  },
  'more-cocktail': {
    title: 'More Cocktails',
    image: '/menudesigns/more-cocktail.svg',
    description: 'Explore our extended cocktail list for every taste.',
    items: [
      { name: 'Espresso Martini', description: 'Vodka, coffee liqueur, and fresh espresso.', price: '$13' },
      { name: 'Aperol Spritz', description: 'Aperol, prosecco, and soda with orange.', price: '$11' },
      { name: 'Old Fashioned', description: 'Whiskey, bitters, sugar, and orange peel.', price: '$12' },
    ],
  },
  'even-more': {
    title: 'Even More',
    image: '/menudesigns/more-cocktail.svg',
    description: 'Discover more culinary delights and seasonal specials.',
    items: [
      { name: "Chef's Tasting Menu", description: 'A changing multi-course selection from the kitchen.', price: '$65' },
      { name: 'Seasonal Desserts', description: 'Freshly prepared desserts inspired by the season.', price: '$11' },
      { name: 'Vegan Specials', description: 'Plant-led dishes with bold grill-house flavor.', price: '$19' },
    ],
  },
} satisfies Record<string, MenuDetail>;

export const menus = Object.entries(menuDetails).map(([slug, menu]) => ({
  slug,
  src: menu.image,
  alt: menu.title,
  label: menu.title,
}));
