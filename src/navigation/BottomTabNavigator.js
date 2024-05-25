import React, { useEffect, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import StackNavigator from './StackNavigator';
import ShoppingCartScreen from '../screens/ShoppingCartScreen';
import Profile from '../screens/Auth/Profile';
import SignIn from '../screens/Auth/SignIn';
import Order from '../screens/Order';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect ,useNavigation, TabActions} from '@react-navigation/native';
import { Alert } from 'react-native';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const token = useSelector(state => state.auth.token);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const fetchUser = useCallback(async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token'); 
      if (storedToken) {
        dispatch({ type: 'SET_TOKEN', payload: storedToken });
      } else {
        dispatch({ type: 'SET_TOKEN', payload: '' });
      }
    } catch (error) {
      console.error('Failed to fetch token:', error);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser])
  );

  const handleTabPress = ({ route }) => {
    if (!token && ['Products', 'My Carts', 'My Orders'].includes(route.name)) {
      Alert.alert(
        'Please Sign In',
        'You need to sign in to access this page.',
        [{ text: 'Sign In', onPress: () => navigation.dispatch(TabActions.jumpTo('User')) }]
      );
      return false;
    }
    return true;
  };
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#805D45',
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: 'bold',
        },
        tabBarStyle: {
          display: 'flex',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Products') {
            iconName = 'home';
          } else if (route.name === 'My Carts') {
            iconName = 'cart';
          } else if (route.name === 'My Orders') {
            iconName = 'store';
          } else if (route.name === 'User') {
            iconName = 'account';
          }
          return <MaterialCommunityIcons name={iconName} color={color} size={size} />;
        },
      })}
      screenListeners={({ route }) => ({
        tabPress: e => {
          e.preventDefault(); 
          if (handleTabPress({ route })) {
            navigation.navigate(route.name);
          }
        },
      })}
    >
      <Tab.Screen
        name="Products"
        component={StackNavigator} // Use StackNavigator here
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="My Carts"
        component={ShoppingCartScreen}
        options={({ navigation }) => ({
          tabBarBadge: useSelector(state => state.cart.itemCount.toString()),
          tabBarBadgeStyle: {
            backgroundColor: '#805D45',
            color: '#FFFFFF',
          },
          headerShown: false,
        })}
      />
      <Tab.Screen
        name="My Orders"
        component={Order}
        options={({ navigation }) => ({
          tabBarBadge: useSelector(state => state.order.count),
          tabBarBadgeStyle: {
            backgroundColor: '#805D45',
            color: '#FFFFFF',
          },
          headerShown: false,
        })}
      />
      <Tab.Screen
        name="User"
        component={token ? Profile : SignIn}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
