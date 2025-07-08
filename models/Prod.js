const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProdSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  catid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cat',
    required: true
  },
  subcatid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcat',
    required: true
  },
  taggs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tagg'
  }],


  des: {
    type: String,
    default: null,
    trim: true
  },
  dess: {
    type: String,
    default: null,
    trim: true
  },
  img: {
    large: {
      type: String, // Store image file path or URL
      match: /\.(jpg|jpeg|png|gif)$/i
    },
    thumbnail: {
      type: String,
      match: /\.(jpg|jpeg|png|gif)$/i
    }
  },
  filer: {
    type: String, // Store file reference
    default: null
  },
  prix: {
    type: Number,
    default: null
  },
  coder: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  vis: {
    type: Number,
    enum: [0, 1],
    default: 1
  },
  ordd: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


ProdSchema.index({ catid: 1, subcatid: 1, name: 1 }, { unique: true });

// 📦 Add pagination plugin
ProdSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Prod', ProdSchema);
