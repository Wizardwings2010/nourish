(function () {
  "use strict";
  window.Nourish = window.Nourish || {};
  window.Nourish.foods = window.Nourish.foods || [];

  // Home recipes, restaurant oil and serving sizes vary. These are practical
  // per-serving estimates; package labels and custom entries remain more precise.
  function add(id, name, emoji, category, servingLabel, diets, allergens, calories, protein, carbs, fat, fiber, tags, calcium, iron, potassium, vitaminC) {
    window.Nourish.foods.push({ id, name, emoji, category, servingLabel, diets, allergens, calories, protein, carbs, fat, fiber, calcium: calcium || 35, iron: iron || 1.4, potassium: potassium || 220, vitaminC: vitaminC || 3, tags: ["indian"].concat(tags || []) });
  }
  const vegan = ["vegan"], vegetarian = ["vegetarian"], omnivore = ["omnivore"];

  // Idli — separate items so accompaniments can be logged independently.
  add("plain-idli", "Plain idli", "⚪", "south indian breakfast", "1 medium", vegan, [], 58, 2, 12, 0.4, 1, ["breakfast", "idli", "south indian"]);
  add("mini-idli", "Mini idli", "⚪", "south indian breakfast", "6 pieces", vegan, [], 105, 3.5, 22, 0.7, 1.5, ["breakfast", "idli", "south indian"]);
  add("rava-idli", "Rava idli", "⚪", "south indian breakfast", "2 medium", vegetarian, ["wheat", "milk"], 240, 7, 39, 7, 3, ["breakfast", "idli", "south indian"]);
  add("ragi-idli", "Ragi idli", "🟤", "south indian breakfast", "2 medium", vegan, [], 150, 5, 29, 1.5, 4, ["breakfast", "idli", "high-fibre"]);
  add("thatte-idli", "Thatte idli", "⚪", "south indian breakfast", "1 large", vegan, [], 170, 5, 35, 1.2, 2.5, ["breakfast", "idli", "karnataka"]);
  add("kanchipuram-idli", "Kanchipuram idli", "🟡", "south indian breakfast", "2 pieces", vegetarian, ["milk"], 250, 7, 40, 8, 3, ["breakfast", "idli", "tamil"]);
  add("podi-idli", "Podi idli", "🟠", "south indian breakfast", "4 mini idli", vegan, ["sesame"], 230, 6, 32, 9, 4, ["breakfast", "idli", "spicy"]);
  add("fried-idli", "Fried idli", "🟠", "indian snacks", "6 pieces", vegan, [], 280, 6, 38, 12, 3, ["snack", "idli", "treat"]);

  // Dosa varieties.
  add("plain-dosa", "Plain dosa", "🥞", "south indian breakfast", "1 medium", vegan, [], 170, 4, 29, 5, 2, ["breakfast", "dosa", "south indian"]);
  add("masala-dosa-only", "Masala dosa", "🥞", "south indian breakfast", "1 large", vegan, [], 340, 8, 57, 10, 6, ["breakfast", "dosa", "south indian"]);
  add("paper-dosa", "Paper dosa", "🥞", "south indian breakfast", "1 large", vegan, [], 260, 6, 45, 7, 3, ["breakfast", "dosa", "crispy"]);
  add("ghee-roast-dosa", "Ghee roast dosa", "🥞", "south indian breakfast", "1 large", vegetarian, ["milk"], 360, 7, 47, 16, 3, ["breakfast", "dosa", "treat"]);
  add("set-dosa", "Set dosa", "🥞", "south indian breakfast", "3 small", vegan, [], 330, 8, 60, 7, 4, ["breakfast", "dosa", "karnataka"]);
  add("rava-dosa", "Rava dosa", "🥞", "south indian breakfast", "1 large", vegan, ["wheat"], 240, 5, 39, 8, 2, ["breakfast", "dosa", "south indian"]);
  add("onion-rava-dosa", "Onion rava dosa", "🧅", "south indian breakfast", "1 large", vegan, ["wheat"], 285, 6, 43, 10, 3, ["breakfast", "dosa", "onion"]);
  add("mysore-masala-dosa", "Mysore masala dosa", "🥞", "south indian breakfast", "1 large", vegan, [], 390, 9, 61, 13, 7, ["breakfast", "dosa", "spicy", "karnataka"]);
  add("neer-dosa", "Neer dosa", "⚪", "south indian breakfast", "3 pieces", vegan, [], 210, 4, 45, 2, 1, ["breakfast", "dosa", "mangalorean"]);
  add("benne-dosa", "Benne dosa", "🧈", "south indian breakfast", "1 large", vegetarian, ["milk"], 390, 8, 53, 17, 4, ["breakfast", "dosa", "karnataka", "treat"]);
  add("cheese-dosa", "Cheese dosa", "🧀", "south indian breakfast", "1 large", vegetarian, ["milk"], 410, 15, 47, 18, 3, ["breakfast", "dosa", "cheese"]);
  add("paneer-dosa", "Paneer dosa", "🧀", "south indian breakfast", "1 large", vegetarian, ["milk"], 440, 19, 49, 19, 4, ["breakfast", "dosa", "paneer", "high-protein"]);
  add("egg-dosa", "Egg dosa", "🍳", "south indian breakfast", "1 large", vegetarian, ["egg"], 310, 13, 31, 14, 2, ["breakfast", "dosa", "high-protein"]);
  add("podi-dosa", "Podi dosa", "🟠", "south indian breakfast", "1 large", vegan, ["sesame"], 300, 8, 42, 11, 5, ["breakfast", "dosa", "spicy"]);
  add("kal-dosa", "Kal dosa", "🥞", "south indian breakfast", "2 thick dosa", vegan, [], 280, 7, 51, 6, 4, ["breakfast", "dosa", "tamil"]);
  add("adai-dosa", "Adai dosa", "🥞", "south indian breakfast", "2 medium", vegan, [], 320, 15, 47, 8, 10, ["breakfast", "dosa", "lentils", "high-protein", "high-fibre"]);
  add("pesarattu", "Pesarattu", "🟢", "south indian breakfast", "2 medium", vegan, [], 280, 14, 44, 6, 9, ["breakfast", "dosa", "moong", "andhra", "high-protein"]);

  // More Indian breakfasts.
  add("kanda-poha", "Kanda poha", "🍚", "indian breakfast", "1.5 cups", vegan, ["peanuts"], 310, 7, 52, 9, 5, ["breakfast", "poha", "maharashtrian"]);
  add("indori-poha", "Indori poha", "🍚", "indian breakfast", "1.5 cups", vegan, ["peanuts"], 340, 8, 56, 10, 5, ["breakfast", "poha", "indori"]);
  add("sabudana-khichdi", "Sabudana khichdi", "🍚", "indian breakfast", "1.5 cups", vegan, ["peanuts"], 430, 7, 72, 14, 4, ["breakfast", "fasting", "maharashtrian"]);
  add("rava-upma", "Rava upma", "🥣", "south indian breakfast", "1.5 cups", vegan, ["wheat"], 315, 8, 54, 8, 6, ["breakfast", "upma"]);
  add("aval-upma", "Aval upma", "🥣", "south indian breakfast", "1.5 cups", vegan, ["peanuts"], 300, 7, 53, 8, 5, ["breakfast", "poha"]);
  add("idiyappam", "Idiyappam", "🍜", "south indian breakfast", "3 nests", vegan, [], 240, 4, 53, 1, 2, ["breakfast", "kerala", "tamil"]);
  add("appam-plain", "Plain appam", "🥞", "south indian breakfast", "2 medium", vegan, ["coconut"], 190, 4, 38, 3, 2, ["breakfast", "kerala"]);
  add("puttu", "Puttu", "🍚", "south indian breakfast", "1 cylinder", vegan, ["coconut"], 280, 6, 55, 5, 5, ["breakfast", "kerala", "high-fibre"]);
  add("puttu-kadala", "Puttu with kadala curry", "🍛", "south indian breakfast", "1 puttu + 1 cup curry", vegan, ["coconut"], 510, 17, 82, 13, 15, ["breakfast", "kerala", "high-protein", "high-fibre"]);
  add("akki-roti", "Akki roti", "🫓", "south indian breakfast", "2 medium", vegan, [], 300, 6, 55, 8, 5, ["breakfast", "karnataka"]);
  add("thalipeeth", "Thalipeeth", "🫓", "indian breakfast", "2 medium", vegetarian, ["wheat"], 360, 11, 55, 12, 9, ["breakfast", "maharashtrian", "high-fibre"]);
  add("methi-thepla", "Methi thepla", "🫓", "indian breakfast", "2 medium", vegetarian, ["wheat", "milk"], 280, 8, 42, 9, 6, ["breakfast", "gujarati"]);
  add("besan-chilla", "Besan chilla", "🥞", "indian breakfast", "2 medium", vegan, [], 270, 13, 35, 8, 8, ["breakfast", "chilla", "high-protein", "high-fibre"]);
  add("moong-dal-chilla", "Moong dal chilla", "🥞", "indian breakfast", "2 medium", vegan, [], 250, 15, 34, 6, 8, ["breakfast", "chilla", "high-protein"]);
  add("khaman-dhokla", "Khaman dhokla", "🟨", "indian breakfast", "6 pieces", vegan, [], 260, 11, 43, 6, 7, ["breakfast", "snack", "gujarati"]);
  add("handvo", "Vegetable handvo", "🍰", "indian breakfast", "2 slices", vegetarian, ["sesame"], 330, 13, 48, 10, 9, ["breakfast", "gujarati", "high-fibre"]);
  add("paneer-paratha", "Paneer paratha", "🫓", "indian breakfast", "1 medium", vegetarian, ["wheat", "milk"], 340, 15, 41, 13, 5, ["breakfast", "paratha", "high-protein"]);
  add("gobi-paratha", "Gobi paratha", "🫓", "indian breakfast", "1 medium", vegetarian, ["wheat"], 270, 8, 42, 9, 7, ["breakfast", "paratha", "high-fibre"]);
  add("methi-paratha", "Methi paratha", "🫓", "indian breakfast", "1 medium", vegetarian, ["wheat"], 240, 7, 36, 8, 6, ["breakfast", "paratha"]);

  // Chutneys and accompaniments.
  add("coconut-chutney", "Coconut chutney", "🥥", "chutneys", "2 tbsp", vegan, ["coconut"], 85, 2, 4, 7, 2, ["chutney", "south indian"]);
  add("tomato-chutney", "Tomato chutney", "🍅", "chutneys", "2 tbsp", vegan, [], 45, 1, 7, 2, 1.5, ["chutney", "south indian"], 20, 0.5, 150, 10);
  add("mint-chutney", "Mint chutney", "🌿", "chutneys", "2 tbsp", vegan, [], 30, 1, 5, 1, 1.5, ["chutney", "green chutney"], 35, 1, 110, 8);
  add("coriander-chutney", "Coriander chutney", "🌿", "chutneys", "2 tbsp", vegan, [], 28, 1, 5, 0.5, 1.5, ["chutney", "green chutney"]);
  add("peanut-chutney", "Peanut chutney", "🥜", "chutneys", "2 tbsp", vegan, ["peanuts"], 110, 4, 5, 9, 2, ["chutney", "south indian"]);
  add("onion-chutney", "Onion chutney", "🧅", "chutneys", "2 tbsp", vegan, [], 55, 1, 8, 2.5, 1.5, ["chutney", "south indian"]);
  add("garlic-chutney", "Dry garlic chutney", "🧄", "chutneys", "1 tbsp", vegan, ["peanuts"], 65, 2, 5, 4.5, 1.5, ["chutney", "maharashtrian", "spicy"]);
  add("ginger-chutney", "Ginger chutney", "🫚", "chutneys", "2 tbsp", vegan, [], 42, 1, 8, 1, 1, ["chutney", "andhra", "spicy"]);
  add("sesame-chutney", "Sesame chutney", "🌰", "chutneys", "2 tbsp", vegan, ["sesame"], 95, 3, 5, 7, 2, ["chutney"]);
  add("mango-chutney", "Mango chutney", "🥭", "chutneys", "2 tbsp", vegan, [], 60, 0.3, 15, 0.2, 1, ["chutney", "sweet"]);

  // Kurma and korma varieties.
  add("south-indian-veg-kurma", "South Indian vegetable kurma", "🍛", "indian curries", "1 cup", vegetarian, ["coconut", "tree nuts"], 290, 7, 29, 17, 7, ["kurma", "south indian"]);
  add("navratan-korma", "Navratan korma", "🍛", "indian curries", "1 cup", vegetarian, ["milk", "tree nuts"], 390, 10, 34, 25, 6, ["korma", "north indian"]);
  add("paneer-korma", "Paneer korma", "🧀", "indian curries", "1 cup", vegetarian, ["milk", "tree nuts"], 440, 19, 20, 32, 4, ["korma", "paneer", "high-protein"]);
  add("potato-kurma", "Potato kurma", "🥔", "indian curries", "1 cup", vegan, ["coconut"], 275, 5, 38, 12, 6, ["kurma", "south indian"]);
  add("white-veg-kurma", "White vegetable kurma", "🥥", "indian curries", "1 cup", vegetarian, ["coconut", "tree nuts", "milk"], 320, 8, 27, 21, 7, ["kurma", "south indian"]);
  add("chicken-korma", "Chicken korma", "🍗", "indian curries", "1 cup", omnivore, ["milk", "tree nuts"], 420, 32, 14, 27, 3, ["korma", "high-protein"]);
  add("mutton-korma", "Mutton korma", "🍖", "indian curries", "1 cup", omnivore, ["milk", "tree nuts"], 480, 31, 13, 34, 3, ["korma", "high-protein"]);

  // Indian sweets.
  add("gulab-jamun", "Gulab jamun", "🟤", "indian sweets", "2 pieces", vegetarian, ["milk", "wheat"], 300, 5, 48, 10, 1, ["sweet", "dessert", "treat"]);
  add("kala-jamun", "Kala jamun", "🟤", "indian sweets", "2 pieces", vegetarian, ["milk", "wheat"], 330, 5, 51, 12, 1, ["sweet", "dessert", "treat"]);
  add("rasgulla", "Rasgulla", "⚪", "indian sweets", "2 pieces", vegetarian, ["milk"], 220, 7, 42, 3, 0, ["sweet", "dessert", "bengali"]);
  add("rasmalai", "Rasmalai", "🥛", "indian sweets", "2 pieces", vegetarian, ["milk", "tree nuts"], 360, 12, 45, 15, 1, ["sweet", "dessert", "bengali"]);
  add("jalebi", "Jalebi", "🟠", "indian sweets", "2 medium", vegetarian, ["wheat"], 300, 3, 58, 7, 0.5, ["sweet", "dessert", "treat"]);
  add("imarti", "Imarti", "🟠", "indian sweets", "2 medium", vegan, [], 320, 6, 56, 9, 2, ["sweet", "dessert", "treat"]);
  add("kaju-katli", "Kaju katli", "🔶", "indian sweets", "3 pieces", vegetarian, ["tree nuts", "milk"], 250, 6, 31, 12, 1, ["sweet", "dessert", "cashew"]);
  add("mysore-pak", "Mysore pak", "🟨", "indian sweets", "2 pieces", vegetarian, ["milk"], 340, 5, 42, 18, 2, ["sweet", "dessert", "karnataka"]);
  add("milk-peda", "Milk peda", "⚪", "indian sweets", "2 pieces", vegetarian, ["milk"], 220, 7, 32, 8, 0, ["sweet", "dessert"]);
  add("motichoor-ladoo", "Motichoor ladoo", "🟠", "indian sweets", "1 medium", vegetarian, ["tree nuts"], 210, 4, 31, 8, 1.5, ["sweet", "dessert", "ladoo"]);
  add("besan-ladoo", "Besan ladoo", "🟡", "indian sweets", "1 medium", vegetarian, ["milk", "tree nuts"], 220, 5, 26, 11, 2, ["sweet", "dessert", "ladoo"]);
  add("boondi-ladoo", "Boondi ladoo", "🟠", "indian sweets", "1 medium", vegetarian, ["tree nuts"], 230, 4, 34, 9, 1, ["sweet", "dessert", "ladoo"]);
  add("rava-ladoo", "Rava ladoo", "⚪", "indian sweets", "1 medium", vegetarian, ["wheat", "milk", "tree nuts"], 205, 4, 29, 9, 1, ["sweet", "dessert", "ladoo"]);
  add("coconut-ladoo", "Coconut ladoo", "🥥", "indian sweets", "1 medium", vegetarian, ["coconut", "milk"], 190, 3, 23, 10, 2, ["sweet", "dessert", "ladoo"]);
  add("gajar-halwa", "Gajar ka halwa", "🥕", "indian sweets", "1 small bowl", vegetarian, ["milk", "tree nuts"], 330, 7, 43, 15, 4, ["sweet", "dessert", "halwa"]);
  add("sooji-halwa", "Sooji halwa", "🥣", "indian sweets", "1 small bowl", vegetarian, ["wheat", "milk", "tree nuts"], 310, 5, 46, 13, 2, ["sweet", "dessert", "halwa"]);
  add("moong-dal-halwa", "Moong dal halwa", "🥣", "indian sweets", "1 small bowl", vegetarian, ["milk", "tree nuts"], 390, 9, 46, 20, 4, ["sweet", "dessert", "halwa"]);
  add("rice-kheer", "Rice kheer", "🥛", "indian sweets", "1 cup", vegetarian, ["milk", "tree nuts"], 300, 8, 48, 9, 1, ["sweet", "dessert", "kheer"]);
  add("semiya-payasam", "Semiya payasam", "🥛", "indian sweets", "1 cup", vegetarian, ["milk", "wheat", "tree nuts"], 310, 8, 50, 9, 1, ["sweet", "dessert", "payasam"]);
  add("palada-payasam", "Palada payasam", "🥛", "indian sweets", "1 cup", vegetarian, ["milk"], 330, 8, 57, 8, 1, ["sweet", "dessert", "kerala"]);
  add("sandesh", "Sandesh", "⚪", "indian sweets", "2 pieces", vegetarian, ["milk"], 180, 9, 26, 5, 0, ["sweet", "dessert", "bengali"]);
  add("modak", "Steamed modak", "🥟", "indian sweets", "2 pieces", vegan, ["coconut"], 220, 4, 43, 5, 3, ["sweet", "dessert", "maharashtrian"]);
  add("shrikhand", "Shrikhand", "🥣", "indian sweets", "1 cup", vegetarian, ["milk", "tree nuts"], 360, 12, 55, 11, 0, ["sweet", "dessert", "gujarati"]);
  add("malai-kulfi", "Malai kulfi", "🍦", "indian sweets", "1 stick", vegetarian, ["milk", "tree nuts"], 210, 6, 28, 9, 0, ["sweet", "dessert", "frozen"]);
  add("pista-kulfi", "Pista kulfi", "🍦", "indian sweets", "1 stick", vegetarian, ["milk", "tree nuts"], 230, 7, 29, 10, 1, ["sweet", "dessert", "pistachio"]);

  // Cake flavours and bakery desserts.
  add("vanilla-cake", "Vanilla cake", "🍰", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 320, 4, 46, 14, 1, ["cake", "dessert", "vanilla", "treat"]);
  add("chocolate-cake", "Chocolate cake", "🍫", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 390, 5, 53, 19, 2, ["cake", "dessert", "chocolate", "treat"]);
  add("red-velvet-cake", "Red velvet cake", "🍰", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 410, 5, 55, 20, 1, ["cake", "dessert", "red velvet", "treat"]);
  add("black-forest-cake", "Black Forest cake", "🍒", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 380, 5, 52, 18, 2, ["cake", "dessert", "chocolate", "cherry"]);
  add("butterscotch-cake", "Butterscotch cake", "🍰", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg", "tree nuts"], 400, 5, 55, 19, 1, ["cake", "dessert", "butterscotch"]);
  add("pineapple-cake", "Pineapple cake", "🍍", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 350, 4, 52, 14, 1.5, ["cake", "dessert", "pineapple"]);
  add("strawberry-cake", "Strawberry cake", "🍓", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 360, 4, 51, 16, 1.5, ["cake", "dessert", "strawberry"]);
  add("mango-cake", "Mango cake", "🥭", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 365, 4, 54, 15, 1.5, ["cake", "dessert", "mango"]);
  add("coffee-cake", "Coffee cake", "☕", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 370, 5, 50, 17, 1, ["cake", "dessert", "coffee"]);
  add("carrot-cake", "Carrot cake", "🥕", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg", "tree nuts"], 410, 5, 51, 21, 3, ["cake", "dessert", "carrot"]);
  add("lemon-cake", "Lemon cake", "🍋", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 340, 4, 49, 15, 1, ["cake", "dessert", "lemon"]);
  add("coconut-cake", "Coconut cake", "🥥", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg", "coconut"], 420, 5, 49, 23, 3, ["cake", "dessert", "coconut"]);
  add("rasmalai-cake", "Rasmalai cake", "🍰", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg", "tree nuts"], 440, 8, 58, 20, 1, ["cake", "dessert", "indian fusion"]);
  add("gulab-jamun-cake", "Gulab jamun cake", "🍰", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 460, 7, 65, 20, 1, ["cake", "dessert", "indian fusion"]);
  add("fruit-cake", "Fresh fruit cake", "🍓", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg"], 355, 5, 54, 14, 2, ["cake", "dessert", "fruit"]);
  add("plum-cake", "Indian plum cake", "🍰", "cakes", "1 slice", vegetarian, ["wheat", "milk", "egg", "tree nuts"], 390, 6, 57, 17, 3, ["cake", "dessert", "fruit", "christmas"]);
  const seenIds = new Set();
  window.Nourish.foods = window.Nourish.foods.filter((item) => !seenIds.has(item.id) && seenIds.add(item.id));
}());
