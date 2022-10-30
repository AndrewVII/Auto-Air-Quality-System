import db from '../db/models';

class UserService {
  static async updateProfile(userId, data) {
    if (!userId) {
      return { error: 'Must be logged in' };
    }

    const { city, model } = data;

    const user = await db.User.model.findById(userId);

    user.city = city;
    user.model = model;

    await user.save();

    return { user };
  };
}

export default UserService;
