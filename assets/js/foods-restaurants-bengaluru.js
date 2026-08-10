(function () {
  "use strict";
  window.Nourish = window.Nourish || {};
  window.Nourish.foods = window.Nourish.foods || [];
  const veg = ["vegetarian"], nonveg = ["omnivore"], vegan = ["vegan"];
  function add(restaurant, id, name, serving, diet, allergens, kcal, protein, carbs, fat, fiber, verified) {
    window.Nourish.foods.push({ id: `restaurant-${id}`, name: `${restaurant} — ${name}`, displayName: name, restaurant, emoji: "🍽️", category: "restaurant menu", servingLabel: serving, diets: diet, allergens: allergens || [], calories: kcal, protein, carbs, fat, fiber: fiber || 1, calcium: 45, iron: 1.3, potassium: 230, vitaminC: 2, nutritionSource: verified ? "Published Indian restaurant nutrition" : "Estimated restaurant serving", nutritionVerified: Boolean(verified), tags: ["restaurant", "bengaluru", restaurant.toLowerCase(), verified ? "published-nutrition" : "estimated-nutrition"] });
  }

  // McDonald's India — published Indian nutrition values where available.
  add("McDonald's", "mcd-mcaloo-tikki", "McAloo Tikki", "1 burger", veg, ["wheat", "milk"], 353, 8, 50, 14, 3, true);
  add("McDonald's", "mcd-chicken-mcgrill", "Chicken McGrill", "1 burger", nonveg, ["wheat", "egg"], 282, 12, 33, 11, 2, true);
  add("McDonald's", "mcd-veg-pizza-mcpuff", "Veg Pizza McPuff", "1 piece", veg, ["wheat", "milk"], 226, 4, 24, 13, 2, true);
  add("McDonald's", "mcd-mcegg", "McEgg", "1 burger", nonveg, ["wheat", "egg"], 281, 12, 32, 12, 2, true);
  add("McDonald's", "mcd-mcaloo-wrap", "McAloo Wrap with Chipotle Sauce", "1 wrap", veg, ["wheat", "milk"], 357, 5, 39, 20, 4, true);
  add("McDonald's", "mcd-big-spicy-chicken-wrap", "Big Spicy Chicken Wrap", "1 wrap", nonveg, ["wheat", "milk", "egg"], 638, 25, 57, 34, 5, true);
  add("McDonald's", "mcd-hash-brown", "Hash Brown", "1 piece", veg, ["wheat"], 166, 2, 16, 10, 2, true);
  add("McDonald's", "mcd-hotcakes", "Hot Cakes", "1 serving", veg, ["wheat", "milk", "egg"], 372, 6, 64, 10, 2, true);
  add("McDonald's", "mcd-chocolate-shake-regular", "Chocolate Milkshake Regular", "1 regular", veg, ["milk"], 175, 4, 30, 4, 1, true);
  add("McDonald's", "mcd-mcflurry-small", "McFlurry Choco Crunch Small", "1 small", veg, ["milk", "wheat"], 153, 3, 23, 5, 1, true);
  add("McDonald's", "mcd-fries-medium", "French Fries Medium", "1 medium", veg, [], 340, 4, 44, 16, 4, false);
  add("McDonald's", "mcd-maharaja-mac-chicken", "Chicken Maharaja Mac", "1 burger", nonveg, ["wheat", "milk", "egg"], 545, 26, 52, 26, 4, true);

  // KFC India — calories and allergens published on the current Indian menu.
  add("KFC", "kfc-double-chicken-dynamite", "Double Chicken Dynamite", "1 burger / 250 g", nonveg, ["wheat", "soy", "milk"], 720, 34, 55, 40, 3, true);
  add("KFC", "kfc-zinger-pro", "Zinger Pro Burger", "1 burger / 225 g", nonveg, ["wheat", "soy", "milk"], 529, 27, 48, 25, 3, true);
  add("KFC", "kfc-spicy-zinger", "Spicy Zinger Burger", "1 burger / 215 g", nonveg, ["wheat", "soy", "milk"], 439, 24, 42, 20, 3, true);
  add("KFC", "kfc-paneer-zinger", "Paneer Zinger Burger", "1 burger / 215 g", veg, ["wheat", "soy", "milk"], 643, 21, 62, 35, 4, true);
  add("KFC", "kfc-veg-zinger", "Veg Zinger Burger", "1 burger / 230 g", veg, ["wheat", "soy", "milk"], 619, 16, 75, 28, 5, true);
  add("KFC", "kfc-gold-chicken-zinger", "Gold Edition Chicken Zinger", "1 burger / 250 g", nonveg, ["wheat", "soy", "milk"], 678, 30, 54, 38, 3, true);
  add("KFC", "kfc-indian-spicy-veg-roll", "Indian Spicy Veg Roll", "1 roll / 145 g", veg, ["wheat", "milk"], 447, 11, 55, 20, 4, true);
  add("KFC", "kfc-all-chicken-box", "All Chicken Box", "1 box / 225 g", nonveg, ["wheat"], 686, 46, 34, 42, 2, true);
  add("KFC", "kfc-choco-mud-pie", "Choco Mud Pie", "1 piece / 93 g", veg, ["wheat", "soy", "milk"], 241, 3, 33, 11, 2, true);
  add("KFC", "kfc-choco-lava-cake", "Choco Lava Cake", "1 piece / 60 g", veg, ["wheat", "milk"], 343, 4, 45, 17, 2, true);
  add("KFC", "kfc-popcorn-regular", "Popcorn Chicken Regular", "1 regular", nonveg, ["wheat"], 350, 22, 28, 17, 2, false);
  add("KFC", "kfc-fries-medium", "French Fries Medium", "1 medium", veg, [], 320, 4, 42, 15, 4, false);

  // Pizza Hut India — serving values based on the India nutrition booklet/menu.
  add("Pizza Hut", "ph-margherita-personal", "Margherita Personal Pizza", "1 personal pizza", veg, ["wheat", "milk"], 620, 24, 82, 22, 5, true);
  add("Pizza Hut", "ph-veggie-feast-personal", "Veggie Feast Personal Pizza", "1 personal pizza", veg, ["wheat", "milk"], 650, 25, 86, 23, 7, true);
  add("Pizza Hut", "ph-paneer-makhni-personal", "Paneer Makhni Personal Pizza", "1 personal pizza", veg, ["wheat", "milk"], 720, 29, 88, 29, 6, true);
  add("Pizza Hut", "ph-chicken-supreme-personal", "Chicken Supreme Personal Pizza", "1 personal pizza", nonveg, ["wheat", "milk"], 760, 38, 82, 31, 5, true);
  add("Pizza Hut", "ph-garlic-bread", "Garlic Bread", "4 pieces", veg, ["wheat", "milk"], 410, 10, 54, 17, 3, false);
  add("Pizza Hut", "ph-cheesy-garlic-bread", "Cheesy Garlic Bread", "4 pieces", veg, ["wheat", "milk"], 520, 17, 56, 26, 3, false);
  add("Pizza Hut", "ph-white-sauce-chicken-pasta", "Cosy Comfort White Sauce Chicken Pasta", "1 serving", nonveg, ["wheat", "milk"], 266, 14, 32, 9, 3, true);
  add("Pizza Hut", "ph-mac-cheese-chicken-pasta", "Penne McN Cheese & Chicken Pasta", "1 serving", nonveg, ["wheat", "milk"], 224, 13, 27, 7, 2, true);

  // Domino's India — outlet recipes and crust selection change totals.
  add("Domino's", "dom-margherita-regular", "Margherita Regular Pizza", "1 regular pizza", veg, ["wheat", "milk"], 720, 26, 96, 26, 5, false);
  add("Domino's", "dom-farmhouse-regular", "Farmhouse Regular Pizza", "1 regular pizza", veg, ["wheat", "milk"], 830, 30, 105, 32, 8, false);
  add("Domino's", "dom-peppy-paneer-regular", "Peppy Paneer Regular Pizza", "1 regular pizza", veg, ["wheat", "milk"], 880, 34, 102, 38, 7, false);
  add("Domino's", "dom-veg-extravaganza-regular", "Veg Extravaganza Regular Pizza", "1 regular pizza", veg, ["wheat", "milk"], 900, 33, 110, 38, 9, false);
  add("Domino's", "dom-chicken-dominator-regular", "Chicken Dominator Regular Pizza", "1 regular pizza", nonveg, ["wheat", "milk"], 980, 52, 99, 42, 5, false);
  add("Domino's", "dom-garlic-breadsticks", "Garlic Breadsticks", "1 portion", veg, ["wheat", "milk"], 390, 9, 52, 16, 3, false);
  add("Domino's", "dom-stuffed-garlic-bread", "Stuffed Garlic Bread", "1 portion", veg, ["wheat", "milk"], 570, 18, 60, 29, 4, false);
  add("Domino's", "dom-choco-lava-cake", "Choco Lava Cake", "1 cake", veg, ["wheat", "milk", "soy"], 350, 5, 44, 18, 2, false);

  // Subway India — totals vary with bread, cheese and sauces.
  add("Subway", "sub-veggie-delite-6", "Veggie Delite 6-inch", "1 sub, standard build", vegan, ["wheat"], 230, 8, 44, 3, 5, false);
  add("Subway", "sub-paneer-tikka-6", "Paneer Tikka 6-inch", "1 sub, standard build", veg, ["wheat", "milk"], 430, 19, 54, 16, 6, false);
  add("Subway", "sub-corn-peas-6", "Corn & Peas 6-inch", "1 sub, standard build", veg, ["wheat", "milk"], 390, 13, 58, 12, 7, false);
  add("Subway", "sub-chicken-teriyaki-6", "Chicken Teriyaki 6-inch", "1 sub, standard build", nonveg, ["wheat", "soy"], 370, 25, 57, 6, 5, false);
  add("Subway", "sub-roasted-chicken-6", "Roasted Chicken 6-inch", "1 sub, standard build", nonveg, ["wheat"], 350, 27, 48, 7, 5, false);
  add("Subway", "sub-chicken-tikka-6", "Chicken Tikka 6-inch", "1 sub, standard build", nonveg, ["wheat", "milk"], 400, 26, 51, 11, 5, false);
  add("Subway", "sub-tuna-6", "Tuna 6-inch", "1 sub, standard build", nonveg, ["wheat", "fish", "egg"], 480, 24, 46, 23, 5, false);
  add("Subway", "sub-cookie", "Chocolate Chip Cookie", "1 cookie", veg, ["wheat", "milk", "egg"], 210, 2, 30, 10, 1, false);

  // Burger King India.
  add("Burger King", "bk-veg-whopper", "Veg Whopper", "1 burger", veg, ["wheat", "soy", "milk"], 620, 17, 72, 30, 7, false);
  add("Burger King", "bk-chicken-whopper", "Chicken Whopper", "1 burger", nonveg, ["wheat", "soy", "egg"], 660, 30, 58, 34, 4, false);
  add("Burger King", "bk-crispy-veg", "Crispy Veg Burger", "1 burger", veg, ["wheat", "soy"], 360, 8, 46, 16, 4, false);
  add("Burger King", "bk-crispy-chicken", "Crispy Chicken Burger", "1 burger", nonveg, ["wheat", "soy", "egg"], 420, 19, 43, 20, 3, false);
  add("Burger King", "bk-paneer-royale", "Paneer Royale Burger", "1 burger", veg, ["wheat", "milk", "soy"], 690, 23, 64, 37, 5, false);
  add("Burger King", "bk-chicken-wings-4", "Chicken Wings", "4 pieces", nonveg, ["wheat"], 370, 27, 17, 22, 1, false);
  add("Burger King", "bk-fries-medium", "Medium Fries", "1 medium", veg, [], 360, 5, 47, 17, 4, false);
  add("Burger King", "bk-chocolate-shake", "Chocolate Thick Shake", "1 regular", veg, ["milk"], 440, 9, 65, 16, 2, false);

  // Taco Bell India.
  add("Taco Bell", "tb-crunchy-taco-veg", "Crunchy Taco Veg", "1 taco", veg, ["milk"], 190, 6, 22, 9, 4, false);
  add("Taco Bell", "tb-crunchy-taco-chicken", "Crunchy Taco Chicken", "1 taco", nonveg, ["milk"], 210, 11, 20, 10, 2, false);
  add("Taco Bell", "tb-cheesy-double-decker-veg", "Cheesy Double Decker Taco Veg", "1 taco", veg, ["wheat", "milk"], 390, 13, 48, 17, 6, false);
  add("Taco Bell", "tb-chalupa-veg", "Chalupa Veg", "1 chalupa", veg, ["wheat", "milk"], 420, 12, 45, 22, 6, false);
  add("Taco Bell", "tb-chalupa-chicken", "Chalupa Chicken", "1 chalupa", nonveg, ["wheat", "milk"], 450, 20, 42, 23, 3, false);
  add("Taco Bell", "tb-burrito-veg", "7 Layer Burrito Veg", "1 burrito", veg, ["wheat", "milk"], 580, 17, 78, 22, 10, false);
  add("Taco Bell", "tb-burrito-chicken", "Chicken Burrito", "1 burrito", nonveg, ["wheat", "milk"], 610, 29, 72, 24, 6, false);
  add("Taco Bell", "tb-nachos-cheese", "Nachos with Cheese", "1 portion", veg, ["milk"], 360, 8, 43, 18, 4, false);

  // Tata Starbucks India — standard recipe; milk/customisations change totals.
  add("Starbucks", "sb-caffe-latte-tall", "Caffè Latte Tall", "1 tall, standard milk", veg, ["milk"], 150, 8, 14, 7, 0, true);
  add("Starbucks", "sb-cappuccino-tall", "Cappuccino Tall", "1 tall, standard milk", veg, ["milk"], 120, 7, 12, 5, 0, true);
  add("Starbucks", "sb-caffe-mocha-tall", "Caffè Mocha Tall", "1 tall, standard recipe", veg, ["milk"], 290, 9, 39, 11, 2, true);
  add("Starbucks", "sb-caramel-macchiato-tall", "Caramel Macchiato Tall", "1 tall, standard recipe", veg, ["milk"], 250, 8, 35, 9, 0, true);
  add("Starbucks", "sb-cold-coffee-tall", "Cold Coffee Tall", "1 tall", veg, ["milk"], 210, 6, 34, 6, 0, false);
  add("Starbucks", "sb-java-chip-frappuccino-tall", "Java Chip Frappuccino Tall", "1 tall, standard recipe", veg, ["milk", "soy"], 350, 6, 52, 13, 2, true);
  add("Starbucks", "sb-chocolate-muffin", "Chocolate Muffin Eggless", "1 muffin / 125 g", veg, ["wheat", "milk"], 496, 8, 64, 23, 3, true);
  add("Starbucks", "sb-paneer-sandwich", "Chilli Paneer Sandwich", "1 sandwich", veg, ["wheat", "milk"], 430, 18, 51, 17, 5, false);

  // Popular Bengaluru restaurants — serving estimates because full macros are not published.
  [
    ["Meghana Foods", "meghana-chicken-biryani", "Chicken Biryani", "1 restaurant portion", nonveg, ["milk"], 980, 44, 122, 34, 5],
    ["Meghana Foods", "meghana-paneer-biryani", "Paneer Biryani", "1 restaurant portion", veg, ["milk"], 930, 31, 120, 36, 6],
    ["Meghana Foods", "meghana-chicken-65", "Chicken 65", "1 portion", nonveg, [], 620, 45, 28, 36, 2],
    ["Empire Restaurant", "empire-chicken-kebab", "Chicken Kebab", "1 plate", nonveg, [], 560, 48, 22, 31, 2],
    ["Empire Restaurant", "empire-ghee-rice", "Ghee Rice", "1 plate", veg, ["milk"], 620, 10, 92, 24, 3],
    ["Empire Restaurant", "empire-grilled-chicken-half", "Grilled Chicken Half", "half chicken", nonveg, [], 610, 72, 9, 31, 1],
    ["Truffles", "truffles-all-american-cheeseburger", "All American Cheeseburger", "1 burger", nonveg, ["wheat", "milk", "egg"], 890, 44, 63, 51, 4],
    ["Truffles", "truffles-veg-cheeseburger", "Veg Cheeseburger", "1 burger", veg, ["wheat", "milk"], 720, 23, 78, 36, 7],
    ["Truffles", "truffles-chicken-steak", "Chicken Steak", "1 plate", nonveg, ["milk"], 740, 55, 48, 34, 6],
    ["California Burrito", "cb-burrito-bowl-veg", "Veg Burrito Bowl", "1 bowl", veg, ["milk"], 690, 22, 94, 25, 16],
    ["California Burrito", "cb-burrito-bowl-chicken", "Chicken Burrito Bowl", "1 bowl", nonveg, ["milk"], 720, 39, 86, 24, 13],
    ["California Burrito", "cb-chicken-burrito", "Chicken Burrito", "1 burrito", nonveg, ["wheat", "milk"], 790, 42, 94, 27, 12],
    ["Leon's Burgers & Wings", "leons-chicken-burger", "Classic Chicken Burger", "1 burger", nonveg, ["wheat", "egg"], 650, 32, 55, 33, 3],
    ["Leon's Burgers & Wings", "leons-chicken-wings-6", "Chicken Wings", "6 pieces", nonveg, [], 580, 42, 24, 34, 1],
    ["Leon's Burgers & Wings", "leons-loaded-fries", "Loaded Fries", "1 portion", nonveg, ["milk"], 780, 22, 82, 42, 7]
  ].forEach((item) => add.apply(null, item.concat(false)));
}());
