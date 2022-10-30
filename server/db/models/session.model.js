import mongoose from 'mongoose';

const schema = {
  _id: {
    type: String,
    required: true,
  },
  loggedIn: {
    type: Boolean,
    default: false,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
};

const compiledSchema = new mongoose.Schema(schema,
  {
    collection: 'sessions',
    autoIndex: true,
    strict: true,
    timestamps: true,
  });

export default {
  model: mongoose.model('Session', compiledSchema),
};
