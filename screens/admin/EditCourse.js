import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Image, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { db, storage } from "../../firebaseconfig";
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import DatePicker from 'react-native-date-picker';

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

export default function EditCourse({ route }) {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseStartDate, setCourseStartDate] = useState(new Date());
  const [courseEndDate, setCourseEndDate] = useState(new Date());
  const [courseType, setCourseType] = useState([
    { label: 'Online', value: 'online' },
    { label: 'Onsite', value: 'onsite' },
    { label: 'Online & Onsite', value: 'online&onsite' }
  ]);
  const [courseDesc, setCourseDesc] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [coursePrice, setCoursePrice] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState(''); // Default fee type

  const fetchCourse = async () => {
    try {
      const courseDocRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseDocRef);

      if (courseDoc.exists()) {
        const data = courseDoc.data();
        setCourse(data);
        setCourseName(data.name);
        setCourseStartDate(data.startdate.toDate());
        setCourseEndDate(data.enddate.toDate());
        setValue(data.type);
        setSelectedFeeType(data.feetype);
        setCoursePrice(data.price);
        setCourseDesc(data.description);
        setSelectedImage(data.imageUrl);
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const pickImage = async () => {
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
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const updateCourse = async () => {
    try {
      // Clear the price if the fee type is "free"
      let updatedPrice = coursePrice;
      if (selectedFeeType === 'free') {
        updatedPrice = '';
      }

      let imageUrl = selectedImage;
      if (imageBlob) {
        const storageRef = ref(storage, `courses/${courseId}.jpg`);
        await uploadBytes(storageRef, imageBlob);
        imageUrl = await getDownloadURL(storageRef);
      }

      const courseDocRef = doc(db, "courses", courseId);
      await updateDoc(courseDocRef, {
        name: courseName,
        startdate: courseStartDate,
        enddate: courseEndDate,
        type: value,
        feetype: selectedFeeType,
        price: updatedPrice,
        description: courseDesc,
        imageUrl: imageUrl,
      });

      alert('Course updated successfully!');
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    fetchCourse(); // Refetch data to reset the form
  };

  const RadioButton = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onSelect(value)}>
      <View style={styles.radioButton}>
        {selectedValue === value && <View style={styles.radioButtonSelected} />}
      </View>
      <Text style={styles.radioButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <Button title="แก้ไข" onPress={() => setModalVisible(true)} />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imagePreview} />}
            <TextInput
              placeholder="Course Name"
              value={courseName}
              onChangeText={setCourseName}
              style={styles.textInput}
            />
            <Text>วันที่เริ่มการอบรม:</Text>
              <CrossPlatformDatePicker date={courseStartDate} onDateChange={setCourseStartDate} />
            <Text>วันที่สิ้นสุดการอบรม:</Text>
              <CrossPlatformDatePicker date={courseEndDate} onDateChange={setCourseEndDate} />
            <Text>Type:</Text>
            <DropDownPicker
              open={open}
              value={value}
              items={courseType}
              setOpen={setOpen}
              setValue={setValue}
              setItems={setCourseType}
              style={styles.dropdown}
              containerStyle={{ width: '100%' }}
              placeholder="Select course type"
            />
            <Text>ค่าธรรมเนียม:</Text>
              <View style={styles.radioGroup}>
                <RadioButton
                  label="Free"
                  value="free"
                  selectedValue={selectedFeeType}
                  onSelect={setSelectedFeeType}
                />
                <RadioButton
                  label="Paid"
                  value="paid"
                  selectedValue={selectedFeeType}
                  onSelect={setSelectedFeeType}
                />
              </View>
              {selectedFeeType === 'paid' && (
                <>
                  <Text>ราคา:</Text>
                  <TextInput 
                    placeholder="กรอกราคาการอบรม" 
                    value={coursePrice} 
                    onChangeText={setCoursePrice} 
                    style={styles.textInput}
                    editable={true} // Always editable when visible
                  />
                </>
              )}
            <TextInput
              placeholder="Course Description"
              value={courseDesc}
              onChangeText={setCourseDesc}
              style={styles.textInput}
            />
            <Button title="Pick Image" onPress={pickImage} />
            <Button title="Update Course" onPress={updateCourse} />
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>ปิด</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  radioButtonSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: 'blue',
  },
  radioButtonLabel: {
    marginRight: 15,
  },
});