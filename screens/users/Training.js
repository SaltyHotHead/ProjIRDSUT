import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text, Image } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import RenderHTML from 'react-native-render-html';

export default function App({ route, navigation }) {
  const [course, setCourse] = useState({});
  const { id } = route.params;
  const [user, setUser] = useState(null); // Initialize user as null
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        console.log("Fetching course with ID:", id);
        const querySnapshot = await getDoc(doc(db, "courses", id));
        if (querySnapshot.exists()) {
          const courseData = querySnapshot.data();
          console.log("Course data fetched:", courseData);
          setCourse(courseData);
        } else {
          console.error("No such document!");
          alert("Course not found.");
        }
      } catch (error) {
        console.error("Error fetching course: ", error);
        alert("Failed to fetch course data.");
      }
    };

    const fetchUserData = async (uid) => {
      try {
        console.log("Fetching user data with ID:", uid);
        const querySnapshot = await getDoc(doc(db, "users", uid));
        if (querySnapshot.exists()) {
          const userData = querySnapshot.data();
          console.log("User data fetched:", userData);
          setUserData(userData);
        } else {
          console.error("No such document!");
          alert("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        alert("Failed to fetch user data.");
      }
    };

    // Fetch course data regardless of user authentication
    fetchCourse();

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (cur) => {
      setUser(cur);
      if (cur) {
        fetchUserData(cur.uid);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      // Navigate to the login page if the user is not logged in
      navigation.navigate('Login'); // Replace 'Login' with your actual login screen name
      return;
    }

    if (!course || !id || !user.uid) {
      console.error('Course or user data is missing');
      alert('Course or user data is missing');
      return;
    }

    const userCourseRef = doc(db, 'users', user.uid, 'cos', id); // Use course ID as document ID
    const courseUserRef = doc(db, 'courses', id, 'enroluser', user.uid); // Use user ID as document ID

    try {
      // Set user course data with course ID as document ID
      await setDoc(userCourseRef, {
        ...course,
        status: "รอการชำระเงิน",
        enrolledAt: new Date().toISOString(),
      });

      // Set course user data with user ID as document ID
      await setDoc(courseUserRef, {
        ...userData,
        status: "รอการชำระเงิน",
        enrolledAt: new Date().toISOString(),
      });

      alert('Enrolled successfully!');
    } catch (error) {
      console.error('Error enrolling in course: ', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  // Helper function to format Firestore Timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString(); // You can customize the format here
  };

  return (
    <View style={{ backgroundColor: '#FFD7D0', flex: 1 }}>
      <div style={{ flexGrow: 1, padding: 1, overflowY: 'auto', height: '100vh', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px', paddingLeft: 400 }}>
      <SafeAreaView style={{ width: '100%', maxWidth: 600, alignItems: 'center', paddingLeft: 60 }}>
        {course && (
          <>
            <Text style={{ fontSize: 35, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' }}>
              {course.name}
            </Text>

            <Image
              source={{ uri: course.imageUrl }}
              style={{ width: '70%', height: 600 }}
              resizeMode="cover"
            />

            <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
              {course.description}
            </Text>

            <RenderHTML contentWidth={300} source={{ html: course.description }} />

            <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
              วันที่เริ่ม: {formatDate(course.startdate)}
            </Text>

            <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
              วันที่สิ้นสุด: {formatDate(course.enddate)}
            </Text>

            <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
              ประเภทการอบรม : {course.type}
            </Text>

            <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
              ราคา : {course.price}
            </Text>

              <TouchableOpacity
                style={{
                  marginTop: 20,
                  backgroundColor: '#FF5C5C',
                  padding: 10,
                  borderRadius: 10,
                  alignItems: 'center',
                  width: '100%',
                }}
                onPress={handleEnroll}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>สมัคร</Text>
              </TouchableOpacity>
            
          </>
        )}
      </SafeAreaView>
      </div>
    </View>
  );
}