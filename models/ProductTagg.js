const mongoose = require('mongoose');

const productTaggSchema = new mongoose.Schema({
  prodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prod',
    required: true
  },
  taggId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tagg',
    required: true
  }
});
module.exports = mongoose.model('ProductTagg', productTaggSchema);