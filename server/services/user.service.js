import db from '../db/models';
import { sendDataToUser } from '../socket.helper';

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
  }

  static async UpdateAirData(model, value) {
    if (!model) {
      return { error: 'Need model' };
    }

    const user = await db.User.model.findOne({ model });
    const currentTime = new Date();

    user.indoorData = [...user.indoorData, {
      value,
      recordedAt: currentTime,
    }];

    await user.save();

    sendDataToUser(user);

    return { user };
  }
}

export default UserService;
