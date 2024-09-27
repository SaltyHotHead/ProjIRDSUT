import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, TextInput } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import Typography from '@mui/material/Typography';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

export default function Profile() {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Track login state
    const [editableUser, setEditableUser] = useState({});
    const navigation = useNavigation();

    useEffect(() => {
        if (isLoggedIn) {
            const fetchUserData = async () => {
                const currentUser = auth.currentUser;
                console.log(currentUser)
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

    const handleLogin = () => {
        // Implement login logic here
        setIsLoggedIn(true);
    };

    return (
        <View style={{ backgroundColor: '#FFD7D0', flex: 1, padding: 20 }}>
            <SafeAreaView>
                {isLoggedIn ? (
                    <>
                        {isEditing ? (
                            <>
                                <TextInput
                                    value={editableUser.engname}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, engname: text })}
                                />
                                <TextInput
                                    value={editableUser.thainame}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, thainame: text })}
                                />
                                <TextInput
                                    value={editableUser.tel}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, tel: text })}
                                />
                                <TextInput
                                    value={editableUser.email}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, email: text })}
                                />
                                <TextInput
                                    value={editableUser.address}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, address: text })}
                                />
                            </>
                        ) : (
                            <>
                                <Typography key={user.id} gutterBottom variant="h4" component="div">
                                    ข้อมูลผู้ใช้
                                </Typography>
                                <Typography variant="body50" sx={{ color: 'text.secondary' }}>
                                    Name   : {user.engname}
                                </Typography>
                                <Typography variant="body50" sx={{ color: 'text.secondary' }}>
                                    ชื่อ     : {user.thainame}
                                </Typography>
                                <Typography variant="body50" sx={{ color: 'text.secondary' }}>
                                    เบอร์โทร : {user.tel}
                                </Typography>
                                <Typography variant="body50" sx={{ color: 'text.secondary' }}>
                                    E-MAIL  : {user.email}
                                </Typography>
                                <Typography variant="body50" sx={{ color: 'text.secondary' }}>
                                    ที่อยู่     : {user.address}
                                </Typography>
                            </>
                        )}

                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                backgroundColor: '#FF5C5C',
                                padding: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                width: 200
                            }}
                            onPress={isEditing ? handleSave : handleEditToggle}
                        >
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                                {isEditing ? 'บันทึก' : 'แก้ไข'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                backgroundColor: '#FF5C5C',
                                padding: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                width: 200
                            }}
                            onPress={handleLogout}
                        >
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ออกจากระบบ</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={{ marginTop: 20, backgroundColor: '#FF5C5C', padding: 10, borderRadius: 10, alignItems: 'center', width: 200 }} className="nav-link " href="#" onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Login</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
        </View>
    );
}