// Import necessary modules
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, TouchableOpacity, StatusBar, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { storeApiData } from '../../redux/cartSlice';
import { API_BASE_URL } from '@env';

const Profile = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const dispatch = useDispatch();


    const fetchUser = async () => {
        const storedname = await AsyncStorage.getItem('name');
        const storedemail = await AsyncStorage.getItem('email');
        const storedtoken = await AsyncStorage.getItem('token');
        setName(storedname);
        setEmail(storedemail);
        setToken(storedtoken);
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const handleUpdateProfile = async () => {
        if (!newName || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL + 'users/update'}`, {
                name,
                password,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });
            if (response.status === 200) {
                await AsyncStorage.setItem('name', newName);
                setName(newName);
                Alert.alert('Success', 'Profile updated successfully.');
                setIsUpdating(false);
            } else {
                Alert.alert('Error', 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again later.');
        }
    };

    const handleSignOut = async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('email');
            await AsyncStorage.removeItem('name');
            dispatch({ type: 'SET_TOKEN', payload: '' });
            dispatch({ type: 'SET_ORDER_COUNT', payload: 0 });
            dispatch(storeApiData([]));
            Alert.alert('Success', 'Signed out successfully.');
            navigation.navigate('User');
    };

    return (
        <ImageBackground
            source={require('../../assets/background.jpeg')}
            style={styles.backgroundImage}
        >
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>User Profile</Text>
                </View>
                {!isUpdating ? (
                    <View style={styles.profileContainer}>
                        <Text style={styles.label}>User Name:</Text>
                        <Text style={styles.value}>{name}</Text>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{email}</Text>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity onPress={() => setIsUpdating(true)} style={styles.backButton}>
                                <Text style={styles.backButtonText}>Update</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleSignOut}
                            >
                                <Text style={styles.backButtonText}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={styles.updateContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="New User Name"
                            value={newName}
                            onChangeText={setNewName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="New Password"
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.backButton} onPress={handleUpdateProfile}>
                                <Text style={styles.backButtonText}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.backButton} onPress={() => setIsUpdating(false)}>
                                <Text style={styles.backButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
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
        padding: 20,
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
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#007BFF',
    },
    profileContainer: {
        backgroundColor: '#F0F0F0',
        padding: 20,
        borderRadius: 10,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    value: {
        fontSize: 16,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    updateContainer: {
        backgroundColor: '#E0E0E0',
        padding: 20,
        borderRadius: 10,
    },
    input: {
        backgroundColor: '#FFF',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    backButton: {
        backgroundColor: '#805D45',
        padding: 12,
        margin: 5,
        alignSelf: 'center',
        width: '40%',
        borderRadius: 10
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
});

export default Profile;
