import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './db/conn';

dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });

const PORT = process.env.PORT || 8000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// Routes

app.post('/api/auth/register', (req, res) => {
  console.log('test');
  return { success: true };
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body.params;
  console.log(username, password);
  return { success: true };
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
