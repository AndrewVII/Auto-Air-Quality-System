import mongoose from 'mongoose';

const schema = {
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  username: {
    type: String,
    minlength: 1,
    maxlength: 32,
  },
  password: {
    type: String,
    select: false,
  },
  city: {
    type: String,
  },
  indoorData: [{
    date: Date,
    data: [{
      value: Number,
      recordedAt: Date,
    }],
  }],
};

const compiledSchema = new mongoose.Schema(
  schema,
  {
    collection: 'users',
    autoIndex: true,
    strict: true,
    timestamps: true,
  },
);

export default {
  model: mongoose.model('User', compiledSchema),
};
