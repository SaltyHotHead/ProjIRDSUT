import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, TextInput, Image } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';

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

    return (
        <View style={{ backgroundColor: '#FFF8E1', flex: 1, padding: 20, alignItems: 'center', justifyContent: 'left' }}>
           <div style={{ flexGrow: 1, padding: 16, overflowY: 'auto', height: '100vh' , paddingBottom: '100px'}}>
            <SafeAreaView style={{ width: '80%' }}>
                {isLoggedIn ? (
                    <>
                        <View style={{ alignItems: 'center', marginBottom: 100 }}>
                            <View style={{ width: 175, height: 175, borderRadius: 100, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }}>
                                <img src='../assets/images/โลโก้-Photoroom.png' style={{ width: 100, height: 100 }} />
                            </View>
                        </View>
                        {isEditing ? (
                            <>
                                <TextInput
                                    value={editableUser.engname}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, engname: text })}
                                    style={{ marginBottom: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
                                />
                                <TextInput
                                    value={editableUser.thainame}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, thainame: text })}
                                    style={{ marginBottom: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
                                />
                                <TextInput
                                    value={editableUser.tel}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, tel: text })}
                                    style={{ marginBottom: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
                                />
                                <TextInput
                                    value={editableUser.email}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, email: text })}
                                    style={{ marginBottom: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
                                />
                                <TextInput
                                    value={editableUser.address}
                                    onChangeText={(text) => setEditableUser({ ...editableUser, address: text })}
                                    style={{ marginBottom: 15, borderBottomWidth: 1, borderColor: '#ccc' }}
                                />
                            </>
                        ) : (
                            <>
                                <Text style={{ fontSize: 18, marginBottom: 15 }}>ชื่อ              :   {user.thainame}</Text>
                                <Text style={{ fontSize: 18, marginBottom: 15 }}>Name         :   {user.engname}</Text>
                                <Text style={{ fontSize: 18, marginBottom: 15 }}>อีเมล           :   {user.email}</Text>
                                <Text style={{ fontSize: 18, marginBottom: 15 }}>เบอร์ติดต่อ  :   {user.tel}</Text>
                                <Text style={{ fontSize: 18, marginBottom: 15 }}>ที่อยู่           :   {user.address}</Text>
                            </>
                        )}

                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                backgroundColor: '#BDBDBD',
                                padding: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                width: 200
                            }}
                            onPress={isEditing ? handleSave : handleEditToggle}
                        >
                            <Text style={{ color: '#000', fontWeight: 'bold' }}>
                                {isEditing ? 'บันทึกข้อมูล' : 'แก้ไขข้อมูล'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                marginTop: 20,
                                backgroundColor: '#BDBDBD',
                                padding: 10,
                                borderRadius: 10,
                                alignItems: 'center',
                                width: 200
                            }}
                            onPress={handleLogout}
                        >
                            <Text style={{ color: '#000', fontWeight: 'bold' }}>ออกจากระบบ</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        style={{ marginTop: 20, backgroundColor: '#BDBDBD', padding: 10, borderRadius: 10, alignItems: 'center', width: 200 }}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={{ color: '#000', fontWeight: 'bold' }}>Login</Text>
                    </TouchableOpacity>
                )}
            </SafeAreaView>
            </div>
        </View>
    );
}
