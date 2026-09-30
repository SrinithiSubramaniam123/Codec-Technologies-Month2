import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  tags: [String],
  image: { type: String, default: '' },
  stock: { type: Number, default: 0, min: 0 },
  rating: { type: Number, default: 4.5 },
  numReviews: { type: Number, default: 0 },
}, { timestamps: true });
schema.index({ name: 'text', description: 'text', tags: 'text' });
export default mongoose.model('Product', schema);
