import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigation } from '@react-navigation/native'; // นำเข้า useNavigation เพื่อใช้ฟังก์ชันการนำทาง




const CardCourse = () => {
  const [courses, setCourses] = useState([]);

  const navigation = useNavigation(); // ใช้ useNavigation เพื่อเข้าถึง navigation object

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        const coursesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
    };

    fetchCourses();
  }, []);

  const handleShare = (course) => {
    const shareData = {
      title: course.name,
      text: course.description,
      url: `https://yourwebsite.com/courses/${course.id}`,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard');
      }).catch(console.error);
    }
  };

  return (
    <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
      {courses.map(course => (
        <Card key={course.id} style={{ width: 300, height: 'auto', margin: '50px' }}>
          <CardMedia
            sx={{ height: 500 }}
            image={course.imageUrl}
            title={course.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {course.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {course.description}
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small" onClick={() => handleShare(course)}>Share</Button>
            <Button size="small" className="nav-link " href="#" onClick={() => navigation.navigate('Training', { id: course.id })}>Learn More</Button>


          </CardActions>
        </Card>
      ))}
    </div>
  );
};

export default CardCourse;