import mongoose from '../db';

const schema = new mongoose.Schema({
  name: String,
  creator: String,
  time: String,
  location: String,
  audience_count: { type: Number, default: 0 }
});

schema.index({ name: 'text'});

export default mongoose.model('Event', schema);
