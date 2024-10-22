import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, Text, Image, Alert } from 'react-native';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import CertificateGenerator from '../../components/Certificate';
import RenderHTML from 'react-native-render-html';
import Faq from "react-faq-component";

const Cosss = ({ route }) => {
    const [course, setCourse] = useState({});
    const [user, setUser] = useState(null); // Initialize user as null
    const [userData, setUserData] = useState({}); // State for user data
    const [enrolledCourses, setEnrolledCourses] = useState([]); // State for enrolled courses

    useEffect(() => {
        const fetchUserData = async (uid) => {
            try {
                const userRef = doc(db, "users", uid);
                const userSnapshot = await getDoc(userRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUserData(userData);
                    setEnrolledCourses(userData.enrolledCourses || []); // Set enrolled courses
                } else {
                    console.error("No such user document!");
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        const fetchCourse = async (courseId) => {
            try {
                console.log("Fetching course with ID:", courseId);
                const courseRef = doc(db, "courses", courseId);
                const querySnapshot = await getDoc(courseRef);
                if (querySnapshot.exists()) {
                    const courseData = querySnapshot.data();
                    console.log("Course data fetched:", courseData);
                    setCourse(courseData);
                } else {
                    console.error("No such document with ID:", courseId);
                    Alert.alert("Course not found.");
                }
            } catch (error) {
                console.error("Error fetching course: ", error);
                Alert.alert("Failed to fetch course data.");
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (cur) => {
            setUser(cur);
            if (cur) {
                fetchUserData(cur.uid); // Fetch user data when user is authenticated
            }
        });

        // Fetch course data if enrolledCourses is available
        if (enrolledCourses.length > 0) {
            // Assuming you want to fetch the first enrolled course
            fetchCourse(enrolledCourses[0].id); // Use the ID from the enrolledCourses array
        }

        return () => {
            unsubscribe();
        };
    }, [user, enrolledCourses]);

    const faqData = {
        title: "คำถามที่พบบ่อย",
        rows: course.Faq || [], // Assuming course.Faq is an array of objects with question and answer
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

    return (
        <View style={{ backgroundColor: '#FFD7D0', flex: 1 }}>
            <div style={{ flexGrow: 1, padding: 1, overflowY: 'auto', height: '100vh', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px', paddingLeft: 400 }}>
            <SafeAreaView style={{ width: '100%', maxWidth: 600, alignItems: 'center' }}>
                {course && (
                    <>
                        <Text style={{ fontSize: 35, fontWeight: 'bold', marginVertical: 10, textAlign: 'center' }}>
                            {course.name}
                        </Text>

                        <Image
                            source={{ uri: course.imageUrl }}
                            style={{ width: '70%', height: 600 }} // Adjusted height for better display
                            resizeMode="cover"
                        />

                        <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
                            {course.invitation}
                        </Text>

                        <RenderHTML contentWidth={300} source={{ html: course.description }} />

                        <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
                            Start Date: {formatDate(course.startdate)}
                        </Text>

                        <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
                            End Date: {formatDate(course.enddate)}
                        </Text>

                        <Text style={{ fontSize: 16, color: '#666', marginVertical: 10, textAlign: 'center' }}>
                            ราคา : {course.price}
                        </Text>

                        <Faq data={faqData} />

                        {/* Pass course and user data to CertificateGenerator */}
                        <CertificateGenerator
                            userName={userData.engname} // Replace with actual user name if available
                            trainingName={"หลักสูตร " + course.name}
                            trainingDetails="Basic Good Clinical Practice (GCP) Training Course"
                            trainingDate={formatDate(course.startdate)}
                            certIssueDate="August 25, 2024"
                            organizationName="Suranaree University of Technology"
                        />
                    </>
                )}
            </SafeAreaView>
            </div>
        </View>
    );
};

export default Cosss;