// models/Subcat.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SubcatSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  catid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cat',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

SubcatSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Subcat', SubcatSchema);
