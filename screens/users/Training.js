import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text, Image } from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import RenderHTML from 'react-native-render-html';
import Faq from "react-faq-component";

export default function App({ route, navigation }) {
  const [course, setCourse] = useState({});
  const { id } = route.params;
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false); // State to track enrollment status

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

          // Check if the user is already enrolled in the course
          const enrolledCourses = userData.enrolledCourses || [];
          const isAlreadyEnrolled = enrolledCourses.some(course => course.id === id);
          setIsEnrolled(isAlreadyEnrolled);
        } else {
          console.error("No such document!");
          alert("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
        alert("Failed to fetch user data.");
      }
    };

    fetchCourse();

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

  // Function to handle enrollment
  const enrollUserInCourse = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    if (!course || !id || !user.uid) {
      console.error('Course or user data is missing');
      alert('Course or user data is missing');
      return;
    }

    const userCourseRef = doc(db, 'users', user.uid);
    const courseRef = doc(db, 'courses', id);

    const userInfo = {
      id: user.uid,
      thainame: userData.thainame || "Unknown User", // Default value if name is undefined
      engname: userData.engname || "Unknown User", // Default value if name is undefined
      status: course.feeType === "paid" ? "รอการชำระเงิน" : "เสร็จสิ้น", // Set status based on feeType
      enrolledAt: new Date().toISOString(),
    };

    try {
      // Fetch existing enrolled users
      const courseSnapshot = await getDoc(courseRef);
      const enrolledUsers = courseSnapshot.exists() ? courseSnapshot.data().enrolledUsers || [] : [];

      // Add the new user to the array
      enrolledUsers.push(userInfo);

      // Update the course document with the new array
      await updateDoc(courseRef, {
        enrolledUsers: enrolledUsers,
      });

      // Fetch existing enrolled courses
      const userSnapshot = await getDoc(userCourseRef);
      const enrolledCourses = userSnapshot.exists() ? userSnapshot.data().enrolledCourses || [] : [];

      // Add the new course to the array
      enrolledCourses.push({
        id: id,
        name: course.name || "Unknown Course", // Default value if course name is undefined
        status: userInfo.status, // Use the status set above
      });

      // Update the user document with the new array
      await updateDoc(userCourseRef, {
        enrolledCourses: enrolledCourses,
      });

      // Save enrollment data to a new collection
      const enrollmentData = {
        userId: user.uid,
        courseId: id,
        courseName: course.name || "Unknown Course",
        enrolledAt: new Date().toISOString(),
      };

      const enrollmentRef = doc(db, 'courseEnrollments', `${user.uid}_${id}`); // Unique document ID
      await setDoc(enrollmentRef, enrollmentData);

      alert('Enrolled successfully!');
      setIsEnrolled(true); // Update the enrollment status
    } catch (error) {
      console.error('Error enrolling in course: ', error);
      alert('Failed to enroll. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate(); // Assuming timestamp is a Firestore Timestamp
    return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
  };

  // FAQ data structure
  const faqData = {
    title: "คำถามที่พบบ่อย",
    rows: course.Faq || [], // Assuming course.Faq is an array of objects with question and answer
  };

  const faqStyles = {
    bgColor: "transparent", // No background color for the FAQ
    titleTextColor: "#48482a",
    rowTitleColor: "#78789a",
    rowTitleTextSize: 'large',
    rowContentColor: "#48484a",
    rowContentTextSize: '16px',
    rowContentPaddingTop: '10px',
    rowContentPaddingBottom: '10px',
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
                {course.invitation}
              </Text>

              <RenderHTML contentWidth={300} source={{ html: course.description }} /> {/* Ensure course.description is valid HTML */}

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

              {/* Render FAQ */}
              <Faq data={faqData} styles={faqStyles} />

              {/* Conditional rendering for the button */}
              {isEnrolled ? (
                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: '#FF5C5C',
                    padding: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    width: '100%',
                  }}
                  onPress={() => navigation.navigate('MyTrainingUser')} // Navigate to MyTrainingUser
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ไปที่การอบรมของฉัน</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={{
                    marginTop: 20,
                    backgroundColor: '#FF5C5C',
                    padding: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    width: '100%',
                  }}
                  onPress={enrollUserInCourse} // Call the new function
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>สมัคร</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </SafeAreaView>
      </div>
    </View>
  );
}