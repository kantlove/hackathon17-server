import mongoose from '../db';

const schema = new mongoose.Schema({
  name: String,
  field: String, // operating field (e.g. singer, artist)
  follows: { type: Array, default: [] }, // who this user follows
  followers: { type: Array, default: [] } // who follows this user
});

schema.index({ name: 'text', field: 'text' });

export default mongoose.model('User', schema);
