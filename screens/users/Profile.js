import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../../components/Navbar';
import NavbarAdmin from '../../components/NavbarAdmin';

export default function Profile() {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [editableUser, setEditableUser] = useState({});
    const navigation = useNavigation();

    useEffect(() => {
        if (isLoggedIn) {
            const fetchUserData = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                        const userData = userDoc.data();
                        setUser(userData);
                        setEditableUser(userData);
                    } catch (error) {
                        console.error("Error fetching user data: ", error);
                    }
                }
            };

            fetchUserData();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                fetchUserData(user.uid);
            } else {
                setIsLoggedIn(false);
                setUser({});
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchUserData = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            const userData = userDoc.data();
            setUser(userData);
            setEditableUser(userData);
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleSave = async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                await updateDoc(doc(db, "users", currentUser.uid), editableUser);
                setUser(editableUser);
                setIsEditing(false);
            } catch (error) {
                console.error("Error updating user data: ", error);
            }
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser({});
            setIsLoggedIn(false);
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    // Determine the role and set the appropriate navbar
    const renderNavbar = () => {
        if (user.role === 'admin') {
            return <NavbarAdmin />;
        } else {
            return <Navbar />;
        }
    };

    return (
        <View style={styles.container}>
            {renderNavbar()}
            <View style={{ backgroundColor: '#FFF8E1', flex: 1, padding: 20,display:'flex', alignItems: 'center',  }}>
            <SafeAreaView style={styles.safeArea}>
                {isLoggedIn ? (
                    <>
                        <View style={styles.profileContainer}>
                            <View style={styles.avatarContainer}>
                            <img src='../assets/images/โลโก้-Photoroom.png' style={{ width: 100, height: 100 }} />
                            </View>
                        </View>
                        <View style={styles.infoContainer}>
                            {isEditing ? (
                                <>
                                    <TextInput
                                        value={editableUser.engname}
                                        onChangeText={(text) => setEditableUser({ ...editableUser, engname: text })}
                                        style={styles.input}
                                    />
                                    <TextInput
                                        value={editableUser.thainame}
                                        onChangeText={(text) => setEditableUser({ ...editableUser, thainame: text })}
                                        style={styles.input}
                                    />
                                    <TextInput
                                        value={editableUser.tel}
                                        onChangeText={(text) => setEditableUser({ ...editableUser, tel: text })}
                                        style={styles.input}
                                    />
                                    <TextInput
                                        value={editableUser.email}
                                        onChangeText={(text) => setEditableUser({ ...editableUser, email: text })}
                                        style={styles.input}
                                    />
                                    <TextInput
                                        value={editableUser.address}
                                        onChangeText={(text) => setEditableUser({ ...editableUser, address: text })}
                                        style={styles.input}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.infoText}>ชื่อ: {user.thainame}</Text>
                                    <Text style={styles.infoText}>Name: {user.engname}</Text>
                                    <Text style={styles.infoText}>อีเมล: {user.email}</Text>
                                    <Text style={styles.infoText}>เบอร์ติดต่อ: {user.tel}</Text>
                                    <Text style={styles.infoText}>ที่อยู่: {user.address}</Text>
                                </>
                            )}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={isEditing ? handleSave : handleEditToggle}
                                >
                                    <Text style={styles.buttonText}>
                                        {isEditing ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleLogout}
                                >
                                    <Text style={styles.buttonText}>ออกจากระบบ</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                ) : (
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8E1',
    },
    safeArea: {
        flexGrow: 1,
        padding: 16,
        paddingBottom: 100,
    },
    profileContainer: {
        alignItems: 'center',
        marginBottom: 50,
    },
    avatarContainer: {
        width: 175,
        height: 175,
        borderRadius: 100,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 100,
        height: 100,
    },
    infoContainer: {
        flexDirection: 'column',
        width: '100%',
        padding: 20,
        margin: 10,
    },
    input: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    infoText: {
        fontSize: 18,
        marginBottom: 15,
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        marginTop: 20,
        backgroundColor: '#BDBDBD',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: 200,
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
    },
    loginButton: {
        marginTop: 20,
        backgroundColor: '#BDBDBD',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: 200,
    },
});