import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ImageBackground, StatusBar, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeProduct, updateProductQuantity } from '../redux/cartSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { storeApiData } from '../redux/cartSlice';

const ShoppingCartScreen = () => {
  const cartItems = useSelector(state => state.cart.items);
  const dispatch = useDispatch();

  const handleRemoveItem = (itemId) => {
    dispatch(removeProduct(itemId));
    updateCartInStorage(cartItems.filter(item => item.id !== itemId));
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      dispatch(removeProduct(itemId));
      updateCartInStorage(cartItems.filter(item => item.id !== itemId));
    } else {
      const updatedCartItems = cartItems.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      dispatch(updateProductQuantity({ itemId, newQuantity }));
      updateCartInStorage(updatedCartItems);
    }
  };

  const updateCartInStorage = async (updatedCartItems) => {
    try {
      await AsyncStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      AddCartServer(updatedCartItems);
    } catch (error) {
      console.error('Error updating cart in AsyncStorage:', error);
    }
  };

  const updateCart = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.post(`${API_BASE_URL + 'orders/neworder'}`, {
        items: cartItems
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Order is placed successfully.');
        await AsyncStorage.removeItem('cartItems');
        dispatch(storeApiData([]));
        AddCartServer([]);
      } else {
        Alert.alert('Error', 'Failed to order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      Alert.alert('Error', 'Failed to order. Please try again later.');
    }
  };


  const AddCartServer = async (product) => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.put(`${API_BASE_URL + 'cart'}`, {
        items: product
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        console.log('Success', 'Item updated to Cart successfully.');
      } else {
        console.log('Error', 'Failed to update');
      }
    } catch (error) {
      console.log(error);
    }
    try {
      const response = await axios.get(`${API_BASE_URL + 'orders/all'}`, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      const data = await response.data;
      const parsedOrders = data.orders.map(order => ({
          ...order,
          order_items: JSON.parse(order.order_items)
      }));
      const newOrders = parsedOrders.filter(order => order.is_paid === 0 && order.is_delivered === 0);
      dispatch({ type: 'SET_ORDER_COUNT', payload: newOrders.length });
  } catch (error) {
      console.error('Error fetching order', error);
  }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productDetails}>
        <Text style={styles.productTitle}>{item.title}</Text>
        <Text style={styles.productPrice}>Price: ${item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => handleQuantityChange(item.id, Math.max(0, item.quantity - 1))}>
            <Text style={styles.quantityButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => handleQuantityChange(item.id, item.quantity + 1)}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => handleRemoveItem(item.id)} style={styles.removeButton}>
          <Text style={styles.removeButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // console.log(cartItems);
  return (
    <ImageBackground
      source={require('../assets/background.jpeg')}
      style={styles.backgroundImage}
    >
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Shopping Cart</Text>
        </View>
        {cartItems.length > 0 ? (
          <>
            <View style={styles.totalInfoContainer}>
              <Text style={styles.totalText}>Total Items: {totalItemsCount}</Text>
              <Text style={styles.totalText}>Total Cost: ${totalPrice.toFixed(2)}</Text>
            </View>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCartItem}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        )}
        {cartItems.length > 0 && (
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>Total: ${totalPrice.toFixed(2)}</Text>
            <TouchableOpacity onPress={() => updateCart()}>
              <Text style={styles.proceedButton}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    paddingTop: StatusBar.currentHeight,
  },
  container: {
    flex: 1,
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(62,50,58)',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7e9d0',
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#805D45'
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: 'rgb(62,50,58)',
  },
  productPrice: {
    fontSize: 14,
    color: '#rgb(62,50,58)',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF', // White border
    marginRight: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  quantityButton: {
    fontSize: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#805D45',
    color: '#FFFFFF',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
    marginHorizontal: 10,
    color: 'rgb(62,50,58)',
  },
  removeButton: {
    marginTop: 5,
    width: '40%',
    backgroundColor: '#805D45',
    borderRadius: 50
  },
  removeButtonText: {
    padding: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'rgb(62,50,58)',
    textAlign: 'center',
  },
  totalInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f7e9d0',
    marginBottom: 20,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalContainer:{
      flexDirection: 'column',
      alignItems: 'center',
      padding:7,
      backgroundColor: '#f7e9d0',
  },
  proceedButton: {
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: '#805D45',
    color: '#FFFFFF',
    borderRadius: 10,
    margin:7
  },
});

export default ShoppingCartScreen;
