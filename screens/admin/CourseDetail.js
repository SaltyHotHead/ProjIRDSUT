import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, Button } from 'react-native';
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
          setIsCertVisible(courseData.isCertVisible); // Initialize isCertVisible
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
      if (newIsCertVisible) {
        alert('ปิดการแสดงใบประกาศแล้ว');
      } else {
        alert('เปิดการแสดงใบประกาศแล้ว');
      }
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
      <ScrollView contentContainerStyle={styles.scrollViewContent} style={Platform.OS === 'web' ? styles.webScrollView : {}}>
        <Image source={{ uri: course.imageUrl }} style={styles.image} />
        <Text style={styles.title}>ชื่อการอบรม: {course.name}</Text>
        <Text style={styles.title}>วันที่เริ่มการอบรม: {formatDate(course.startdate)}</Text>
        <Text style={styles.title}>วันที่สิ้นสุดการอบรม: {formatDate(course.enddate)}</Text>
        <Text style={styles.title}>ประเภท: {course.type}</Text>
        <Text style={styles.title}>ค่าธรรมเนียม: {course.price === 'ฟรี' ? 'ไม่มีค่าธรรมเนียม' : `${course.price} บาท`}</Text>
        <Text style={styles.title}>รายละเอียดหัวข้ออบรม:</Text>
        <RenderHTML contentWidth={300} source={{ html: course.description }} />
        <Text style={styles.title}>คำถามที่พบบ่อย:</Text>
        {course.Faq && course.Faq.length > 0 && (
          <View>
            {course.Faq.map((faq, index) => (
              <View key={index}>
                <Text>{faq.title}</Text>
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
  scrollViewContent: { padding: 16 },
  webScrollView: { height: '80vh', overflow: 'auto' },
  container: { flex: 1, padding: 16 },
  image: { width: 200, height: 300, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, marginBottom: 8 },
  price: { fontSize: 20, color: 'green', marginBottom: 16 },
  certificateContainer: { marginTop: 20, padding: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5 },
});
