import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Reset from '../screens/Reset';
import HomeAdmin from '../screens/admin/HomeAdmin';
import HomeUser from '../screens/users/HomeUser';
import Users from '../screens/admin/Users';
import EditBanner from '../screens/admin/EditBanner'
import Training from '../screens/admin/Training'


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Reset" component={Reset} />
        <Stack.Screen name="HomeAdmin" component={HomeAdmin} />
        <Stack.Screen name="HomeUser" component={HomeUser} />
        <Stack.Screen name="Users" component={Users} />
        <Stack.Screen name="EditBanner" component={EditBanner} />
        <Stack.Screen name="Training" component={Training} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}