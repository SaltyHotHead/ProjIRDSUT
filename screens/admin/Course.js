import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, SafeAreaView, Image, StyleSheet, Button, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { db, storage } from "../../firebaseconfig";
import { collection, getDocs, doc, deleteDoc, query, orderBy, getDoc, setDoc } from '@firebase/firestore';
import { ref, deleteObject } from '@firebase/storage';
import NewCourse from "./NewCourse";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export default function Courses({ navigation }) {
  const [courses, setCoursesList] = useState([]);

  async function fetchFirestoreData() {
    const q = query(collection(db, "courses"), orderBy("createdDate", "desc"));
    const querySnapshot = await getDocs(q);
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
    // Step 1: Fetch enrolled users for the course
    const courseDocRef = doc(db, "courses", courseId);
    const courseDoc = await getDoc(courseDocRef);
    console.log("Course Document: ", courseDoc.data());
    const enrolledUsers = courseDoc.data()?.enrolledUsers || []; // Ensure correct casing

    // Step 2: Delete each user's enrolled course
    const updatePromises = enrolledUsers.map(async (user) => {
      const userDocRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.error(`User document not found for ID: ${user.id}`);
        return; // Skip this user if the document does not exist
      }

      const enrolledCourses = userDoc.data()?.enrolledCourses || [];
      console.log("userDocRef: ", userDocRef);
      console.log("userDoc: ", userDoc.data());
      console.log("enrolledCourses: ", enrolledCourses);
      
      // Filter out the course being deleted
      const updatedEnrolledCourses = enrolledCourses.filter(course => course.id !== courseId);
      console.log("updatedEnrolledCourses: ", updatedEnrolledCourses);
      
      // Update the user's enrolled courses with merge option
      try {
        await setDoc(userDocRef, { enrolledCourses: updatedEnrolledCourses }, { merge: true });
        console.log(`Successfully updated enrolled courses for user ID: ${user.id}`);
      } catch (updateError) {
        console.error(`Failed to update enrolled courses for user ID: ${user.id}`, updateError);
      }
    });

    console.log("updatePromises: ", updatePromises);
  
    // Wait for all updates to complete
    await Promise.all(updatePromises);
  
    // Step 3: Delete the course itself
    const imageName = imageUrl.split('/').pop().split('#')[0].split('?')[0];
    const decodedImageName = decodeURIComponent(imageName);
    const imageRef = ref(storage, `${decodedImageName}`);
    await deleteObject(imageRef);
    await deleteDoc(courseDocRef);
    
    // Update local state
    setCoursesList((prevCourses) => prevCourses.filter(course => course.id !== courseId));
    console.log("Course deleted successfully!");
    alert("Course deleted successfully!");
  } catch (error) {
    console.error("Failed to delete course: ", error);
    alert("Failed to delete course.");
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowBackIosIcon />
      </TouchableOpacity>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        style={Platform.OS === 'web' ? styles.webScrollView : {}}
      >
        <View style={styles.container}>
          <View style={styles.uploadContainer}>
            <Button title="เพิ่มการอบรม" onPress={() => navigation.navigate(NewCourse)} color="#F89E6C" />
          </View>
          <View style={styles.table}>
            <FlatList
              data={courses}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.tableRow}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.detailsContainer}>
                    <Text style={styles.courseName}>{item.name}</Text>
                    <Text style={styles.courseType}>ประเภท: {item.type}</Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <Button
                      title='ข้อมูล'
                      onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}
                      color="#00BFFF" // Light blue
                      style={styles.button}
                    />
                    <Button
                      title='แก้ไข'
                      onPress={() => navigation.navigate('EditCourse', { courseId: item.id })}
                      color="#FFD700" // Gold
                      style={styles.button}
                    />
                    <Button
                      title='ลบ'
                      onPress={() => deleteCourse(item.id, item.imageUrl)}
                      color="#FF4500" // Red-Orange
                      style={styles.button}
                    />
                  </View>
                </View>
              )}
              contentContainerStyle={styles.listContainer} // Center the items
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Light beige background
  },
  scrollViewContent: {
    padding: 16,
  },
  webScrollView: {
    height: '80vh',
    overflow: 'auto',
  },
  container: {
    flex: 1,
    alignItems: 'flex-start', // Align items to the left
    marginLeft: 200,
    marginRight: 200,
  },
  uploadContainer: {
    alignSelf: 'flex-start', // Align the upload button to the left
    marginTop: 10,
    marginLeft: 10, // Add some space below the button
  },
  backButton: {
    marginBottom: 10,
  },
  table: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 20
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 20,
    borderRadius: 8,
  },
  detailsContainer: {
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  courseType: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 10,
    marginRight: 10, // Add margin to the right for spacing
  },
  button: {
    width: 80, // Add horizontal margin to each button
  },
});