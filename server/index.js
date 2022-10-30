import '../config/config';
import express from 'express';
import cors from 'cors';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import path from 'path';
import {connectDB, disconnectDb} from './db/conn';
import expressConfig from '../config/express.config';
import AuthService from './services/auth/auth.service';
import http from 'http';

const __dirname = new URL('.', import.meta.url).pathname;
const PORT = process.env.PORT || 8000;
const app = express();
const httpServer = http.createServer(app);

connectDB();

app.use(cors());
app.use(express.json());
app.enable('trust proxy', true);
app.set('trust proxy', 1);
app.use(express.static('dist'));

expressConfig.store = MongoStore.create({ mongoUrl: process.env.DB_URI });
const expressSession = session(expressConfig);
app.use(expressSession);

app.use('/static', express.static('dist'));
app.use('*/js', express.static('dist'));
app.use('*/txt', express.static('dist'));

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'dist/index.html')));

const cleanUp = (signalType) => {
  log('received signal', signalType);
  disconnectDb();
  process.exit(0);
};

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

httpServer.listen(PORT, () => {
  console.log('listening on port', PORT);

  ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'].forEach((signalType) => {
    process.on(signalType, cleanUp.bind(null, signalType));
  });
});
