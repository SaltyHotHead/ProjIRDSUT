import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Button, Platform } from 'react-native';
import { getDoc, doc, updateDoc } from '@firebase/firestore';
import { db } from "../../firebaseconfig";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import NavbarAdminV2 from '../../components/NavbarAdminV2';
import RenderHTML from 'react-native-render-html';

export default function CourseDetail({ route, navigation }) {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);
  const [isCertVisible, setIsCertVisible] = useState();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseDocRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseDocRef);
        if (courseDoc.exists()) {
          const courseData = courseDoc.data();
          setCourse(courseData);
          setIsCertVisible(courseData.isCertVisible);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (!course) {
    return <Text>Loading...</Text>;
  }

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString();
    }
    return '';
  };

  const toggleCertDisplay = async () => {
    try {
      const newIsCertVisible = !isCertVisible;
      const userDocRef = doc(db, "courses", courseId);
      await updateDoc(userDocRef, { isCertVisible: newIsCertVisible });
      setIsCertVisible(newIsCertVisible);
      alert(newIsCertVisible ? 'ปิดการแสดงใบประกาศแล้ว' : 'เปิดการแสดงใบประกาศแล้ว');
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <NavbarAdminV2 courseId={courseId} />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={Platform.OS === 'web' ? styles.webScrollView : {}}
      >
        <Image source={{ uri: course.imageUrl }} style={styles.image} />

        <Text style={styles.label}>ชื่อการอบรม:</Text>
        <TextInput style={styles.input} value={course.name} editable={false} />
        
        <Text style={styles.label}>วันที่เริ่มการอบรม:</Text>
        <TextInput style={styles.input} value={formatDate(course.startdate)} editable={false} />
        
        <Text style={styles.label}>วันที่สิ้นสุดการอบรม:</Text>
        <TextInput style={styles.input} value={formatDate(course.enddate)} editable={false} />
        
        <Text style={styles.label}>ประเภท:</Text>
        <TextInput style={styles.input} value={course.type} editable={false} />
        
        <Text style={styles.label}>ค่าธรรมเนียม:</Text>
        <TextInput style={styles.input} value={course.price === 'ฟรี' ? 'ไม่มีค่าธรรมเนียม' : `${course.price} บาท`} editable={false} />
        
        <Text style={styles.label}>รายละเอียดหัวข้ออบรม:</Text>
        <View style={styles.descriptionContainer}>
          <RenderHTML contentWidth={300} source={{ html: course.description }} />
        </View>
        
        <Text style={styles.label}>คำถามที่พบบ่อย:</Text>
        {course.Faq && course.Faq.length > 0 && (
          <View style={styles.faqContainer}>
            {course.Faq.map((faq, index) => (
              <View key={index}>
                <Text style={styles.faqTitle}>{faq.title}</Text>
                <Text>{faq.content}</Text>
              </View>
            ))}
          </View>
        )}
        
        <Button title={isCertVisible ? 'ปิดการแสดงใบประกาศ' : 'เปิดการแสดงใบประกาศ'} onPress={toggleCertDisplay} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5DC',
  },
  webScrollView: {
    height: '80vh', // Ensure it takes full height on web
    overflow: 'auto', // Enable scrolling
  },
  scrollViewContent: { 
    padding: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  image: { 
    width: 200, 
    height: 300, 
    marginBottom: 16 
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  descriptionContainer: {
    marginBottom: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  faqContainer: {
    marginTop: 16,
  },
  faqTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
});