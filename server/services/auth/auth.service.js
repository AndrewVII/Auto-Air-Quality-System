import bcrypt from 'bcrypt';
import db from '../../db/models';

class AuthService {
  static async authorized(data, sessionId) {
    try {
      const session = await db.Session.model.findById(sessionId);
      const existingUser = await db.User.model.findOne({ username: data.username });

      if (existingUser) {
        session.user = existingUser._id;
        await session.save();
        return true;
      }

      return false;

    } catch (err) {
      console.log(err);
      return false;
    }
  }

  static async register({ username, password }) {
    const existingUser = await db.User.model.findOne({ username });
    if (existingUser) {
      return { error: 'A user with that username already exists' };
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.User.model.create({
      username,
      password: hashedPassword,
    });

    return {
      username,
    };
  }

  static async login({ username, password }) {
    const user = await db.User.model.findOne({ username }).select('password city indoorData model');

    if (!user?.password) return { error: 'Invalid username/password' };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { error: 'Invalid username/password' };

    return {
      username,
    };
  }
}

export default AuthService;
