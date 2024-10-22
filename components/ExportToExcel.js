import React, { useEffect, useState } from 'react';
import * as FileSaver from 'file-saver';
import * as ExcelJS from 'exceljs';
import { doc, getDoc } from '@firebase/firestore';
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

        // Fetch the course document to get enrolled users
        const courseDocRef = doc(db, "courses", courseId);
        const courseSnapshot = await getDoc(courseDocRef);
        
        if (courseSnapshot.exists()) {
          const courseData = courseSnapshot.data();
          const usersData = courseData.enrolledUsers || []; // Assuming enrolledUsers is an array of user IDs
          
          // Fetch user data for each enrolled user
          const userPromises = usersData.map(async (user) => {
            const userDocRef = doc(db, "users", user.id); // Assuming user.id is the ID of the user
            const userSnapshot = await getDoc(userDocRef);
            return userSnapshot.exists() ? { id: userSnapshot.id, ...userSnapshot.data() } : null;
          });

          // Wait for all user data to be fetched
          const fetchedUsers = await Promise.all(userPromises);
          // Filter out any null values (in case a user document doesn't exist)
          const validUsers = fetchedUsers.filter(user => user !== null);
          
          setEnrolledUsers(validUsers);
          handleExport(validUsers); // Trigger export after data is fetched
        } else {
          console.error("No such course document!");
        }
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
      { header: 'ชื่อสกุลผู้ใช้ภาษาไทย', key: 'thainame', width: 30 },
      { header: 'ชื่อสกุลผู้ใช้ภาษาอังกฤษ', key: 'engname', width: 30 },
      { header: 'ประเภท', key: 'type', width: 15 },
      { header: 'ตำแหน่ง', key: 'rank' },
      { header: 'หน่วยงาน/สังกัด', key: 'institution', width: 30 },
      { header: 'ที่อยู่', key: 'address', width: 30 },
      { header: 'เบอร์โทรติดต่อ', key: 'tel', width: 15 },
      { header: 'อีเมลล์', key: 'email', width: 20 },
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