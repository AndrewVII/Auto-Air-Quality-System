import db from '../db/models';
import { sendDataToUser } from '../socket.helper';
import { addLeadingZeroes } from '../../src/helpers';
import { getAQHIFromGovernment } from '../../src/api';

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

    const curDate = new Date();

    if (user.outdoorDataLastRecorded) {
      const dateDifference = (curDate - user.outdoorDataLastRecorded) / (1000 * 60);
      if (dateDifference > 20) {
        user.outdoorData = await getAQHIInfo(user.city);
        user.outdoorDataLastRecorded = currentTime;
      }
    } else {
      user.outdoorData = await getAQHIInfo(user.city);
      user.outdoorDataLastRecorded = currentTime;
    }

    await user.save();

    sendDataToUser(user);

    return { user };
  }
}

const getAQHIInfo = async (city) => {
  console.log('reached');
  if (!city) {
    return null;
  }
  const data = await getAQHIFromGovernment(city);
  const { features } = data;
  if (!features.length) {
    return null;
  }
  features.sort((a, b) => (Date.parse(a.properties.observation_datetime) - Date.parse(b.properties.observation_datetime)));

  const graphData = features.filter(feature => {
    const date = new Date(feature.properties.observation_datetime);
    const today = new Date();
    return today.toDateString() === date.toDateString();
  }).map(feature => {
    const date = new Date(feature.properties.observation_datetime);
    const timeFormatted = `${addLeadingZeroes(date.getHours(), 2)}:${addLeadingZeroes(date.getMinutes(), 2)}`;
    return {
      time: timeFormatted,
      AQHI: feature.properties.aqhi,
    };
  });

  return graphData;
};

export default UserService;
