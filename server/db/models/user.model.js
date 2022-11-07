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
  model: {
    type: String,
  },
  indoorData: [
    {
      value: Number,
      recordedAt: Date,
    },
  ],
  socketId: {
    type: String,
  },
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
