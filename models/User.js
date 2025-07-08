const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: { type: String, required: true },

  roler: {
    type: String,
    enum: ['superadmin', 'admin', 'ordinary'],
    default: 'ordinary'
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
    type: String,
    match: /\.(jpg|jpeg|png|gif|pdf|docx?|txt)$/i
  }

}, {
  timestamps: true
});

// Virtual for "id"
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
userSchema.set('toJSON', { virtuals: true });

userSchema.plugin(mongoosePaginate);


module.exports = mongoose.model('User', userSchema);

