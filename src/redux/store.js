import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';

const initialState = {
  token: '',
  count: 0,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    default:
      return state;
  }
};

const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_ORDER_COUNT':
      return { ...state, count: action.payload };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    order: orderReducer,
  },
});

export default store;
