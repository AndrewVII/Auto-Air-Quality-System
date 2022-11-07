import { SET_USER, UPDATE_AIR_DATA } from '../actions/actionTypes';

const initalState = {
  loaded: false,
  user: {},
};

export default (state = initalState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        loaded: true,
        user: {
          ...state.user,
          ...action.payload.user,
        },
      };
    case UPDATE_AIR_DATA:
      return {
        ...state,
        loaded: true,
        user: {
          ...state.user,
          indoorData: action.payload.indoorData,
        },
      };
    default:
      return state;
  }
};
