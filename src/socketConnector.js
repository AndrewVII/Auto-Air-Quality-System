import socket from './socket';
import { store } from './store';
import { updateAirData } from './actions/userActions';

const listeners = [
  {
    name: 'air-data-update',
    cb: (payload) => {
      console.log(payload);
      store.dispatch(updateAirData(payload));
    },
  },
];

export default function connectSocket() {
  socket(listeners);
}
