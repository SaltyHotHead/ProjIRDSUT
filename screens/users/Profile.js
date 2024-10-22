import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Text, TouchableOpacity, TextInput, Image, StyleSheet } from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import Navbar from '../../components/Navbar';
import NavbarAdmin from '../../components/NavbarAdmin';
import DropDownPicker from 'react-native-dropdown-picker';

export default function Profile() {
    const [user, setUser] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [editableUser, setEditableUser] = useState({});
    const [type, setType] = useState('บุคลากรภายนอก');
    const [rank, setRank] = useState('');
    const [openRank, setOpenRank] = useState(false);
    const [selectedRank, setSelectedRank] = useState(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (isLoggedIn) {
            const fetchUserData = async () => {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    try {
                        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            setUser(userData);
                            setEditableUser(userData);
                            setSelectedRank(userData.rank); // Set the initial rank
                        } else {
                            console.error("No such document!");
                        }
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
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setUser(userData);
                setEditableUser(userData);
                setSelectedRank(userData.rank); // Set the initial rank
            } else {
                console.error("No such document!");
            }
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
                const updatedData = { ...editableUser, rank: selectedRank };
                await updateDoc(doc(db, "users", currentUser.uid), updatedData);
                setUser(updatedData);
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

    const RadioButton = ({ label, value, selectedValue, onSelect }) => (
        <TouchableOpacity style={styles.radioButtonContainer} onPress={() => onSelect(value)}>
            <View style={styles.radioButton}>
                {selectedValue === value && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.radioButtonLabel}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {renderNavbar()}
            <View style={{ flexGrow: 1, padding: 1, overflowY: 'auto', height: '100vh', justifyContent: 'center', alignItems: 'center', paddingBottom: '100px' }}>
                <View style={{ backgroundColor: '#FFF8E1', flex: 1, padding: 20, display: 'flex', alignItems: 'center' }}>
                    <SafeAreaView style={styles.safeArea}>
                        {isLoggedIn ? (
                            <>
                                <View style={styles.profileContainer}>
                                    <View style={styles.avatarContainer}>
                                        <img src='../assets/images/user2.png' style={{ width: 100, height: 100 }} />
                                    </View>
                                </View>
                                <View style={styles.infoContainer}>
                                    {isEditing ? (
                                        <>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>ชื่อสกุลภาษาไทย:</Text>
                                                <TextInput
                                                    value={editableUser.thainame}
                                                    onChangeText={(text) => setEditableUser({ ...editableUser, thainame: text })}
                                                    style={styles.input}
                                                />
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>ชื่อสกุลภาษาอังกฤษ:</Text>
                                                <TextInput
                                                    value={editableUser.engname}
                                                    onChangeText={(text) => setEditableUser({ ...editableUser, engname: text })}
                                                    style={styles.input}
                                                />
                                            </View>
                                            <View style={styles.radioGroup}>
                                                <Text style={styles.label}>ประเภท:</Text>
                                                <RadioButton
                                                    label="บุคลากรภายนอก"
                                                    value="บุคลากรภายนอก"
                                                    selectedValue={type}
                                                    onSelect={(value) => {
                                                        setType(value);
                                                        setEditableUser({ ...editableUser, type: value }); // Update editableUser as well
                                                    }}
                                                />
                                                <RadioButton
                                                    label="บุคลากรภายใน"
                                                    value="บุคลากรภายใน"
                                                    selectedValue={type}
                                                    onSelect={(value) => {
                                                        setType(value);
                                                        setEditableUser({ ...editableUser, type: value }); // Update editableUser as well
                                                    }}
                                                />
                                            </View>
                                            {type === 'บุคลากรภายใน' && (
                                                <DropDownPicker
                                                    open={openRank}
                                                    value={selectedRank}
                                                    items={[
                                                        { label: 'ศ. ดร.', value: 'ศ. ดร.' },
                                                        { label: 'ศ.', value: 'ศ.' },
                                                        { label: 'รศ. ดร.', value: 'รศ. ดร.' },
                                                        { label: 'รศ.', value: 'รศ.' },
                                                        { label: 'ผศ. ดร.', value: 'ผศ. ดร.' },
                                                        { label: 'ผศ.', value: 'ผศ.' },
                                                        { label: 'อ. ดร.', value: 'อ. ดร.' },
                                                        { label: 'อ.', value: 'อ.' },
                                                        { label: 'อื่นๆ', value: 'อื่นๆ' },
                                                    ]}
                                                    setOpen={setOpenRank}
                                                    setValue={setSelectedRank}
                                                    setItems={setRank}
                                                    style={styles.dropdown}
                                                    containerStyle={{ width: '100%' }}
                                                    placeholder="เลือกตำแหน่ง"
                                                />
                                            )}
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>หน่วยงาน/สังกัด:</Text>
                                                <TextInput
                                                    value={editableUser.institution}
                                                    onChangeText={(text) => setEditableUser({ ...editableUser, institution: text })}
                                                    style={styles.input}
                                                />
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>เบอร์ติดต่อ:</Text>
                                                <TextInput
                                                    value={editableUser.tel}
                                                    onChangeText={(text) => setEditableUser({ ...editableUser, tel: text })}
                                                    style={styles.input}
                                                />
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>อีเมล:</Text>
                                                <TextInput
                                                    value={editableUser.email}
                                                    onChangeText={(text) => setEditableUser({ ...editableUser, email: text })}
                                                    style={styles.input}
                                                />
                                            </View>
                                            <View style={styles.inputContainer}>
                                                <Text style={styles.label}>ที่อยู่:</Text>
                                                <TextInput
                                                    value={editableUser.address}
                                                    onChangeText={(text) => setEditableUser({ ...editableUser, address: text })}
                                                    style={styles.input}
                                                />
                                            </View>
                                            {/* Back Button */}
                                            <View style={styles.centeredButtonContainer}>
                                                <TouchableOpacity
                                                    style={styles.backButton}
                                                    onPress={handleEditToggle} // Disable edit mode
                                                >
                                                    <Text style={styles.buttonText}>ย้อนกลับ</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </>
                                    ) : (
                                        <>
                                            <View style={styles.infoContainer}>
                                            <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>ชื่อสกุลภาษาไทย:</Text>
                                                    <Text style={styles.infoText}>{user.thainame}</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>ชื่อสกุลภาษาอังกฤษ:</Text>
                                                    <Text style={styles.infoText}>{user.engname}</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>ประเภท:</Text>
                                                    <Text style={styles.infoText}>{user.type}</Text>
                                                </View>
                                                {type === 'บุคลากรภายใน' && (
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>ตำแหน่ง:</Text>
                                                    <Text style={styles.infoText}>{user.rank}</Text>
                                                </View>
                                                )}
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>หน่วยงาน/สังกัด:</Text>
                                                    <Text style={styles.infoText}>{user.institution}</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>อีเมล:</Text>
                                                    <Text style={styles.infoText}>{user.email}</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>เบอร์ติดต่อ:</Text>
                                                    <Text style={styles.infoText}>{user.tel}</Text>
                                                </View>
                                                <View style={styles.inputContainer}>
                                                    <Text style={styles.label}>ที่อยู่:</Text>
                                                    <Text style={styles.infoText}>{user.address}</Text>
                                                </View>
                                            </View>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    label: {
        marginRight: 10, // Space between label and input
        fontSize: 16,
        width: 180, // Fixed width for labels to align inputs
    },
    input: {
        flex: 1, // Allow the input to take the remaining space
        height: 40, // Set a consistent height
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5, // Rounded corners
        paddingHorizontal: 10, // Padding inside the input
        backgroundColor: '#fff', // Background color for the input
    },
    infoText: {
        fontSize: 18,
        padding: 10,

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
    centeredButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center', // Center the button horizontally
        marginTop: 20, // Add some margin for spacing
        width: '100%', // Ensure it takes full width
    },
    backButton: {
        backgroundColor: '#FF5722', // Different color for back button
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
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'gray',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 5,
    },
    radioButtonSelected: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: 'blue',
    },
    radioButtonLabel: {
        marginRight: 15,
    },
    dropdown: {
        marginBottom: 10,
    },
});