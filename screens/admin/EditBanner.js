import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, Button, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from '@firebase/app';
import { getStorage, ref, uploadBytes } from '@firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBhHaFudvmY2WZgM46vqPwuYsC0e-sEX2o",
  authDomain: "project-ird-sut.firebaseapp.com",
  projectId: "project-ird-sut",
  storageBucket: "project-ird-sut.appspot.com",
  messagingSenderId: "645453459112",
  appId: "1:645453459112:web:9cc81b4776eb578819dc9d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default function App() {
  const [imageName, setImageName] = useState('');

  // Request permission to access the media library
  async function askPer() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('ยังไม่ได้รับการอนุญาตจากผู้ใช้');
    }
  }

  useEffect(() => {
    askPer();
  }, []);

  // Function to handle image picking and upload
  async function getImage() {
    try {
      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        if (imageName.trim() === '') {
          Alert.alert('Error', 'Please enter a file name.');
          return;
        }

        // Fetch the selected image as a blob
        let response = await fetch(result.assets[0].uri);
        let blob = await response.blob();

        // Initialize Firebase Storage and create a reference
        const storage = getStorage(app);
        const storageRef = ref(storage, `Banners/${imageName}.jpg`); // Using the user-provided file name

        // Upload the blob to Firebase Storage
        uploadBytes(storageRef, blob).then(() => {
          alert('Upload success');
        }).catch((error) => {
          console.error('Upload failed:', error);
          alert('Upload failed: ' + error.message);
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.message);
    }
  }

  return (
    <View>
      <SafeAreaView>
        <TextInput 
          placeholder="Enter image name" 
          value={imageName} 
          onChangeText={setImageName} 
          style={{ padding: 10, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
        />
        <Button title="Upload Image" onPress={() => getImage()} />
      </SafeAreaView>
    </View>
  );
}
