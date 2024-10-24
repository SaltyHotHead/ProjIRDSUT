import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, Text, Image, Alert, TouchableOpacity } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';
import CertificateGenerator from '../../components/Certificate';
import RenderHTML from 'react-native-render-html';
import Faq from "react-faq-component";

const Cosss = ({ route }) => {
    const { courseId } = route.params; // Get courseId from route parameters
    const [course, setCourse] = useState({});
    const [user, setUser] = useState(null); // Initialize user as null
    const [userData, setUserData] = useState({}); // State for user data
    const [loading, setLoading] = useState(true); // Add loading state
    const [isCompleted, setIsCompleted] = useState(false); // State to track if the user is completed

    useEffect(() => {
        const fetchUserData = async (uid) => {
            try {
                const userRef = doc(db, "users", uid);
                const userSnapshot = await getDoc(userRef);
                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    setUserData(userData);
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
                    console.log("Course data fetched:", courseData); // Log the fetched data
                    setCourse(courseData);

                    if (courseData.enrolledUsers) {
                        const isUserCompleted = courseData.enrolledUsers.some(user => user.status === "เสร็จสิ้น");
                        setIsCompleted(isUserCompleted);
                    }
                } else {
                    console.error("No such user document!");
                }
            } catch (error) {
                console.error("Error fetching course: ", error);
                Alert.alert("Failed to fetch course data.");
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (cur) => {
            console.log("Current user:", cur); // Log the current user
            setUser(cur);
            if (cur) {
                fetchUserData(cur.uid); // Fetch user data when user is authenticated
                fetchCourse(courseId); // Fetch course data using courseId
            } else {
                setLoading(false); // Set loading to false if user is not authenticated
            }
        });

        return () => {
            unsubscribe();
        };
    }, [courseId]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate(); // Assuming timestamp is a Firestore Timestamp
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const faqData = {
        title: "คำถามที่พบบ่อย",
        rows: course.Faq || [], // Assuming course.Faq is an array of objects with question and answer
    };

    // Custom styles for the FAQ component
    const faqStyles = {
        bgColor: "transparent", // Background color for the FAQ
        titleTextColor: "#48482a",
        rowTitleColor: "#78789a",
        rowTitleTextSize: 'large',
        rowContentColor: "#48484a",
        rowContentTextSize: '16px',
        rowContentPaddingTop: '10px',
        rowContentPaddingBottom: '10px',
    };

    // Debugging logs
    console.log("isCompleted: ", isCompleted);
    console.log("Is Certificate Visible:", course.isCertVisible);

    return (
        <View style={{ backgroundColor: '#FFD7D0', flex: 1 }}>
            <div style={{ flexGrow: 1, padding: 1, overflowY: 'auto', height: '100vh', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px', paddingLeft: 450 }}>
                <SafeAreaView style={{ width: '100%', maxWidth: 600, alignItems: 'center' }}>
                    {loading ? ( // Show loading indicator
                        <Text>Loading...</Text>
                    ) : (
                        course && (
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

                                <Faq data={faqData} styles={faqStyles} /> {/* Pass custom styles to Faq */}

                                {/* Conditionally render the quiz link and certificate button */}
                                {isCompleted && (
                                    <>
                                        {course.quizLinks && course.quizLinks.length > 0 && (
                                            <>
                                                <Text style={{ fontWeight: 'bold', marginVertical: 30, textAlign: 'center' }}>
                                                    ลิงค์สำหรับทำแบบทดสอบ:
                                                </Text>
                                                {course.quizLinks.map((link, index) => (
                                                    <Text key={index} style={{ fontWeight: 'bold', marginBottom: 50, textAlign: 'center' }}>
                                                        {link}
                                                    </Text>
                                                ))}
                                            </>
                                        )}

                                        {course.isCertVisible && ( // Check if isCertVisible is true
                                            <CertificateGenerator
                                                userName={userData.engname} // Replace with actual user name if available
                                                trainingName={"หลักสูตร " + course.name}
                                                trainingDetails="Basic Good Clinical Practice (GCP) Training Course"
                                                trainingDate={formatDate(course.startdate)}
                                                certIssueDate="August 25, 2024"
                                                organizationName="Suranaree University of Technology"
                                            />
                                        )}
                                    </>
                                )}
                            </>
                        )
                    )}
                </SafeAreaView>
            </div>
        </View>
    );
};

export default Cosss;