import React, { useEffect, useState } from 'react';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import { collection, getDocs } from '@firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db } from "../firebaseconfig";

const ExportToExcel = ({ route }) => {
  const { courseId } = route.params;
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEnrolledUsers = async () => {
      try {
        if (!courseId) {
          console.error("courseId is undefined");
          return;
        }
        const enrolUserCollectionRef = collection(db, "courses", courseId, "enroluser");
        const querySnapshot = await getDocs(enrolUserCollectionRef);
        const usersData = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        setEnrolledUsers(usersData);
        handleExport(usersData); // Trigger export after data is fetched
      } catch (error) {
        console.error("Error fetching enrolled users: ", error);
      }
    };

    fetchEnrolledUsers();
  }, [courseId]);

  const handleExport = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UserData');
    worksheet.columns = [
      { header: 'ชื่อสกุลผู้ใช้ภาษาไทย', key: 'thainame' , width: 30 },
      { header: 'ชื่อสกุลผู้ใช้ภาษาอังกฤษ', key: 'engname' , width: 30 },
      { header: 'ประเภท', key: 'type' , width: 15 },
      { header: 'ตำแหน่ง', key: 'rank' },
      { header: 'หน่วยงาน/สังกัด', key: 'institution' , width: 30 },
      { header: 'ที่อยู่', key: 'address' , width: 30 },
      { header: 'เบอร์โทรติดต่อ', key: 'tel' , width: 15 },
      { header: 'อีเมลล์', key: 'email' , width: 20 },
    ];

    data.forEach(item => {
      worksheet.addRow({
        thainame: item.thainame,
        engname: item.engname,
        type: item.type,
        rank: item.rank,
        institution: item.institution,
        address: item.address,
        tel: item.tel,
        email: item.email,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(blob, 'UserData.xlsx');

    // Navigate back after download is initiated
    navigation.goBack();
  };

  return <div>Exporting data...</div>; // Or you can return null if you don't want to render anything
};

export default ExportToExcel;
