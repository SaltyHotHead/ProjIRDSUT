import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, Button, TextInput, StyleSheet, TouchableOpacity, Text, Image, Platform, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import { serverTimestamp } from '@firebase/firestore';
import { onAuthStateChanged } from '@firebase/auth';
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import { collection, addDoc, updateDoc } from '@firebase/firestore';
import { auth, db, storage } from "../../firebaseconfig";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import DateRangeSelector from '../../components/DateRangeSelector';
import TextEditor from '../../components/Editor';

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
    } catch (error) {
      if (error.code === 'storage/object-not-found') {
        exists = false;
      } else {
        throw error;
      }
    }
  }

  return imageName;
};

// RadioButton Component
const RadioButton = ({ label, value, selectedValue, onSelect }) => (
  <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onSelect(value)}>
    <View style={styles.radioButton}>
      {selectedValue === value && <View style={styles.radioButtonSelected} />}
    </View>
    <Text style={styles.radioButtonLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function NewCourse({ navigation }) {
  const [imageName, setImageName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBlob, setImageBlob] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseStartDate, setCourseStartDate] = useState('');
  const [courseEndDate, setCourseEndDate] = useState('');
  const [courseType, setCourseType] = useState([
    { label: 'Online', value: 'online' },
    { label: 'Onsite', value: 'onsite' },
    { label: 'Online และ Onsite', value: 'online&onsite' }
  ]);
  const [coursePrice, setCoursePrice] = useState('ฟรี');
  const [courseInvitation, setCourseInvitation] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState('free'); // Default fee type
  const [courseFaq, setcourseFaq] = useState([
    { title: '', content: '' },
  ]);
  const [isCertVisible, setIsCertVisible] = useState(false);

  // Function to handle editor content change
  const handleEditorChange = (content) => {
    setCourseDesc(content);
  };


  const handlePriceChange = (text) => {
    // Remove any non-numeric characters except for a single decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    setCoursePrice(numericText);
  };

  const handleDatesChange = ({ startDate, endDate }) => {
    setCourseStartDate(startDate);
    setCourseEndDate(endDate);
  };

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
      setIsAuthenticated(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleFaqTitleChange = (index, newTitle) => {
    const updatedFaq = [...courseFaq];
    updatedFaq[index].title = newTitle;
    setcourseFaq(updatedFaq);
  };

  const handleFaqContentChange = (index, newContent) => {
    const updatedFaq = [...courseFaq];
    updatedFaq[index].content = newContent;
    setcourseFaq(updatedFaq);
  };

  const handleAddFaq = () => {
    const newFaq = { title: '', content: '' };
    setcourseFaq([...courseFaq, newFaq]);
  };

  const handleRemoveFaq = (index) => {
    const updatedFaq = [...courseFaq];
    updatedFaq.splice(index, 1);
    setcourseFaq(updatedFaq);
  };

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

        const uniqueImageName = await generateUniqueImageName(storage);
        setImageName(uniqueImageName);
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

    if (!courseName || !courseStartDate || !courseEndDate || !value || !selectedFeeType || !courseInvitation) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      if (imageBlob) {
        const coursesCollectionRef = collection(db, 'courses');

        const docRef = await addDoc(coursesCollectionRef, {
          name: courseName,
          startdate: courseStartDate,
          enddate: courseEndDate,
          type: value,
          price: coursePrice,
          invitation: courseInvitation,
          description: courseDesc,
          feetype: selectedFeeType,
          imageUrl: '',
          Faq: courseFaq,
          isCertVisible: isCertVisible,
          createdDate: serverTimestamp(), // Add created date
        });

        const documentId = docRef.id;

        const storageRef = ref(storage, `courses/${documentId}.jpg`);

        try {
          await uploadBytes(storageRef, imageBlob);
          const imageUrl = await getDownloadURL(storageRef);

          await updateDoc(docRef, {
            imageUrl: imageUrl,
          });

          alert('Course created successfully!');
          navigation.reset({ index: 0, routes: [{ name: 'Course' }] });
        } catch (error) {
          console.error('Error uploading image or saving data:', error.code, error.message);
          alert('Error: ' + error.message);
        }
      } else {
        alert('Please select an image.');
      }
    } catch (error) {
      console.error('Error creating course:', error.code, error.message);
      alert(error.message);
    }
  }

  return (
    <SafeAreaView>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <View style={styles.container}>

        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          style={Platform.OS === 'web' ? styles.webScrollView : {}}
        >

          <Text>เพิ่มการอบรม</Text>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.imagePreview}
            />
          )}
          <Text>ชื่อการอบรม:</Text>
          <TextInput
            placeholder="กรอกชื่อการอบรม"
            value={courseName}
            onChangeText={setCourseName}
            style={styles.textInput}
          />
          <Text>วันที่เริ่มและสิ้นสุดการอบรม:</Text>
          <DateRangeSelector
            initialStartDate={courseStartDate}
            initialEndDate={courseEndDate}
            onDatesChange={handleDatesChange}
          />
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
            zIndex={1000}
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
                onChangeText={handlePriceChange}
                style={styles.textInput}
                keyboardType="numeric" // Brings up a numeric keypad
                inputMode="numeric" // Restricts input to numbers
                editable={true}
              />
            </>
          )}
          <Text>คำเชิญชวน:</Text>
          <TextInput
            placeholder="กรอกคำเชิญชวนเข้าร่วมการอบรม"
            value={courseInvitation}
            onChangeText={setCourseInvitation}
            style={styles.textInput}
          />
          <Text>รายละเอียดหัวข้อการอบรม:</Text>
          <TextEditor onChange={handleEditorChange} />
          <Text>คำถามที่พบบ่อย:</Text>
      {courseFaq.map((faq, index) => (
        <View key={index} style={styles.faqItem}>
          <TextInput
            style={styles.faqTitleInput}
            value={faq.title}
            onChangeText={(newTitle) => handleFaqTitleChange(index, newTitle)}
            placeholder="Enter FAQ Title"
          />
          <TextInput
            style={styles.faqTitleInput}
            value={faq.content}
            onChangeText={(newContent) => handleFaqContentChange(index, newContent)}
            placeholder="Enter FAQ Content"
          />
          <TouchableOpacity onPress={() => handleRemoveFaq(index)}>
            <Text style={styles.removeFaqButton}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}
      <Button title="Add FAQ" onPress={handleAddFaq} />

          <Button title="เลือกรูปภาพ" onPress={() => pickImage()} />
          <Button title="บันทึกข้อมูล" onPress={() => newCourse()} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
  },
  webScrollView: {
    height: '80vh', // Ensure it takes full height on web
    overflow: 'auto', // Enable scrolling
  },
  container: {
    flex: 1,
    justifyContent: 'center',
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
  datePickerText: {
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  faqItem: {
    marginBottom: 10,
  },
  faqTitleInput: {
    fontSize: 16,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  removeFaqButton: {
    color: 'red',
    marginTop: 5,
  },
});