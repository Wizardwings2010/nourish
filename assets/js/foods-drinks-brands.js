(function () {
  "use strict";
  window.Nourish = window.Nourish || {};
  window.Nourish.foods = window.Nourish.foods || [];

  // Practical per-serving estimates. Recipes, countries and package sizes vary;
  // use the package label or barcode scanner whenever exact values matter.
  const vegan = ["vegan"], vegetarian = ["vegetarian"], omnivore = ["omnivore"];
  function add(id, name, emoji, category, servingLabel, diets, allergens, calories, protein, carbs, fat, fiber, tags, potassium, vitaminC) {
    window.Nourish.foods.push({ id, name, emoji, category, servingLabel, diets, allergens, calories, protein, carbs, fat, fiber, calcium: category.includes("dairy") ? 220 : 18, iron: 0.4, potassium: potassium || 80, vitaminC: vitaminC || 0, tags: (tags || []).concat(["expanded-library"]) });
  }

  // Fresh juices and juice blends (250 ml unless noted).
  add("orange-juice", "Fresh orange juice", "🍊", "juices", "250 ml glass", vegan, [], 112, 1.7, 26, 0.5, 0.5, ["juice", "fruit", "drink"], 496, 124);
  add("apple-juice", "Apple juice", "🍎", "juices", "250 ml glass", vegan, [], 114, 0.3, 28, 0.3, 0.5, ["juice", "fruit", "drink"], 250, 2);
  add("mango-juice", "Mango juice", "🥭", "juices", "250 ml glass", vegan, [], 150, 1, 37, 0.4, 1, ["juice", "fruit", "drink", "indian"], 320, 45);
  add("pineapple-juice", "Pineapple juice", "🍍", "juices", "250 ml glass", vegan, [], 132, 0.9, 32, 0.3, 0.5, ["juice", "fruit", "drink"], 325, 25);
  add("grape-juice", "Grape juice", "🍇", "juices", "250 ml glass", vegan, [], 152, 0.9, 37, 0.3, 0.3, ["juice", "fruit", "drink"], 263, 1);
  add("watermelon-juice", "Watermelon juice", "🍉", "juices", "300 ml glass", vegan, [], 90, 1.8, 22, 0.5, 1, ["juice", "fruit", "drink"], 340, 24);
  add("pomegranate-juice", "Pomegranate juice", "🔴", "juices", "250 ml glass", vegan, [], 134, 0.4, 33, 0.7, 0.3, ["juice", "fruit", "drink"], 530, 1);
  add("guava-juice", "Guava juice", "🟢", "juices", "250 ml glass", vegan, [], 145, 1.5, 34, 0.5, 2, ["juice", "fruit", "drink", "indian"], 370, 95);
  add("mosambi-juice", "Mosambi sweet lime juice", "🍈", "juices", "250 ml glass", vegan, [], 108, 1, 26, 0.3, 0.8, ["juice", "fruit", "drink", "indian"], 280, 55);
  add("lemon-juice-drink", "Fresh lemon juice drink", "🍋", "juices", "250 ml glass, lightly sweetened", vegan, [], 90, 0.3, 23, 0.1, 0.3, ["juice", "fruit", "drink", "indian"], 60, 25);
  add("lime-mint-juice", "Lime mint cooler", "🍋", "juices", "300 ml glass", vegan, [], 105, 0.5, 27, 0.2, 0.5, ["juice", "mint", "drink", "indian"], 90, 28);
  add("strawberry-juice", "Strawberry juice", "🍓", "juices", "250 ml glass", vegan, [], 115, 1, 27, 0.5, 2, ["juice", "berry", "drink"], 300, 70);
  add("blueberry-juice", "Blueberry juice", "🫐", "juices", "250 ml glass", vegan, [], 125, 0.7, 30, 0.5, 1, ["juice", "berry", "drink"], 180, 10);
  add("cranberry-juice", "Cranberry juice drink", "🔴", "juices", "250 ml glass", vegan, [], 116, 0, 30, 0, 0.3, ["juice", "berry", "drink"], 45, 24);
  add("mixed-berry-juice", "Mixed berry juice", "🫐", "juices", "250 ml glass", vegan, [], 128, 1, 31, 0.4, 1.5, ["juice", "berry", "drink"], 260, 35);
  add("peach-juice", "Peach juice", "🍑", "juices", "250 ml glass", vegan, [], 120, 0.7, 29, 0.2, 0.8, ["juice", "fruit", "drink"], 210, 15);
  add("pear-juice", "Pear juice", "🍐", "juices", "250 ml glass", vegan, [], 130, 0.3, 32, 0.2, 0.8, ["juice", "fruit", "drink"], 190, 8);
  add("kiwi-juice", "Kiwi juice", "🥝", "juices", "250 ml glass", vegan, [], 125, 1.5, 29, 0.7, 2.5, ["juice", "fruit", "drink"], 430, 115);
  add("papaya-juice", "Papaya juice", "🧡", "juices", "250 ml glass", vegan, [], 120, 1, 29, 0.4, 2, ["juice", "fruit", "drink", "indian"], 450, 90);
  add("lychee-juice", "Lychee juice", "⚪", "juices", "250 ml glass", vegan, [], 145, 0.8, 35, 0.4, 1, ["juice", "fruit", "drink"], 360, 75);
  add("passion-fruit-juice", "Passion fruit juice", "🟣", "juices", "250 ml glass", vegan, [], 126, 1, 30, 0.3, 1, ["juice", "fruit", "drink"], 450, 70);
  add("tomato-juice", "Tomato juice", "🍅", "vegetable juices", "250 ml glass", vegan, [], 42, 2, 10, 0.3, 1.5, ["juice", "vegetable", "drink"], 550, 45);
  add("carrot-juice", "Carrot juice", "🥕", "vegetable juices", "250 ml glass", vegan, [], 96, 2.2, 22, 0.4, 2, ["juice", "vegetable", "drink"], 690, 20);
  add("beetroot-juice", "Beetroot juice", "🟣", "vegetable juices", "250 ml glass", vegan, [], 100, 3, 23, 0.4, 2, ["juice", "vegetable", "drink"], 520, 12);
  add("amla-juice", "Amla juice", "🟢", "vegetable juices", "100 ml diluted serving", vegan, [], 30, 0.5, 7, 0.1, 1, ["juice", "amla", "drink", "indian"], 120, 180);
  add("aloe-vera-juice", "Aloe vera juice", "🌿", "vegetable juices", "250 ml glass", vegan, [], 45, 0, 11, 0, 0.5, ["juice", "aloe", "drink"], 80, 5);
  add("green-juice", "Green vegetable juice", "🥬", "vegetable juices", "300 ml glass", vegan, [], 95, 3, 19, 0.8, 3, ["juice", "vegetable", "drink", "high-fibre"], 620, 60);
  add("carrot-orange-juice", "Carrot orange juice", "🧡", "juice blends", "300 ml glass", vegan, [], 135, 2.5, 32, 0.6, 2, ["juice", "blend", "drink"], 650, 85);
  add("beet-carrot-apple-juice", "ABC juice (apple beet carrot)", "🍎", "juice blends", "300 ml glass", vegan, [], 155, 2.5, 37, 0.5, 3, ["juice", "blend", "drink", "indian"], 690, 35);
  add("orange-pineapple-juice", "Orange pineapple juice", "🍍", "juice blends", "300 ml glass", vegan, [], 148, 1.7, 36, 0.4, 1, ["juice", "blend", "drink"], 540, 90);
  add("mango-orange-juice", "Mango orange juice", "🥭", "juice blends", "300 ml glass", vegan, [], 175, 1.8, 42, 0.6, 1.5, ["juice", "blend", "drink"], 520, 80);
  add("cucumber-mint-juice", "Cucumber mint juice", "🥒", "vegetable juices", "300 ml glass", vegan, [], 55, 1.5, 12, 0.3, 1.5, ["juice", "vegetable", "drink"], 330, 15);

  // Indian, café, dairy and functional beverages.
  add("mango-lassi", "Mango lassi", "🥭", "dairy drinks", "300 ml glass", vegetarian, ["milk"], 280, 9, 48, 7, 1, ["lassi", "drink", "indian"], 420, 20);
  add("rose-lassi", "Rose lassi", "🌹", "dairy drinks", "300 ml glass", vegetarian, ["milk"], 260, 9, 44, 6, 0, ["lassi", "drink", "indian"], 360, 2);
  add("badam-milk", "Badam milk", "🥛", "dairy drinks", "250 ml glass", vegetarian, ["milk", "tree nuts"], 230, 9, 28, 10, 2, ["almond", "drink", "indian"], 390, 2);
  add("turmeric-milk", "Turmeric milk", "🥛", "dairy drinks", "250 ml cup", vegetarian, ["milk"], 170, 8, 20, 7, 0, ["haldi", "drink", "indian"], 350, 1);
  add("rose-milk", "Rose milk", "🌹", "dairy drinks", "250 ml glass", vegetarian, ["milk"], 210, 8, 34, 6, 0, ["rose", "drink", "indian"], 330, 2);
  add("thandai", "Thandai", "🥛", "dairy drinks", "250 ml glass", vegetarian, ["milk", "tree nuts"], 290, 10, 35, 13, 2, ["drink", "indian", "festival"], 420, 3);
  add("jaljeera", "Jaljeera", "🌿", "indian drinks", "250 ml glass", vegan, [], 45, 0.5, 10, 0.2, 0.5, ["drink", "indian", "spiced"], 110, 8);
  add("aam-panna", "Aam panna", "🥭", "indian drinks", "250 ml glass", vegan, [], 120, 0.5, 30, 0.2, 1, ["drink", "indian", "mango"], 170, 18);
  add("kokum-sharbat", "Kokum sharbat", "🟣", "indian drinks", "250 ml glass", vegan, [], 115, 0.3, 29, 0.1, 0.5, ["drink", "indian", "kokum"], 90, 6);
  add("nimbu-soda", "Nimbu soda", "🍋", "indian drinks", "300 ml glass", vegan, [], 100, 0.2, 25, 0, 0.2, ["drink", "indian", "soda"], 45, 18);
  add("black-tea", "Black tea", "☕", "tea", "250 ml, unsweetened", vegan, [], 2, 0, 0.5, 0, 0, ["tea", "drink", "caffeine"], 90, 0);
  add("green-tea", "Green tea", "🍵", "tea", "250 ml, unsweetened", vegan, [], 2, 0, 0.5, 0, 0, ["tea", "drink", "caffeine"], 20, 0);
  add("lemon-tea", "Lemon tea", "🍋", "tea", "250 ml, lightly sweetened", vegan, [], 65, 0.2, 17, 0, 0.2, ["tea", "drink"], 45, 14);
  add("iced-tea", "Iced tea", "🧊", "tea", "330 ml bottle", vegan, [], 95, 0, 24, 0, 0, ["tea", "drink", "sweet"], 30, 3);
  add("espresso", "Espresso", "☕", "coffee", "30 ml shot", vegan, [], 3, 0.2, 0.5, 0, 0, ["coffee", "drink", "caffeine"], 35, 0);
  add("americano", "Americano coffee", "☕", "coffee", "300 ml", vegan, [], 10, 0.5, 1.5, 0.1, 0, ["coffee", "drink", "caffeine"], 120, 0);
  add("cappuccino", "Cappuccino", "☕", "coffee", "250 ml", vegetarian, ["milk"], 120, 6, 12, 5, 0, ["coffee", "drink", "caffeine"], 300, 0);
  add("cafe-latte", "Café latte", "☕", "coffee", "350 ml", vegetarian, ["milk"], 190, 10, 18, 8, 0, ["coffee", "drink", "caffeine"], 430, 0);
  add("mocha-coffee", "Café mocha", "🍫", "coffee", "350 ml", vegetarian, ["milk"], 310, 10, 45, 10, 2, ["coffee", "drink", "chocolate"], 500, 0);
  add("cold-coffee", "Cold coffee", "🧊", "coffee", "350 ml", vegetarian, ["milk"], 280, 9, 43, 8, 1, ["coffee", "drink", "indian"], 450, 1);
  add("plain-milk", "Plain toned milk", "🥛", "dairy drinks", "250 ml glass", vegetarian, ["milk"], 150, 8, 12, 7, 0, ["milk", "drink", "high-protein"], 380, 0);
  add("soy-milk", "Soy milk", "🥛", "plant drinks", "250 ml glass", vegan, ["soy"], 100, 7, 10, 4, 1, ["soy", "drink", "high-protein"], 300, 0);
  add("almond-milk", "Almond milk", "🥛", "plant drinks", "250 ml glass, unsweetened", vegan, ["tree nuts"], 40, 1.5, 2, 3, 1, ["almond", "drink"], 170, 0);
  add("oat-milk", "Oat milk", "🥛", "plant drinks", "250 ml glass", vegan, ["oats"], 120, 3, 16, 5, 2, ["oat", "drink"], 350, 0);
  add("protein-shake", "Whey protein shake", "🥤", "protein drinks", "1 scoop with water", omnivore, ["milk"], 125, 24, 4, 2, 1, ["protein", "drink", "high-protein"], 180, 0);
  add("electrolyte-drink", "Electrolyte sports drink", "⚡", "sports drinks", "500 ml bottle", vegan, [], 120, 0, 30, 0, 0, ["sports drink", "drink"], 60, 0);

  // Branded drinks commonly found in India and internationally.
  add("coke-zero", "Coca-Cola Zero Sugar", "🥤", "branded drinks", "330 ml can", vegan, [], 1, 0, 0, 0, 0, ["coca cola", "coke", "soda", "packaged"], 5, 0);
  add("diet-coke", "Diet Coke", "🥤", "branded drinks", "330 ml can", vegan, [], 1, 0, 0, 0, 0, ["coca cola", "coke", "soda", "packaged"], 5, 0);
  add("sprite", "Sprite", "🥤", "branded drinks", "330 ml can", vegan, [], 135, 0, 34, 0, 0, ["sprite", "soda", "packaged"], 5, 0);
  add("fanta-orange", "Fanta Orange", "🍊", "branded drinks", "330 ml can", vegan, [], 145, 0, 36, 0, 0, ["fanta", "soda", "packaged"], 5, 0);
  add("mountain-dew", "Mountain Dew", "🥤", "branded drinks", "330 ml can", vegan, [], 150, 0, 38, 0, 0, ["mountain dew", "soda", "caffeine", "packaged"], 5, 0);
  add("seven-up", "7UP", "🥤", "branded drinks", "330 ml can", vegan, [], 140, 0, 35, 0, 0, ["7up", "soda", "packaged"], 5, 0);
  add("limca", "Limca", "🍋", "branded drinks", "300 ml bottle", vegan, [], 126, 0, 32, 0, 0, ["limca", "soda", "indian", "packaged"], 5, 0);
  add("thums-up", "Thums Up", "🥤", "branded drinks", "300 ml bottle", vegan, [], 126, 0, 32, 0, 0, ["thums up", "cola", "indian", "packaged"], 5, 0);
  add("maaza-mango", "Maaza Mango", "🥭", "branded juices", "250 ml serving", vegan, [], 150, 0, 37, 0, 0.5, ["maaza", "mango", "juice", "packaged"], 60, 8);
  add("slice-mango", "Slice Mango Drink", "🥭", "branded juices", "250 ml serving", vegan, [], 155, 0, 39, 0, 0.5, ["slice", "mango", "juice", "packaged"], 55, 5);
  add("frooti", "Frooti Mango Drink", "🥭", "branded juices", "250 ml pack", vegan, [], 160, 0, 40, 0, 0.5, ["frooti", "mango", "juice", "packaged"], 55, 5);
  add("real-orange-juice", "Real Orange Juice", "🍊", "branded juices", "250 ml serving", vegan, [], 120, 1, 29, 0, 0.5, ["real", "dabur", "orange", "juice", "packaged"], 310, 50);
  add("real-mixed-fruit", "Real Mixed Fruit Juice", "🍹", "branded juices", "250 ml serving", vegan, [], 135, 0.5, 33, 0, 0.5, ["real", "dabur", "mixed fruit", "juice", "packaged"], 190, 15);
  add("tropicana-orange", "Tropicana Orange Juice", "🍊", "branded juices", "250 ml serving", vegan, [], 115, 1.5, 27, 0, 0.5, ["tropicana", "orange", "juice", "packaged"], 400, 75);
  add("minute-maid-pulpy-orange", "Minute Maid Pulpy Orange", "🍊", "branded juices", "250 ml serving", vegan, [], 130, 0.5, 32, 0, 1, ["minute maid", "orange", "juice", "packaged"], 180, 35);
  add("paper-boat-aam-panna", "Paper Boat Aam Panna", "🥭", "branded drinks", "250 ml pack", vegan, [], 120, 0, 30, 0, 0.5, ["paper boat", "aam panna", "indian", "packaged"], 120, 10);
  add("paper-boat-jaljeera", "Paper Boat Jaljeera", "🌿", "branded drinks", "250 ml pack", vegan, [], 75, 0, 19, 0, 0, ["paper boat", "jaljeera", "indian", "packaged"], 80, 5);
  add("bisleri-limonata", "Bisleri Limonata", "🍋", "branded drinks", "250 ml serving", vegan, [], 110, 0, 28, 0, 0, ["bisleri", "lemon", "drink", "packaged"], 20, 5);
  add("sting-energy", "Sting Energy Drink", "⚡", "branded drinks", "250 ml bottle", vegan, [], 145, 0, 36, 0, 0, ["sting", "energy drink", "caffeine", "packaged"], 10, 0);
  add("monster-energy", "Monster Energy", "⚡", "branded drinks", "500 ml can", vegan, [], 230, 0, 57, 0, 0, ["monster", "energy drink", "caffeine", "packaged"], 20, 0);
  add("gatorade-orange", "Gatorade Orange", "⚡", "branded drinks", "500 ml bottle", vegan, [], 120, 0, 30, 0, 0, ["gatorade", "sports drink", "packaged"], 60, 0);
  add("amul-kool", "Amul Kool Flavoured Milk", "🥛", "branded dairy drinks", "200 ml bottle", vegetarian, ["milk"], 180, 7, 27, 5, 0, ["amul", "milk", "packaged"], 300, 0);
  add("amul-lassi", "Amul Lassi", "🥛", "branded dairy drinks", "200 ml pack", vegetarian, ["milk"], 150, 6, 25, 3, 0, ["amul", "lassi", "packaged"], 250, 1);
  add("yakult", "Yakult Probiotic Drink", "🥛", "branded dairy drinks", "65 ml bottle", vegetarian, ["milk"], 50, 0.8, 12, 0, 0, ["yakult", "probiotic", "packaged"], 30, 0);
  add("nescafe-cold-coffee", "Nescafé Ready-to-Drink Coffee", "☕", "branded coffee", "180 ml can", vegetarian, ["milk"], 135, 4, 22, 3.5, 0, ["nescafe", "coffee", "caffeine", "packaged"], 220, 0);

  // More branded consumable products.
  add("lays-india-magic-masala", "Lay's India’s Magic Masala", "🥔", "branded snacks", "28 g serving", vegan, [], 155, 2, 16, 9, 1, ["lays", "chips", "indian", "packaged"], 320, 4);
  add("lays-american-style-cream-onion", "Lay's American Style Cream & Onion", "🥔", "branded snacks", "28 g serving", vegetarian, ["milk"], 155, 2, 16, 9, 1, ["lays", "chips", "packaged"], 300, 3);
  add("pringles-sour-cream-onion", "Pringles Sour Cream & Onion", "🥔", "branded snacks", "28 g serving", vegetarian, ["wheat", "milk"], 150, 1.5, 16, 9, 1, ["pringles", "chips", "packaged"], 150, 2);
  add("bingo-mad-angles", "Bingo Mad Angles", "🔺", "branded snacks", "30 g serving", vegan, [], 160, 2, 19, 8.5, 1.5, ["bingo", "chips", "indian", "packaged"], 110, 0);
  add("haldirams-aloo-bhujia", "Haldiram's Aloo Bhujia", "🟡", "branded snacks", "30 g serving", vegan, [], 170, 3, 16, 10, 2, ["haldirams", "namkeen", "indian", "packaged"], 180, 0);
  add("haldirams-bhujia", "Haldiram's Bhujia", "🟡", "branded snacks", "30 g serving", vegan, [], 180, 5, 14, 12, 3, ["haldirams", "namkeen", "indian", "packaged"], 210, 0);
  add("parle-g", "Parle-G Biscuits", "🍪", "branded biscuits", "5 biscuits / 35 g", vegetarian, ["wheat", "milk"], 155, 2.5, 25, 5, 0.8, ["parle", "biscuit", "indian", "packaged"], 55, 0);
  add("britannia-good-day", "Britannia Good Day Butter Cookies", "🍪", "branded biscuits", "4 cookies / 36 g", vegetarian, ["wheat", "milk"], 185, 2.5, 24, 9, 0.7, ["britannia", "cookie", "indian", "packaged"], 65, 0);
  add("britannia-marie-gold", "Britannia Marie Gold", "🍪", "branded biscuits", "6 biscuits / 36 g", vegetarian, ["wheat", "milk"], 160, 3, 27, 4.5, 1, ["britannia", "biscuit", "indian", "packaged"], 70, 0);
  add("hide-and-seek", "Parle Hide & Seek", "🍪", "branded biscuits", "4 cookies / 33 g", vegetarian, ["wheat", "milk", "soy"], 165, 2.5, 22, 8, 1, ["parle", "cookie", "chocolate", "packaged"], 80, 0);
  add("mcvities-digestive", "McVitie's Digestive Biscuits", "🍪", "branded biscuits", "2 biscuits", vegetarian, ["wheat", "milk"], 142, 2, 19, 6.5, 1.5, ["mcvities", "digestive", "biscuit", "packaged"], 70, 0);
  add("kelloggs-corn-flakes", "Kellogg's Corn Flakes", "🥣", "branded breakfast", "30 g without milk", vegan, [], 110, 2, 25, 0.3, 1, ["kelloggs", "cereal", "breakfast", "packaged"], 35, 6);
  add("kelloggs-chocos", "Kellogg's Chocos", "🥣", "branded breakfast", "30 g without milk", vegetarian, ["wheat", "milk"], 115, 2.5, 25, 1.5, 2, ["kelloggs", "cereal", "chocolate", "packaged"], 90, 4);
  add("quaker-oats", "Quaker Oats", "🥣", "branded breakfast", "40 g dry", vegan, ["oats"], 150, 5, 27, 3, 4, ["quaker", "oats", "breakfast", "high-fibre"], 150, 0);
  add("mtr-upma-mix", "MTR Upma Mix", "🥣", "branded meals", "1 prepared serving", vegetarian, ["wheat"], 250, 6, 42, 7, 4, ["mtr", "upma", "indian", "packaged"], 220, 2);
  add("mtr-poha-mix", "MTR Poha Mix", "🥣", "branded meals", "1 prepared serving", vegan, ["peanuts"], 240, 5, 43, 6, 4, ["mtr", "poha", "indian", "packaged"], 260, 5);
  add("top-ramen-curry", "Top Ramen Curry Noodles", "🍜", "branded meals", "1 prepared packet", vegetarian, ["wheat"], 360, 8, 52, 14, 3, ["top ramen", "noodles", "instant", "packaged"], 230, 0);
  add("yippee-noodles", "Sunfeast YiPPee! Noodles", "🍜", "branded meals", "1 prepared packet", vegetarian, ["wheat"], 350, 8, 51, 13, 3, ["yippee", "noodles", "instant", "packaged"], 220, 0);
  add("cadbury-five-star", "Cadbury 5 Star", "🍫", "branded sweets", "1 regular bar", vegetarian, ["milk", "soy"], 220, 2.5, 30, 10, 1, ["cadbury", "chocolate", "caramel", "packaged"], 120, 0);
  add("cadbury-perk", "Cadbury Perk", "🍫", "branded sweets", "1 bar", vegetarian, ["wheat", "milk", "soy"], 150, 2, 20, 7, 0.5, ["cadbury", "chocolate", "wafer", "packaged"], 70, 0);
  add("munch-bar", "Nestlé Munch", "🍫", "branded sweets", "1 bar", vegetarian, ["wheat", "milk", "soy"], 160, 2, 21, 8, 0.5, ["nestle", "munch", "chocolate", "wafer", "packaged"], 75, 0);
  add("milkybar", "Nestlé Milkybar", "🍫", "branded sweets", "25 g bar", vegetarian, ["milk", "soy"], 135, 2, 15, 7.5, 0, ["nestle", "milkybar", "white chocolate", "packaged"], 90, 0);
  add("ferrero-rocher", "Ferrero Rocher", "🍫", "branded sweets", "3 pieces", vegetarian, ["milk", "hazelnuts", "soy", "wheat"], 220, 3, 18, 15, 1.5, ["ferrero", "chocolate", "hazelnut", "packaged"], 150, 0);
  add("kinder-joy", "Kinder Joy", "🍫", "branded sweets", "1 egg", vegetarian, ["milk", "wheat", "soy"], 110, 2, 11, 7, 0.5, ["kinder", "chocolate", "packaged"], 70, 0);
  add("amul-dark-chocolate", "Amul Dark Chocolate", "🍫", "branded sweets", "40 g serving", vegetarian, ["milk", "soy"], 220, 3, 20, 14, 3, ["amul", "dark chocolate", "packaged"], 220, 0);
  add("amul-vanilla-ice-cream", "Amul Vanilla Ice Cream", "🍨", "branded desserts", "100 ml scoop", vegetarian, ["milk"], 140, 3, 18, 6, 0, ["amul", "ice cream", "packaged"], 160, 0);
  add("kwality-walls-cornetto", "Kwality Wall's Cornetto", "🍦", "branded desserts", "1 cone", vegetarian, ["milk", "wheat", "soy"], 220, 4, 29, 10, 1, ["kwality walls", "ice cream", "cone", "packaged"], 180, 0);
  add("mother-dairy-curd", "Mother Dairy Curd", "🥣", "branded dairy", "200 g cup", vegetarian, ["milk"], 120, 7, 9, 6, 0, ["mother dairy", "curd", "yogurt", "packaged"], 280, 1);
  add("epigamia-greek-yogurt", "Epigamia Greek Yogurt", "🥣", "branded dairy", "90 g cup", vegetarian, ["milk"], 85, 7, 10, 2, 0, ["epigamia", "greek yogurt", "high-protein", "packaged"], 130, 0);
  add("amul-paneer", "Amul Fresh Paneer", "🧀", "branded dairy", "100 g", vegetarian, ["milk"], 265, 18, 5, 20, 0, ["amul", "paneer", "high-protein", "packaged"], 110, 0);
}());
