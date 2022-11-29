import '../config/config';
import express from 'express';
import cors from 'cors';
import MongoStore from 'connect-mongo';
import session from 'express-session';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';
import ios from 'socket.io-express-session';
import { socket } from './socket';
import { connectDB, disconnectDb } from './db/conn';
import expressConfig from '../config/express.config';
import AuthService from './services/auth/auth.service';
import SessionService from './services/session.service';
import UserService from './services/user.service';

const __dirname = new URL('.', import.meta.url).pathname;
const PORT = process.env.PORT || 8000;
const app = express();
const httpServer = http.createServer(app);

// socket
const io = new Server(httpServer);

connectDB();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.enable('trust proxy', true);
app.set('trust proxy', 1);
app.use(express.static('dist'));

expressConfig.store = MongoStore.create({ mongoUrl: process.env.DB_URI });
const expressSession = session(expressConfig);
app.use(expressSession);
io.use(ios(expressSession));

app.use('/static', express.static('dist'));
app.use('*/js', express.static('dist'));
app.use('*/txt', express.static('dist'));

// attach user to req object
app.all('*', async (req, res, next) => {
  console.log('Attaching user to req object...');
  const user = await SessionService.getUserFromSession(req.session.id);
  console.log('Successfully atached user to req object');
  req.user = user;
  next();
});

// attach user to socket object
io.use(async (soc, next) => {
  const user = await SessionService.getUserFromSession(soc.handshake.session.id);
  soc.user = user;
  next();
});

socket(io);

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body.params;
  try {
    const data = await AuthService.register({ username, password });

    if (data.error) {
      res.status(500).send(data);
      return;
    }

    const success = await AuthService.authorized(data, req.session.id);
    if (success) {
      res.status(200).send();
      return;
    }
    res.status(500).send();
    return;
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
      res.status(500).send(data);
      return;
    }

    const success = await AuthService.authorized(data, req.session.id);
    if (success) {
      res.status(200).send();
      return;
    }
    res.status(500).send();
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.post('/api/user/update-settings', async (req, res) => {
  console.log('POST /api/user/update-settings');
  try {
    const { user } = req;
    const { data } = req.body.params;
    if (user._id.toString() !== data._id) {
      const err = {
        error: 'You are not authorized to perform this request.',
      };
      res.status(401).send(err);
      return;
    }

    const newUser = await UserService.updateProfile(data._id, data);
    if (newUser?.user?.username) {
      res.status(200).send({ user: newUser });
    } else {
      res.status(500).send();
    }
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.post('/api/user/air-quality-data', async (req, res) => {
  console.log('POST /api/user/air-quality-data');
  try {
    const { data } = req.body.params;
    const { model, value } = data;
    const { user } = await UserService.UpdateAirData(model, value);
    const curOutdoorAQHI = user.outdoorData[user.outdoorData?.length - 1];

    res.status(200).send({
      username: user.username, timeRead: curOutdoorAQHI.time, value: curOutdoorAQHI.AQHI, city: user.city,
    });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.get('/api/user/from-session', async (req, res) => {
  console.log('GET /api/user/from-session');
  try {
    const { user } = req;
    if (user?.username) {
      res.status(200).send(user);
    } else {
      res.status(500).send();
    }
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

const cleanUp = (signalType) => {
  console.log('received signal', signalType);
  disconnectDb();
  process.exit(0);
};

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '..', 'dist', 'index.html')));

httpServer.listen(PORT, () => {
  console.log('listening on port', PORT);

  ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'].forEach((signalType) => {
    process.on(signalType, cleanUp.bind(null, signalType));
  });
});
