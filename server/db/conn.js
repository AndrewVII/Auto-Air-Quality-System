import mongoose from 'mongoose';

export const connectDB = async () => {
  mongoose.connect(process.env.DB_URI);

  mongoose.connection.on('error', err => {
    console.log(err);
  });

  mongoose.connection.once('open', () => {
    console.log('successful connection to mongodb');
  });
};

export const disconnectDb = () => {
  console.log('disconnecting mongoose');
  mongoose.disconnect();
};
