const mongoose = require('mongoose');

const QuerySchema=Schema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "user" },
  email: { type: String, },
  concern: { type: String },
  name:{type: String},
  shopType:{type: String},
},{timestamps:true});

module.exports = mongoose.model('Queries', QuerySchema);