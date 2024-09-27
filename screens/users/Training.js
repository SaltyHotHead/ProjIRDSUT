import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import { addDoc, collection, doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function App({ route }) {
  const [course, setCourse] = useState({});
  const { id } = route.params;
  const [user ,setUser] = useState({});

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

    const unsubscribe = onAuthStateChanged(auth,(cur)=>{
        setUser(cur);
    })

    fetchCourse();

    return ()=>{
      unsubscribe();
    }

  }, [id]);

  const handleEnroll = async () => {
    if (!course || !id) {
      console.error('Course data is missing');
      alert('Course data is missing');
      return;
    }

    const colRef = collection(db, 'users', user.uid, 'cos')

    try {
      await addDoc(colRef, {
        ...course,
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

              <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
                Start Date: {formatDate(course.startdate)}
              </Text>

              <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
                End Date: {formatDate(course.enddate)}
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