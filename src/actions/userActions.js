import { getUserFromSession, updateUserPreferences } from '../api';
import { SET_USER } from './actionTypes';

export const setUserFromSession = () => async (dispatch) => {
  const user = await getUserFromSession();

  dispatch({
    type: SET_USER,
    payload: { user },
  });
};

export const updatePreferences = (data) => async (dispatch) => {
  const res = await updateUserPreferences(data);
  dispatch({
    type: SET_USER,
    payload: { user: res.user },
  });
};

export default {
  setUserFromSession,
};
