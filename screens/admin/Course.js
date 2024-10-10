import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Image, StyleSheet, Button, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { db, storage } from "../../firebaseconfig";
import { collection, getDocs, doc, deleteDoc, query, orderBy } from '@firebase/firestore';
import { ref, deleteObject } from '@firebase/storage';
import NewCourse from "./NewCourse";
import EditCourse from './EditCourse';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';


export default function Courses({ navigation }) {
  const [courses, setCoursesList] = useState([]);

  async function fetchFirestoreData() {
    const q = query(collection(db, "courses"), orderBy("createdDate", "asc"));
    const querySnapshot = await getDocs(collection(db, "courses"));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  }

  useEffect(() => {
    async function fetchData() {
      const data = await fetchFirestoreData();
      setCoursesList(data);
    }
    fetchData();
  }, []);

  const deleteCourse = async (courseId, imageUrl) => {
    try {

      // Extract image name from the URL
      const imageName = imageUrl.split('/').pop().split('#')[0].split('?')[0];

      // Decode the image name if necessary
      const decodedImageName = decodeURIComponent(imageName);

      // Delete the image from Firebase Storage
      const imageRef = ref(storage, `${decodedImageName}`);
      await deleteObject(imageRef);

      // Delete the course document from Firestore
      const courseDocRef = doc(db, "courses", courseId);
      await deleteDoc(courseDocRef);

      // Update the state to remove the deleted course
      setCoursesList((prevCourses) => prevCourses.filter(course => course.id !== courseId));
      console.log("Course deleted successfully!");
      alert("Course deleted successfully!");
    } catch (error) {
      console.error("Failed to delete course: ", error);
      alert("Failed to delete course.");
    }
  };

  return (

    <SafeAreaView>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={Platform.OS === 'web' ? styles.webScrollView : {}}
      >
        <View style={styles.container}>

          <Button title="เพิ่มการอบรม" onPress={() => navigation.navigate(NewCourse)} />
          <FlatList
            data={courses}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <Text>{item.name}</Text>
                <Text>ประเภท: {item.type}</Text>
                <Button
                  title='ข้อมูล'
                  onPress={() => {
                    navigation.navigate('CourseDetail', { courseId: item.id });
                  }}
                />
                <EditCourse
                  route={{ params: { courseId: item.id } }}
                />
                <Button
                  title='ลบ'
                  onPress={() => deleteCourse(item.id, item.imageUrl)}
                />
              </View>
            )}
          />

        </View>
      </ScrollView>
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
    alignItems: 'center',
  },
  itemContainer: {
    marginBottom: 20,
    alignItems: 'center',
    flexDirection: 'row'
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
});