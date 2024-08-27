import React from 'react';
import { View, SafeAreaView, Image, Text, TouchableOpacity  } from 'react-native';

export default function App() {
    return (
        <View style={{ backgroundColor: '#F8F5E4', flex: 1, padding: 20 }}>
            <SafeAreaView>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    
                    
                    
                }}>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 200,
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor: '#FFF',
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                        marginTop: 20
                    }}>
                        {/* กรอบรูปผู้ใช้ด้านซ้าย */}
                        <img src='../assets/images/หมา.jpg' style={{ height: 200, width: 200 }} />
                    </View>

                    {/* ข้อมูลผู้ใช้ด้านขวา */}
                    <View style={{ 
                        marginLeft: 200,  // เพิ่มระยะห่างจากรูป
                        flexDirection: 'column',  // ทำให้ข้อความแต่ละบรรทัดอยู่คนละบรรทัด
                        alignItems: 'flex-start',  // จัดข้อความให้อยู่ทางซ้าย
                        padding: 10,
                        borderRadius: 10,
                        backgroundColor: '#FFF',
                        shadowColor: '#000',
                        shadowOpacity: 0.1,
                        shadowRadius: 5,
                        marginTop: 20,
                        
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold' , lineHeight: 30 }}>บัญชีผู้ใช้</Text>
                        <Text style={{ lineHeight: 50 }}>ชื่อ-นามสกุล:     กัญญาณัฐ ฮุ้นสกุล</Text>
                        <Text style={{ lineHeight: 50 }}>Name:     Kanyanat Hoonsakul</Text>
                        <Text style={{ lineHeight: 50 }}>Email:     Kanyanatooo2003@gmail.com</Text>
                        <Text style={{ lineHeight: 50 }}>เบอร์โทร:     093-012-3277</Text>
                        <Text style={{ lineHeight: 50 }}>ที่อยู่:     123 หมู่ 4 ตำบลทดสอบ อำเภอทดสอบ จังหวัดทดสอบ</Text>
                    </View>
                </View>
                {/* ปุ่มออกจากระบบ */}
                <TouchableOpacity style={{
                    marginTop: 20,
                    backgroundColor: '#FF5C5C',
                    padding: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    width: 200
                }}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ออกจากระบบ</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}
