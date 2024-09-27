import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { signInWithEmailAndPassword } from '@firebase/auth';
import { doc, getDoc } from '@firebase/firestore';
import { auth, db } from "../firebaseconfig"; // Ensure firestore is imported

export default function App({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function UserLogin() {
    try {
      // Sign in the user
      await signInWithEmailAndPassword(auth, email, password);
      alert('ล็อคอินสำเร็จ');

      // Reference to the user's document in Firestore
      const userDocRef = doc(db, "users", auth.currentUser.uid);

      // Fetch the user's role
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists) {
        const userData = userDoc.data();
        const role = userData.role;

        // Navigate based on the user's role
        if (role === "admin") {
          navigation.reset({ index: 0, routes: [{ name: 'HomeAdmin' }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'HomeUser' }] });
        }
      } else {
        alert('User data not found');
      }
    } catch (error) {
      alert('ล็อคอินล้มเหลว', error.message);
      console.log(error);
    }
  }

  return (
    <View>
      <TextInput
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      <Button title="Login" onPress={UserLogin} />
      <Button
        title="Register"
        onPress={() => {
          navigation.navigate('Register');
        }}
      />
      <Button
        title="Reset Password"
        onPress={() => {
          navigation.navigate('Reset');
        }}
      />
    </View>
  );
}