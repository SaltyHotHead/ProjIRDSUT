import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Image, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { doc, getDoc, updateDoc } from '@firebase/firestore';
import { db, storage } from "../../firebaseconfig";
import { ref, uploadBytes, getDownloadURL } from '@firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import DateRangeSelector from '../../components/DateRangeSelector';
import TextEditor from '../../components/Editor';

export default function EditCourse({ route, navigation }) {
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
  const [courseInvitation, setCourseInvitation] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState(''); // Default fee type
  const [courseFaq, setCoursefaq] = useState([]); 

  // Function to handle editor content change
  const handleEditorChange = (content) => {
    setCourseDesc(content);
  };

  const handlePriceChange = (text) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setCoursePrice(numericText);
  };

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
        setCourseInvitation(data.invitation);
        setCourseDesc(data.description);
        setCoursefaq(data.Faq || []);
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

    if (!courseName || !courseStartDate || !courseEndDate || !courseType || !coursePrice || !courseInvitation || !courseDesc) {
      alert("Please fill in all fields.");
      return;
    }

    try {
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
        invitation: courseInvitation,
        description: courseDesc,
        Faq: courseFaq,
        imageUrl: imageUrl,
      });

      alert('Course updated successfully!');
      navigation.reset({ index: 0, routes: [{ name: 'Course' }] });
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error: ' + error.message);
    }
  };

  const RadioButton = ({ label, value, selectedValue, onSelect }) => (
    <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onSelect(value)}>
      <View style={styles.radioButton}>
        {selectedValue === value && <View style={styles.radioButtonSelected} />}
      </View>
      <Text style={styles.radioButtonLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const handleFaqTitleChange = (index, newTitle) => {
    const updatedFaq = [...courseFaq];
    updatedFaq[index].title = newTitle;
    setCoursefaq(updatedFaq);
  };

  const handleFaqContentChange = (index, newContent) => {
    const updatedFaq = [...courseFaq];
    updatedFaq[index].content = newContent;
    setCoursefaq(updatedFaq);
  };

  const handleAddFaq = () => {
    const newFaq = { title: '', content: '' };
    setCoursefaq([...courseFaq, newFaq]);
  };

  const handleRemoveFaq = (index) => {
    const updatedFaq = [...courseFaq];
    updatedFaq.splice(index, 1);
    setCoursefaq(updatedFaq);
  };

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
          <Text>แก้ไขการอบรม</Text>
          {selectedImage && <Image source={{ uri: selectedImage }} style={styles.imagePreview} />}
          <Text>ชื่อการอบรม:</Text>
          <TextInput
            placeholder="Course Name"
            value={courseName}
            onChangeText={setCourseName}
            style={styles.textInput}
          />
          <Text>วันที่เริ่มและสิ้นสุดการอบรม:</Text>
          <DateRangeSelector
            initialStartDate={courseStartDate.toISOString().split('T')[0]}
            initialEndDate={courseEndDate.toISOString().split('T')[0]}
            onDatesChange={({ startDate, endDate }) => {
              setCourseStartDate(new Date(startDate));
              setCourseEndDate(new Date(endDate));
            }}
          />
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
          {courseFaq.length > 0 && courseFaq.map((faq, index) => (
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
          <Button title="เลือกรูปภาพ" onPress={pickImage} />
          <Button title="อัปเดทข้อมูล" onPress={updateCourse} />
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