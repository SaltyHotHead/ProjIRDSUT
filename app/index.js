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
import Training from '../screens/users/Training';
import Profile from '../screens/users/Profile';
import Navbar from '../components/Navbar';
import NavbarAdmin from '../components/NavbarAdmin';
import UploadBanner from '../screens/admin/UploadBanner';
import Course from '../screens/admin/Course';
import BannerData from '../screens/admin/BannerData';
import NewCourse from '../screens/admin/NewCourse';
import DashboardPage from '../screens/admin/DashboardPage';
import CourseDetail from '../screens/admin/CourseDetail';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator>
        <Stack.Screen 
          name="HomeUser" 
          component={HomeUser} 
          options={{ header: () => <Navbar /> }} 
        />
        <Stack.Screen 
          name="HomeAdmin" 
          component={HomeAdmin} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="Reset" component={Reset} options={{ headerShown: false }} />
        <Stack.Screen 
          name="UserData" 
          component={UserData} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen 
          name="UploadBanner" 
          component={UploadBanner} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen 
          name="Course" 
          component={Course} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen 
          name="BannerData" 
          component={BannerData} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen 
          name="NewCourse" 
          component={NewCourse} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen 
          name="DashboardPage" 
          component={DashboardPage} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen 
          name="TrainingUser" 
          component={TrainingUser} 
          options={{ header: () => <Navbar /> }} 
        />
        <Stack.Screen 
          name="Training" 
          component={Training} 
          options={{ header: () => <Navbar /> }} 
        />
        <Stack.Screen 
          name="CourseDetail" 
          component={CourseDetail} 
          options={{ header: () => <NavbarAdmin /> }} 
        />
        <Stack.Screen 
          name="MyTrainingUser" 
          component={MyTrainingUser} 
          options={{ header: () => <Navbar /> }} 
        />
        <Stack.Screen 
          name="Profile" 
          component={Profile} 
          options={{ header: () => <Navbar /> }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}