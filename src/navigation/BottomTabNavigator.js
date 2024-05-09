import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Category from '../screens/Category';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import StackNavigator from './StackNavigator';
import { useSelector } from 'react-redux';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: '#805D45',
        labelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Products"
        component={StackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ShoppingCart"
        component={ShoppingCartScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cart" color={color} size={size} />
          ),
          tabBarBadge: useSelector(state => state.cart.itemCount.toString()),
          tabBarBadgeStyle: {
            backgroundColor: '#805D45', 
            color: '#FFFFFF',
          },
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
