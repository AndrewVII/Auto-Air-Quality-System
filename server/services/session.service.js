import db from '../db/models';
import { updateAQHIInfoOfUser } from './user.service';

class SessionService {
  static async getUserFromSession(sessionId) {
    if (!sessionId) {
      throw new Error('No sessionId provided');
    }
    const session = await db.Session.model.findById(sessionId).populate('user');
    if (!session) {
      return null;
    }
    if (session && session.user) {
      await db.User.model.updateOne({ _id: session.user._id }, { lastOnline: Date.now() });
      const user = await db.User.model.findById(session.user._id);
      await updateAQHIInfoOfUser(user);
      return session.user;
    }
    return null;
  }
}

export default SessionService;
