import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Button, TextInput, Modal, StyleSheet, TouchableOpacity, Text, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import DatePicker from 'react-native-date-picker'; // Import for mobile
import { initializeApp } from '@firebase/app';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { getFirestore, collection, addDoc, doc } from '@firebase/firestore';


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
const auth = getAuth(app);
const db = getFirestore(app);

const CrossPlatformDatePicker = ({ date, onDateChange }) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={date.toISOString().substring(0, 10)}
        onChange={(e) => onDateChange(new Date(e.target.value))}
        style={styles.webDatePicker}
      />
    );
  } else {
    return (
      <DatePicker
        date={date}
        onDateChange={onDateChange}
        mode="date"
      />
    );
  }
};

// Function to generate a random string
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Function to generate a unique image name
const generateUniqueImageName = async (storage) => {
  let imageName;
  let exists = true;

  while (exists) {
    imageName = generateRandomString();
    const storageRef = ref(storage, `Banners/${imageName}.jpg`);

    try {
      await getDownloadURL(storageRef);
      // If no error, the file exists, so generate a new name
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        exists = false; // File does not exist, so we can use this name
      } else {
        throw error; // Handle other errors
      }
    }
  }

  return imageName;
};

export default function NewCourse() {
  const [imageName, setImageName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseDate, setCourseDate] = useState(new Date());
  const [courseType, setCourseType] = useState([
    { label: 'Online', value: 'online' },
    { label: 'Onsite', value: 'onsite' }
  ]);
  const [courseDesc, setCourseDesc] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(''); // Set initial value
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to handle image picking
  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);

        let response = await fetch(result.assets[0].uri);
        let blob = await response.blob();
        setImageBlob(blob);

        const storage = getStorage(app);
        const uniqueImageName = await generateUniqueImageName(storage);
        setImageName(uniqueImageName); // Set the unique image name
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert(error.message);
    }
  }

  async function newCourse() {
    if (!isAuthenticated) {
      alert('You must be logged in to upload a course.');
      return;
    }
  
    const user = auth.currentUser;
    if (!user) {
      alert('User not authenticated.');
      return;
    }
  
    try {
      if (imageBlob && imageName.trim() !== '') {
        const storage = getStorage(app);
        const storageRef = ref(storage, `courses/${imageName}.jpg`);
  
        try {
          await uploadBytes(storageRef, imageBlob);
          const imageUrl = await getDownloadURL(storageRef);
  
          // Use the user's UID in the document path
          const userDocRef = doc(db, 'users', user.uid);
          const coursesCollectionRef = collection(userDocRef, 'courses');
  
          // Store course data in Firestore under the user's document
          await addDoc(coursesCollectionRef, {
            name: courseName,
            date: courseDate,
            type: value,
            description: courseDesc,
            imageUrl: imageUrl,
          });
  
          alert('Course created successfully!');
          setModalVisible(false);
          setSelectedImage(null);
          setImageBlob(null);
          setCourseName('');
          setCourseDate(new Date());
          setValue('');
          setCourseDesc('');
        } catch (error) {
          console.error('Error uploading image or saving data:', error);
          alert('Error: ' + error.message);
        }
      } else {
        alert('Please select an image and enter a file name.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.message);
    }
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Button title="เพิ่มการอบรม" onPress={() => setModalVisible(true)} />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              {selectedImage && (
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.imagePreview}
                />
              )}
              <TextInput 
                placeholder="กรอกชื่อการอบรม" 
                value={courseName} 
                onChangeText={setCourseName} 
                style={styles.textInput}
              />
              <Text>วันที่จัดการอบรม:</Text>
              <CrossPlatformDatePicker date={courseDate} onDateChange={setCourseDate} />
              <Text>เลือกประเภทการอบรม:</Text>
              <DropDownPicker
                open={open}
                value={value}
                items={courseType}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setCourseType}
                style={styles.dropdown}
                containerStyle={{ width: '100%' }}
                placeholder="เลือกประเภทการอบรม"
                zIndex={1000} // Ensure dropdown is above other elements
              />
              <Text>รายละเอียดหัวข้อการอบรม:</Text>
              <TextInput 
                placeholder="กรอกรายละเอียดการอบรม" 
                value={courseDesc} 
                onChangeText={setCourseDesc} 
                style={styles.textInput}
              />
              <Button title="เลือกรูปภาพ" onPress={() => pickImage()} />
              <Button title="บันทึกข้อมูล" onPress={() => newCourse()} />
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setSelectedImage(null);
                setCourseName('');
                setCourseDate(new Date());
                setValue(''); // Reset value
                setCourseDesc('');
              }}>
                <Text style={styles.closeButton}>ปิด</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 800,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  imagePreview: {
    width: 600,
    height: 400,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  dropdown: {
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 10,
    color: 'blue',
  },
  webDatePicker: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
});