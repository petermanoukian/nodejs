// models/Cat.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CatSchema = new mongoose.Schema({
  name: { type: String, required: true }
});
CatSchema.plugin(mongoosePaginate); 
module.exports = mongoose.model('Cat', CatSchema);
