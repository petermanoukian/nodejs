const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2'); 


const taggSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});
taggSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Tagg', taggSchema);
