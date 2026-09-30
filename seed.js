import 'dotenv/config';
import mongoose from 'mongoose';
import Product from './models/Product.js';
import User from './models/User.js';

const P = (name, category, price, stock, description, tags, rating = 4.6, numReviews = 12) =>
  ({ name, category, price, stock, description, tags, rating, numReviews });

const products = [
  P('Tidewater Mug', 'Mugs', 28, 24, 'Hand-thrown stoneware mug with a deep blue reactive glaze and a thumb rest.', ['coffee', 'blue', 'stoneware', 'gift']),
  P('Morning Fog Mug', 'Mugs', 26, 30, 'Matte grey-green glaze over speckled clay. Holds 12 oz of coffee or tea.', ['coffee', 'tea', 'grey', 'speckled']),
  P('Saffron Espresso Cup', 'Mugs', 18, 40, 'Small glossy cup in warm saffron yellow, sized for a double espresso.', ['espresso', 'yellow', 'coffee']),
  P('Celadon Noodle Bowl', 'Bowls', 34, 15, 'Wide, deep bowl in pale celadon glaze. Dishwasher safe, made for ramen and soups.', ['soup', 'green', 'noodle', 'dinnerware']),
  P('Ink Cereal Bowl', 'Bowls', 30, 22, 'Deep blue-black bowl with a hand-dipped white rim.', ['breakfast', 'blue', 'dinnerware']),
  P('Speckle Serving Bowl', 'Bowls', 58, 8, 'Large serving bowl in creamy speckled glaze for salads and pasta.', ['serving', 'speckled', 'entertaining']),
  P('Dune Dinner Plate', 'Plates', 32, 20, 'Flat stoneware plate with a sandy matte finish and a slightly raised edge.', ['dinnerware', 'sand', 'matte']),
  P('Tidewater Side Plate', 'Plates', 22, 26, 'Side plate that matches the Tidewater Mug, deep blue glaze with pooled edges.', ['blue', 'dinnerware', 'gift']),
  P('Saffron Serving Platter', 'Plates', 64, 6, 'Oval platter in glossy saffron for bread, cheese and roasted vegetables.', ['serving', 'yellow', 'entertaining']),
  P('Reed Bud Vase', 'Vases', 36, 18, 'Slim bud vase for a single stem. Glazed inside so it holds water.', ['flowers', 'green', 'decor']),
  P('Harbor Floor Vase', 'Vases', 120, 4, 'Tall floor vase in layered blue glaze, big enough for branches and dried grasses.', ['flowers', 'blue', 'decor', 'statement']),
  P('Pebble Vase', 'Vases', 48, 12, 'Round, low vase with a soft matte grey glaze.', ['flowers', 'grey', 'decor']),
  P('Fern Planter', 'Planters', 42, 14, 'Planter with drainage hole and saucer, in mossy green glaze.', ['plants', 'green', 'decor']),
  P('Dune Herb Pot', 'Planters', 24, 30, 'Small sandy pot for kitchen herbs. Comes with a matching dish.', ['plants', 'herbs', 'sand', 'kitchen']),
  P('Tide Pour-Over Set', 'Coffee', 76, 10, 'Dripper and carafe in blue reactive glaze. Makes two cups.', ['coffee', 'blue', 'gift', 'brewing']),
  P('Morning Fog Teapot', 'Coffee', 68, 9, 'Four-cup teapot with a built-in strainer and grey-green glaze.', ['tea', 'grey', 'gift', 'brewing']),
];

await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kiln');
await Product.deleteMany();
await Product.insertMany(products);
if (!(await User.findOne({ email: 'admin@kiln.test' })))
  await User.create({ name: 'Studio Admin', email: 'admin@kiln.test', password: 'admin123', role: 'admin' });
console.log(`Seeded ${products.length} products. Admin login: admin@kiln.test / admin123`);
await mongoose.disconnect();
