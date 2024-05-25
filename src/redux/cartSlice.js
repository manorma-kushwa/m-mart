import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    itemCount: 0,
  },
  reducers: {
    addProduct(state, action) {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === newItem.id);
      if (existingItemIndex !== -1) {
        state.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        state.items.push(newItem);
      }
      state.itemCount += newItem.quantity;
    },
    removeProduct(state, action) {
      const itemId = action.payload;
      const removedItem = state.items.find(item => item.id === itemId);
      if (removedItem) {
        state.itemCount -= removedItem.quantity;
        state.items = state.items.filter(item => item.id !== itemId);
      }
    },
    updateProductQuantity(state, action) {
      const { itemId, newQuantity } = action.payload;
      const itemToUpdate = state.items.find(item => item.id === itemId);
      if (itemToUpdate) {
        const itemDifference = newQuantity - itemToUpdate.quantity;
        state.itemCount += itemDifference;
        itemToUpdate.quantity = newQuantity;
      }
    },
    storeApiData(state, action) {
      const items = action.payload;
      state.items = items;
      state.itemCount = items.reduce((total, item) => total + item.quantity, 0);
    }
  }
});

export const { addProduct, removeProduct, updateProductQuantity,storeApiData } = cartSlice.actions;

export default cartSlice.reducer;