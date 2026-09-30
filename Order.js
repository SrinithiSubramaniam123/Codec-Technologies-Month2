import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, price: Number, qty: Number, image: String,
  }],
  total: Number,
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'cancelled'], default: 'pending' },
  address: { name: String, line1: String, city: String, postal: String, country: String },
  stripeSessionId: String,
}, { timestamps: true });
export default mongoose.model('Order', schema);
