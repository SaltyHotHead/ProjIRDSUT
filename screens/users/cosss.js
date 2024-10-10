import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text, Image, ScrollView, Button, Alert } from 'react-native';
import { addDoc, collection, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

const cosss = ({ route, navigation }) => {
    const [course, setCourse] = useState({});
    const { id } = route.params; // Use id from route params
    const [user, setUser] = useState({});

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                console.log("Fetching course with ID:", id);
                const courseRef = doc(db, "courses", id);
                const querySnapshot = await getDoc(courseRef);
                if (querySnapshot.exists()) {
                    const courseData = querySnapshot.data();
                    console.log("Course data fetched:", courseData);
                    setCourse(courseData);
                } else {
                    console.error("No such document with ID:", id);
                    Alert.alert("Course not found.");
                }
            } catch (error) {
                console.error("Error fetching course: ", error);
                Alert.alert("Failed to fetch course data.");
            }
        };
    
        const unsubscribe = onAuthStateChanged(auth, (cur) => {
            setUser(cur);
        });
    
        fetchCourse();
    
        return () => {
            unsubscribe();
        };
    }, [id]);

    const handleEnroll = async () => {
        if (!course || !id) {
            console.error('Course data is missing');
            Alert.alert('Course data is missing');
            return;
        }

        const colRef = collection(db, 'users', user.uid, 'cos');

        try {
            await addDoc(colRef, {
                ...course,
                enrolledAt: new Date().toISOString(),
            });
            Alert.alert('Enrolled successfully!');
        } catch (error) {
            console.error('Error enrolling in course: ', error);
            Alert.alert('Failed to enroll. Please try again.');
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return date.toLocaleDateString(); // Customize the format here if needed
    };
   
    return (
        <View style={{ backgroundColor: '#FFD7D0', flex: 1, alignItems: 'center', padding: 20 }}>
            <SafeAreaView style={{ width: '100%', maxWidth: 600, alignItems: 'center' }}>
                {course && (
                    <>
                        <Text style={{ fontSize: 35, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' }}>
                            {course.name}
                        </Text>

                        <Image
                            source={{ uri: course.imageUrl }}
                            style={{ width: '70%', height: 300 }} // Adjusted height for better display
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
                    </>
                )}
            </SafeAreaView>
        </View>
    );
};

export default cosss;
