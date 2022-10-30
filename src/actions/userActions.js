import { getUserFromSession } from '../api';
import { SET_USER } from './actionTypes';

export const setUserFromSession = () => async (dispatch) => {
  const user = await getUserFromSession();

  dispatch({
    type: SET_USER,
    payload: { user },
  })
};

export default {
  setUserFromSession,
};
