import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, Button, TextInput, Modal, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { storage, db } from "../../firebaseconfig";

export default function uploadBanner({ onUploadSuccess }) { // Accept the prop
  const [imageName, setImageName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);

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

  // Function to handle image picking
  async function pickImage() {
    try {
      // Open the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri); // Set the image URI for preview

        // Fetch the selected image as a blob
        let response = await fetch(result.assets[0].uri);
        let blob = await response.blob();
        setImageBlob(blob); // Store the blob for later upload
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert(error.message);
    }
  }

  // Function to handle image upload
  async function uploadImage() {
    try {
      if (imageBlob && imageName.trim() !== '') {
        const storageRef = ref(storage, `Banners/${imageName}.jpg`);

        // Check if file with the same name already exists
        try {
          await getDownloadURL(storageRef);
          // If the file exists, alert the user
          alert('มีไฟล์ที่ชื่อเดียวกันอยู่แล้ว โปรดเปลี่ยนชื่อไฟล์ที่จะอัปโหลด');
        } catch (error) {
          // If the file does not exist, proceed with the upload
          if (error.code === 'storage/object-not-found') {
            await uploadBytes(storageRef, imageBlob);
            alert('อัปโหลดสำเร็จ');

            // Get the download URL of the uploaded image
            const imageUrl = await getDownloadURL(storageRef);

            // Save the banner data to Firestore
            const bannerDocRef = doc(db, 'banners', imageName); // Create a document reference

            // Create the banner data object
            const bannerData = {
              name: imageName,
              url: imageUrl,
              timeCreated: new Date().toISOString(), // Store the creation time
            };

            // Save the banner data to Firestore
            await setDoc(bannerDocRef, bannerData);
            console.log("Banner data saved to Firestore successfully.");

            // Load the current banner order
            const orderDocRef = doc(db, 'bannerOrders', 'order');
            const orderDoc = await getDoc(orderDocRef);

            let updatedOrder = [];

            if (orderDoc.exists()) {
              // If the order exists, get the current order
              const savedOrder = orderDoc.data().order || [];
              updatedOrder = [bannerData, ...savedOrder]; // Add new banner at index 0
            } else {
              // If no order exists, initialize with the new banner
              updatedOrder = [bannerData];
            }

            // Save the updated order back to Firestore
            await setDoc(orderDocRef, { order: updatedOrder });
            console.log("Banner order updated successfully.");

            // Call the refresh function passed from BannerData
            onUploadSuccess(); // Call the refresh function

            // Close the modal and reset state
            setModalVisible(false);
            setSelectedImage(null);
            setImageBlob(null);
            setImageName(''); // Clear the input field
          } else {
            console.error('Error checking file existence:', error);
            alert('ไม่พบไฟล์รูปภาพ' + error.message);
          }
        }
      } else {
        alert('กรุณาเลือกรูปภาพแบนเนอร์และกรอกชื่อของแบนเนอร์');
      }
    } catch (error) {
      console.error('พบข้อผิดพลาดในการอัพโหลด, ', error);
      alert(error.message);
    }
  }

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <Button title="เพิ่มแบนเนอร์" onPress={() => setModalVisible(true)} color="#F89E6C" />

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
                placeholder="กรอกชื่อรูปภาพ"
                value={imageName}
                onChangeText={setImageName}
                style={styles.textInput}
              />
              <Button title="เลือกรูปภาพ" onPress={() => pickImage()} />
              <Button title="อัปโหลดรูปภาพ" onPress={() => uploadImage()} /> {/* Submit button to upload image */}
              <TouchableOpacity onPress={() => {
                setModalVisible(false);
                setSelectedImage(null);
                setImageName('');
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
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
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
  closeButton: {
    marginTop: 10,
    color: 'blue',
  },
});