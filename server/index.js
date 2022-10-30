import '../config/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import connectDB from './db/conn';
import expressConfig from '../config/express.config';
import AuthService from './services/auth/auth.service';

const PORT = process.env.PORT || 8000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

expressConfig.store = MongoStore.create({ mongoUrl: process.env.DB_URI });
const expressSession = session(expressConfig);
app.use(expressSession);

app.use('/static', express.static('dist'));
app.use('*/js', express.static('dist'));
app.use('*/txt', express.static('dist'));

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body.params;
  try {
    const data = await AuthService.register({ username, password });
    if (data.error) {
      res.status(400).send(data);
      return;
    }
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body.params;
  try {
    const data = await AuthService.login({ username, password });
    if (data.error) {
      res.status(400).send(data);
      return;
    }
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
