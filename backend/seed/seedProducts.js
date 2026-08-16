import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

/**
 * 12 Quick Commerce Department Categories
 */
const categoriesData = [
  { name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🥦', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dairy & Breakfast', slug: 'dairy-breakfast', icon: '🥛', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80' },
  { name: 'Munchies', slug: 'munchies', icon: '🍿', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80' },
  { name: 'Cold Drinks & Juices', slug: 'cold-drinks-juices', icon: '🧃', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80' },
  { name: 'Bakery & Biscuits', slug: 'bakery-biscuits', icon: '🍞', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80' },
  { name: 'Instant & Frozen Food', slug: 'instant-food', icon: '🍜', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80' },
  { name: 'Tea, Coffee & Health Drinks', slug: 'tea-coffee', icon: '☕', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80' },
  { name: 'Cleaning & Household', slug: 'cleaning-household', icon: '🧹', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80' },
  { name: 'Personal Care', slug: 'personal-care', icon: '🧴', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80' },
  { name: 'Baby Care', slug: 'baby-care', icon: '👶', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80' },
  { name: 'Pet Care', slug: 'pet-care', icon: '🐾', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80' },
  { name: 'Paan Corner', slug: 'paan-corner', icon: '🍃', image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80' },
];

/**
 * Helper function to generate 100+ realistic grocery products mapped across categories
 */
const generateProducts = (categoryMap) => {
  const p = [];

  const add = (catName, name, brand, price, mrp, unit, image, description, isFeatured = false, stock = 40) => {
    const catId = categoryMap[catName];
    p.push({
      name,
      description,
      brand,
      category: catId,
      price,
      mrp,
      unit,
      image,
      images: [image],
      stock,
      rating: +(4.1 + Math.random() * 0.8).toFixed(1),
      numReviews: Math.floor(10 + Math.random() * 90),
      isFeatured,
      isActive: true,
    });
  };

  // 1. Fruits & Vegetables (12 Products)
  add('Fruits & Vegetables', 'Fresh Shimla Apple (Red Delicious)', 'Farm Fresh', 149, 199, '4 pcs (approx 500g)', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80', 'Crisp, juicy and naturally sweet Himachal Shimla apples.', true);
  add('Fruits & Vegetables', 'Robusta Bananas', 'Farm Fresh', 39, 49, '6 pcs (approx 750g)', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80', 'Rich in potassium and natural energy.', true);
  add('Fruits & Vegetables', 'Fresh Hybrid Tomatoes', 'Farm Fresh', 28, 38, '500g', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80', 'Firm, ripe red tomatoes essential for Indian curries.');
  add('Fruits & Vegetables', 'Organic Red Onions', 'Farm Fresh', 35, 45, '1 kg', 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?auto=format&fit=crop&w=400&q=80', 'Pungent and crisp Grade-A red onions.');
  add('Fruits & Vegetables', 'Fresh Potatoes (AlOO)', 'Farm Fresh', 32, 40, '1 kg', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80', 'Versatile fresh potatoes sourced directly from farms.');
  add('Fruits & Vegetables', 'Green Coriander / Dhaniya', 'Farm Fresh', 15, 20, '100g', 'https://images.unsplash.com/photo-1588879460618-924a00f2e825?auto=format&fit=crop&w=400&q=80', 'Fresh aromatic coriander leaves for garnishing.');
  add('Fruits & Vegetables', 'Fresh Green Capsicum', 'Farm Fresh', 24, 30, '250g', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80', 'Crunchy green bell peppers rich in Vitamin C.');
  add('Fruits & Vegetables', 'Valencia Oranges', 'Farm Fresh', 89, 110, '1 kg', 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=400&q=80', 'Juicy, tangy citrus oranges packed with immunity booster Vitamin C.');
  add('Fruits & Vegetables', 'Fresh Pomegranate (Anar)', 'Farm Fresh', 129, 160, '2 pcs (approx 400g)', 'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?auto=format&fit=crop&w=400&q=80', 'Ruby red juicy arils packed with antioxidants.');
  add('Fruits & Vegetables', 'Fresh Garlic (Lahsun)', 'Farm Fresh', 45, 55, '200g', 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=400&q=80', 'Aromatic Indian garlic cloves.');
  add('Fruits & Vegetables', 'Fresh Ginger (Adrak)', 'Farm Fresh', 30, 40, '200g', 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80', 'Zesty fresh ginger root perfect for chai and gravy base.');
  add('Fruits & Vegetables', 'Lemon (Nimbu)', 'Farm Fresh', 18, 25, '4 pcs', 'https://images.unsplash.com/photo-1534531141161-e41604990176?auto=format&fit=crop&w=400&q=80', 'Fresh juicy yellow lemons.');

  // 2. Dairy & Breakfast (10 Products)
  add('Dairy & Breakfast', 'Amul Taaza Toned Milk', 'Amul', 27, 28, '500 ml', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80', 'Pasteurized toned milk rich in calcium and protein.', true);
  add('Dairy & Breakfast', 'Amul Pasteurised Butter', 'Amul', 56, 58, '100g', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80', 'Delicious salted butter made from wholesome milk.', true);
  add('Dairy & Breakfast', 'Mother Dairy Classic Dahi', 'Mother Dairy', 35, 40, '400g', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80', 'Thick, creamy and fresh probiotic curd.');
  add('Dairy & Breakfast', 'Amul Malai Paneer', 'Amul', 92, 98, '200g', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80', 'Soft and fresh cottage cheese blocks.');
  add('Dairy & Breakfast', 'Farm Fresh White Eggs (6 pcs)', 'Eggoz', 48, 60, '6 pcs pack', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=400&q=80', 'UV sanitized protein-rich farm eggs.', true);
  add('Dairy & Breakfast', 'Kellogg’s Corn Flakes Original', 'Kellogg’s', 175, 195, '475g', 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=400&q=80', 'Crispy toasted golden corn flakes breakfast cereal.');
  add('Dairy & Breakfast', 'Quaker Rolled Oats', 'Quaker', 190, 225, '1 kg', 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=400&q=80', '100% natural wholegrain oats for healthy breakfast.');
  add('Dairy & Breakfast', 'Amul Cow Ghee', 'Amul', 315, 340, '500 ml', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80', 'Pure aromatic cow ghee with granular texture.');
  add('Dairy & Breakfast', 'Britannia Cheese Slices', 'Britannia', 140, 155, '200g (10 slices)', 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&q=80', 'Creamy processed cheese slices for sandwiches and burgers.');
  add('Dairy & Breakfast', 'Nutrella Soya Chunks', 'Nutrela', 50, 55, '200g', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80', 'High-protein 100% vegetarian soya nuggets.');

  // 3. Munchies (10 Products)
  add('Munchies', 'Lays India’s Magic Masala Chips', 'Lays', 20, 20, '50g', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80', 'Spicy aromatic Indian style potato chips.', true);
  add('Munchies', 'Doritos Cheese Nachos', 'Doritos', 50, 50, '82g', 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80', 'Crunchy corn tortilla chips with intense cheese flavor.', true);
  add('Munchies', 'Haldiram’s Aloo Bhujia', 'Haldiram’s', 55, 60, '200g', 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80', 'Classic spicy potato and gram flour crispy snack.');
  add('Munchies', 'Kurkure Masala Munch', 'Kurkure', 20, 20, '75g', 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?auto=format&fit=crop&w=400&q=80', 'Tedhe-medhe crispy corn puffs loaded with spices.');
  add('Munchies', 'Act II Butter Popcorn (Microwave)', 'Act II', 35, 40, '70g', 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=400&q=80', 'Hot and fluffy butter flavored microwave popcorn.');
  add('Munchies', 'Pringles Original Potato Crisps', 'Pringles', 105, 115, '107g', 'https://images.unsplash.com/photo-1528751014936-863e6e7a319c?auto=format&fit=crop&w=400&q=80', 'Iconic stackable potato crisps in a re-sealable can.');
  add('Munchies', 'Haldiram’s Moong Dal', 'Haldiram’s', 48, 52, '200g', 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80', 'Salted crispy fried split yellow lentils.');
  add('Munchies', 'Unibic Butter Cookies', 'Unibic', 30, 35, '75g', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', 'Rich melt-in-mouth butter cookies.');
  add('Munchies', 'Bingo Mad Angles Cream & Onion', 'Bingo', 20, 20, '66g', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80', 'Triangular crunchy corn snacks.');
  add('Munchies', 'Happilo Premium Roasted Almonds', 'Happilo', 249, 299, '200g', 'https://images.unsplash.com/photo-1508061253366-f7da158b6d96?auto=format&fit=crop&w=400&q=80', 'Crunchy lightly salted Californian almonds.');

  // 4. Cold Drinks & Juices (10 Products)
  add('Cold Drinks & Juices', 'Coca-Cola Soft Drink', 'Coca-Cola', 40, 40, '750 ml', 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80', 'Refreshing carbonated cola drink.', true);
  add('Cold Drinks & Juices', 'Sprite Lemon Lime Drink', 'Sprite', 40, 40, '750 ml', 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&w=400&q=80', 'Crisp clear lemon lime sparkling soda.');
  add('Cold Drinks & Juices', 'Thums Up Charged Cola', 'Thums Up', 40, 40, '750 ml', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80', 'Strong fizzy cola taste with extra kick.');
  add('Cold Drinks & Juices', 'Real Fruit Power Mixed Fruit Juice', 'Real', 110, 130, '1 L', 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=400&q=80', '100% fruit juice blend packed with goodness.', true);
  add('Cold Drinks & Juices', 'Tropicana 100% Orange Juice', 'Tropicana', 125, 145, '1 L', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80', 'No added sugar pure orange juice.');
  add('Cold Drinks & Juices', 'Red Bull Energy Drink', 'Red Bull', 125, 125, '250 ml', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80', 'Vitalizes body and mind premium energy drink.');
  add('Cold Drinks & Juices', 'Paper Boat Aamras Mango Drink', 'Paper Boat', 35, 40, '200 ml', 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80', 'Authentic thick Alphonso mango pulp drink.');
  add('Cold Drinks & Juices', 'Frooti Mango Drink', 'Frooti', 20, 20, '200 ml', 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80', 'Juicy mango drink loved by generations.');
  add('Cold Drinks & Juices', 'Kinley Packaged Drinking Water', 'Kinley', 20, 20, '1 L', 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=400&q=80', 'Purified reverse osmosis drinking water bottle.');
  add('Cold Drinks & Juices', 'Schweppes Tonic Water', 'Schweppes', 60, 65, '300 ml', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=400&q=80', 'Crisp sparkling tonic water with quinine.');

  // 5. Bakery & Biscuits (8 Products)
  add('Bakery & Biscuits', 'Britannia 100% Whole Wheat Bread', 'Britannia', 45, 50, '400g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', 'Soft wholegrain brown bread loaded with fiber.', true);
  add('Bakery & Biscuits', 'Britannia Good Day Butter Biscuits', 'Britannia', 30, 30, '150g', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', 'Rich butter biscuits packed with cashew crunch.');
  add('Bakery & Biscuits', 'Parle-G Gold Glucose Biscuits', 'Parle', 25, 25, '200g', 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80', 'India’s favorite glucose biscuits.');
  add('Bakery & Biscuits', 'Oreo Chocolate Sandwich Cookies', 'Oreo', 35, 40, '120g', 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80', 'Rich cocoa cookies filled with vanilla cream.');
  add('Bakery & Biscuits', 'Dark Fantasy Choco Fills', 'Sunfeast', 45, 50, '75g', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80', 'Molten chocolate filling inside crunchy cookie shell.', true);
  add('Bakery & Biscuits', 'English Oven Garlic Toast', 'English Oven', 65, 75, '150g', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80', 'Crispy toasted garlic butter crostini.');
  add('Bakery & Biscuits', 'Britannia Bourbon Biscuit', 'Britannia', 30, 35, '150g', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80', 'Decadent chocolate cream sandwich biscuits with sugar crystals.');
  add('Bakery & Biscuits', 'Harvest Gold Fruit Bun (2 pcs)', 'Harvest Gold', 20, 25, '150g', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80', 'Soft sweet buns studded with tutti frutti bits.');

  // 6. Instant & Frozen Food (8 Products)
  add('Instant & Frozen Food', 'Maggi 2-Minute Masala Noodles', 'Nestle', 56, 60, '4 pcs pack (280g)', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80', 'Classic 2-minute instant masala noodles.', true);
  add('Instant & Frozen Food', 'McCain French Fries (Crispy)', 'McCain', 115, 130, '420g', 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80', 'Crispy restaurant-style golden frozen french fries.');
  add('Instant & Frozen Food', 'Knorr Classic Tomato Soup', 'Knorr', 45, 50, '53g', 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=400&q=80', 'Rich creamy tomato soup mix.');
  add('Instant & Frozen Food', 'Yippee Magic Masala Noodles', 'Sunfeast', 48, 52, '240g', 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=400&q=80', 'Non-sticky long round instant noodles.');
  add('Instant & Frozen Food', 'McCain Veggie Nuggets', 'McCain', 125, 140, '320g', 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80', 'Crispy vegetable bites with corn and peas.');
  add('Instant & Frozen Food', 'MTR Instant Rava Idli Mix', 'MTR', 95, 110, '500g', 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80', 'Quick steamy South Indian semolina idli batter mix.');
  add('Instant & Frozen Food', 'Bambino Roasted Vermicelli', 'Bambino', 32, 38, '400g', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80', 'Pre-roasted durum wheat vermicelli for upma and kheer.');
  add('Instant & Frozen Food', 'Chings Secret Schezwan Noodles', 'Chings', 40, 45, '240g', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80', 'Spicy Indo-Chinese schezwan style instant noodles.');

  // 7. Tea, Coffee & Health Drinks (8 Products)
  add('Tea, Coffee & Health Drinks', 'Tata Tea Gold Premium Black Tea', 'Tata Tea', 245, 275, '500g', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80', 'Rich blend of Assam orthodox leaves and tea dust.', true);
  add('Tea, Coffee & Health Drinks', 'Nescafe Classic Instant Coffee', 'Nescafe', 185, 210, '100g Jar', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', '100% pure instant coffee granules with rich aroma.', true);
  add('Tea, Coffee & Health Drinks', 'Red Label Natural Care Tea', 'Brooke Bond', 260, 290, '500g', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80', 'Tea infused with 5 Ayurvedic herbs: Tulsi, Ginger, Mulethi, Ashwagandha.');
  add('Tea, Coffee & Health Drinks', 'Bournvita Chocolate Health Drink', 'Cadbury', 250, 275, '500g Jar', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80', 'Malt chocolate drink mix fortified with essential vitamins.');
  add('Tea, Coffee & Health Drinks', 'Horlicks Malt Drink Powder', 'Horlicks', 230, 255, '500g', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80', 'Clinically proven health drink for growth.');
  add('Tea, Coffee & Health Drinks', 'Lipton Green Tea Honey Lemon', 'Lipton', 190, 220, '25 Tea Bags', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=400&q=80', 'Zero calorie green tea infused with natural honey and lemon.');
  add('Tea, Coffee & Health Drinks', 'Davidoff Rich Aroma Instant Coffee', 'Davidoff', 550, 625, '100g Jar', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80', 'Luxury South American Arabica coffee blend.');
  add('Tea, Coffee & Health Drinks', 'Complan Chocolate Flavor', 'Complan', 280, 310, '500g', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80', 'Nutrition drink with 34 vital nutrients.');

  // 8. Cleaning & Household (8 Products)
  add('Cleaning & Household', 'Surf Excel Easy Wash Detergent', 'Surf Excel', 145, 160, '1 kg', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80', 'Superior stain removing washing powder.', true);
  add('Cleaning & Household', 'Vim Dishwash Liquid Gel', 'Vim', 105, 120, '750 ml', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=400&q=80', 'Lemon power liquid grease remover for cookware.');
  add('Cleaning & Household', 'Colin Glass Cleaner Spray', 'Colin', 95, 105, '500 ml', 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=400&q=80', 'Streak-free shine cleaner for glass and mirrors.');
  add('Cleaning & Household', 'Lizol Disinfectant Surface Cleaner', 'Lizol', 185, 205, '1 L Citrus', 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80', 'Kills 99.9% germs triple action floor cleaner.');
  add('Cleaning & Household', 'Harpic Power Plus Toilet Cleaner', 'Harpic', 92, 100, '500 ml', 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?auto=format&fit=crop&w=400&q=80', '10x stain remover disinfectant toilet bowl gel.');
  add('Cleaning & Household', 'Godrej Aer Pocket Bathroom Fragrance', 'Godrej', 55, 60, '10g', 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80', 'Long lasting fresh floral fragrance gel pocket.');
  add('Cleaning & Household', 'Comfort After Wash Fabric Conditioner', 'Comfort', 120, 135, '860 ml', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80', 'Leaves clothes soft, shiny and scented for days.');
  add('Cleaning & Household', 'Odonil Bathroom Air Freshener', 'Odonil', 48, 55, '50g', 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=400&q=80', 'Lavender bloom bathroom fragrance block.');

  // 9. Personal Care (8 Products)
  add('Personal Care', 'Dove Cream Beauty Bathing Bar Soap', 'Dove', 165, 185, '3x100g pack', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80', '1/4th moisturizing cream formula for soft skin.', true);
  add('Personal Care', 'Nivea Soft Moisturising Cream', 'Nivea', 199, 230, '100 ml', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80', 'Light non-greasy body & face moisturizer with Vitamin E.');
  add('Personal Care', 'Head & Shoulders Anti-Dandruff Shampoo', 'Head & Shoulders', 180, 205, '180 ml', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80', 'Smooth and silky up to 100% dandruff free scalp care.');
  add('Personal Care', 'Colgate Strong Teeth Toothpaste', 'Colgate', 95, 105, '200g', 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=400&q=80', 'Calci-lock formula for twice stronger teeth.');
  add('Personal Care', 'Dettol Original Liquid Handwash', 'Dettol', 90, 99, '200 ml Pump', 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80', 'pH-balanced germ protection liquid hand soap.');
  add('Personal Care', 'Gillette Mach3 Turbo Razor', 'Gillette', 299, 349, '1 Razor + 1 Cartridge', 'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=400&q=80', '3-blade precision shaving razor for smooth glide.');
  add('Personal Care', 'Dabur Red Ayurvedic Toothpaste', 'Dabur', 85, 95, '200g', 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?auto=format&fit=crop&w=400&q=80', 'Formulated with Clove, Pudina and Tomar for dental protection.');
  add('Personal Care', 'Vaseline Intensive Care Lotion', 'Vaseline', 210, 245, '400 ml', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80', 'Deep restore dry skin body lotion with micro-droplets.');

  // 10. Baby Care (6 Products)
  add('Baby Care', 'Pampers All-in-One Pants (Medium)', 'Pampers', 699, 799, '44 Diapers Pack', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80', 'Soft stretchable waist diaper pants with aloe lotion.', true);
  add('Baby Care', 'Huggies Wonder Pants (Large)', 'Huggies', 749, 849, '42 Diapers Pack', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80', 'Bubble bed technology for up to 12 hours absorption.');
  add('Baby Care', 'Himalaya Gentle Baby Wipes', 'Himalaya', 160, 190, '72 Wipes', 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80', 'Alcohol-free wipes infused with Indian Lotus and Aloe Vera.');
  add('Baby Care', 'Johnson’s Baby Shampoo', 'Johnson’s', 190, 215, '200 ml', 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80', 'No more tears gentle formula for delicate baby hair.');
  add('Baby Care', 'Cerelac Fortified Baby Cereal Wheat Apple', 'Nestle', 230, 250, '300g Box', 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=400&q=80', 'Complementary food for babies from 6 months onwards.');
  add('Baby Care', 'Sebamed Baby Protective Facial Cream', 'Sebamed', 780, 850, '50 ml', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80', 'pH 5.5 dermatologically tested baby face lotion.');

  // 11. Pet Care (6 Products)
  add('Pet Care', 'Pedigree Adult Dry Dog Food (Chicken & Vegetables)', 'Pedigree', 380, 420, '1.2 kg', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', 'Complete balanced nutrition for adult dogs.', true);
  add('Pet Care', 'Whiskas Ocean Fish Dry Cat Food', 'Whiskas', 350, 390, '1 kg', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', 'Delicious ocean fish kibble with essential Omega 3 & 6.');
  add('Pet Care', 'Purepet Clumping Lavender Cat Litter', 'Purepet', 280, 330, '5 kg', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80', 'High absorbent dust-free bentonite clay cat litter.');
  add('Pet Care', 'Meat Up Dog Biscuits (Chicken Flavor)', 'Meat Up', 120, 150, '500g', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', 'Crunchy bone-shaped training treats for dogs.');
  add('Pet Care', 'Dentastix Medium Dog Dental Treats', 'Pedigree', 180, 210, '110g (7 sticks)', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', 'Triple action dental care sticks to reduce tartar buildup.');
  add('Pet Care', 'Choostix Rawhide Chew Bones for Dogs', 'Choostix', 150, 180, '450g Pack', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', 'High protein long lasting chew bones for strong jaws.');

  // 12. Paan Corner (6 Products)
  add('Paan Corner', 'Pass Pass Sweet Meetha Paan Mix', 'Pass Pass', 10, 10, '15g', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80', 'Aromatic mouth freshener mix with gulkand and fennel.');
  add('Paan Corner', 'Center Fresh Mint Chewing Gum', 'Center Fresh', 45, 50, 'Pack of 9', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', 'Spearmint liquid filled chewing gum.');
  add('Paan Corner', 'Rajnigandha Silver Coated Elaichi', 'Rajnigandha', 110, 120, '10g Tin', 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=400&q=80', 'Premium silver coated green cardamom mouth freshener.');
  add('Paan Corner', 'Tic Tac Mint Breath Mints', 'Tic Tac', 20, 20, '14.5g', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', 'Iconic hard mint pill drops.');
  add('Paan Corner', 'Chiclets Peppermint Chewing Gum', 'Chiclets', 15, 15, '10 Pellets', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', 'Refreshing peppermint crunchy coated gum.');
  add('Paan Corner', 'Orbit Spearmint Sugar Free Chewing Gum', 'Wrigleys Orbit', 50, 50, 'Pack of 6', 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=400&q=80', 'Sugar free oral health approved spearmint chewing gum.');

  return p;
};

/**
 * Main Database Seeder Execution with Fallback Connection Handling
 */
const seedDatabase = async () => {
  try {
    const primaryUri = process.env.MONGODB_URI;
    const fallbackUri = 'mongodb://127.0.0.1:27017/blinkit_db';

    let connected = false;

    // Try primary URI if provided
    if (primaryUri && !primaryUri.includes('<username>')) {
      try {
        console.log(`📡 Connecting to MongoDB Atlas for seeding...`);
        await mongoose.connect(primaryUri);
        connected = true;
      } catch (err) {
        console.warn(`⚠️ Atlas connection failed (${err.message}). Attempting local database fallback...`);
      }
    }

    // Try local fallback
    if (!connected) {
      try {
        console.log(`📡 Connecting to Local MongoDB (${fallbackUri})...`);
        await mongoose.connect(fallbackUri);
        connected = true;
      } catch (localErr) {
        console.error(`=================================`);
        console.error(`❌ MongoDB Connection Warning: Could not connect to Atlas or Local MongoDB.`);
        console.error(`👉 Please update backend/.env with your valid MongoDB Atlas URI string.`);
        console.error(`=================================`);
        process.exit(1);
      }
    }

    // 1. Clear existing collections
    console.log('🧹 Cleaning existing products, categories, and users...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});

    // 2. Insert Department Categories
    console.log('🌱 Inserting 12 Quick Commerce Categories...');
    const insertedCategories = await Category.insertMany(categoriesData);

    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // 3. Insert 100+ Grocery Products
    console.log('📦 Generating and inserting 100+ Grocery Products...');
    const productsData = generateProducts(categoryMap);
    const insertedProducts = await Product.insertMany(productsData);

    // 4. Seed Demo Accounts
    console.log('👑 Seeding Demo Admin and Customer Accounts...');
    await User.create({
      name: 'Blinkit Admin',
      email: 'admin@example.com',
      password: 'Admin@2609',
      role: 'admin',
      phone: '+91 9999988888',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isEmailVerified: true,
    });

    await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      role: 'user',
      phone: '+91 9876543210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isEmailVerified: true,
    });

    console.log(`=================================`);
    console.log(`🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!`);
    console.log(`📂 Categories Inserted: ${insertedCategories.length}`);
    console.log(`🛒 Products Inserted:   ${insertedProducts.length}`);
    console.log(`👤 Users Seeded:        2 (Admin: admin@example.com / Customer: john@example.com)`);
    console.log(`=================================`);

    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
