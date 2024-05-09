import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../../SplashScreen';
import CategoryScreen from '../screens/Category';
import ProductListScreen from '../screens/ProductList';
import ProductDetailScreen from '../screens/ProductDetail';

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="CategoryScreen" component={CategoryScreen} />
      <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
      <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
