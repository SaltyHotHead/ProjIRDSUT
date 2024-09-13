import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { getDoc, doc } from '@firebase/firestore';
import { db } from "../../firebaseconfig";

export default function CourseDetail({ route }) {
  const { courseId } = route.params;
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseDocRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseDocRef);

        if (courseDoc.exists()) {
          setCourse(courseDoc.data());
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

  // Convert Firestore Timestamp to a readable date string
  const formatDate = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString(); // Format the date as needed
    }
    return '';
  };

  // Determine the fee display
  let feeDisplay;
  if (course.feeType === 'free') {
    feeDisplay = 'Free';
  } else {
    feeDisplay = `${course.price} บาท`;
  }

  return (
      <ScrollView style={styles.container}>
      <Image source={{ uri: course.imageUrl }} style={styles.image} />
      <Text style={styles.title}>ชื่อการอบรม: {course.name}</Text>
      <Text style={styles.title}>วันที่เริ่มการอบรม: {formatDate(course.startdate)}</Text>
      <Text style={styles.title}>วันที่สิ้นสุดการอบรม: {formatDate(course.enddate)}</Text>
      <Text style={styles.title}>ประเภท: {course.type}</Text>
      <Text style={styles.title}>ค่าธรรมเนียม: {feeDisplay}</Text>
      <Text style={styles.title}>รายละเอียดหัวข้ออบรม:</Text>
      <Text style={styles.description}>{course.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  image: {
    width: 200,
    height: 300,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    color: 'green',
    marginBottom: 16,
  },
});