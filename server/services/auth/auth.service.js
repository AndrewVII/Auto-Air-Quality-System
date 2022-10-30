import bcrypt from 'bcrypt';
import db from '../../db/models';

class AuthService {
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
      password: hashedPassword,
    };
  }

  static async login({ username, password }) {
    const user = await db.User.model.findOne({ username }).select('+password');

    if (!user?.password) return { error: 'Invalid username/password' };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { error: 'Invalid username/password' };

    return {
      username,
    };
  }
}

export default AuthService;
