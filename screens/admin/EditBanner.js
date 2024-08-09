import React, { useEffect } from 'react';
import { View, SafeAreaView, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { initializeApp } from '@firebase/app';
import { storage } from '@firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyBhHaFudvmY2WZgM46vqPwuYsC0e-sEX2o",
    authDomain: "project-ird-sut.firebaseapp.com",
    projectId: "project-ird-sut",
    storageBucket: "project-ird-sut.appspot.com",
    messagingSenderId: "645453459112",
    appId: "1:645453459112:web:9cc81b4776eb578819dc9d"
  };

  const app = initializeApp(firebaseConfig);   

export default function App() {

    async function askPer() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('ยังไม่ได้รับการอนุญาตจากผู้ใช้');
        }
    }

  useEffect(() => {
    askPer();
  }, []);

  async function getImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync();

      if (!result.canceled) {
        let response = await fetch(result.uri);
        let blob = await response.blob();

        const storageRef = storage().ref('test.jpg');

        storageRef.put(blob).then(() => {
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
        <Button title="เพิ่มรูปภาพ" onPress={() => getImage()} />
      </SafeAreaView>
    </View>
  );
}
