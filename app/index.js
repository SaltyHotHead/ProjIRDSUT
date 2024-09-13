import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Reset from '../screens/Reset';
import HomeAdmin from '../screens/admin/HomeAdmin';
import HomeUser from '../screens/users/HomeUser';
import UserData from '../screens/admin/UserData';
import MyTrainingUser from '../screens/users/MyTrainingUser';
import TrainingUser from '../screens/users/TrainingUser';
import Profile from '../screens/users/Profile';
import Navbar from '../components/Navbar'; // ปรับเส้นทางให้ถูกต้องตามตำแหน่งไฟล์ Navbar
import UploadBanner from '../screens/admin/UploadBanner';
import Course from '../screens/admin/Course';
import BannerData from '../screens/admin/BannerData';
import NewCourse from '../screens/admin/NewCourse';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      {/* นำ Navbar มาวางไว้ก่อน Stack.Navigator */}
      <Navbar />
      <Stack.Navigator>
      <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="HomeUser" component={HomeUser} options={{ headerShown: false }} />
        <Stack.Screen name="HomeAdmin" component={HomeAdmin} />
        
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Reset" component={Reset} />
        <Stack.Screen name="UserData" component={UserData} />
        <Stack.Screen name="UploadBanner" component={UploadBanner} />
        <Stack.Screen name="Course" component={Course} />
        <Stack.Screen name="BannerData" component={BannerData} />
        <Stack.Screen name="NewCourse" component={NewCourse} />
        <Stack.Screen name="TrainingUser" component={TrainingUser} options={{ headerShown: false }} />
        <Stack.Screen name="MyTrainingUser" component={MyTrainingUser} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
