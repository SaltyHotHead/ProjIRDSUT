import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigation } from '@react-navigation/native';
import Banner from '../../components/banner.js';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [feeFilter, setFeeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const navigation = useNavigation();

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
      url: `https://Training.com/courses/${course.id}`,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareData.url).then(() => {
        alert('Link copied to clipboard');
      }).catch(console.error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFee = feeFilter === 'all' || (feeFilter === 'no_fee' && course.feetype === 'free') || (feeFilter === 'with_fee' && course.price > 0);
    const matchesType = typeFilter === 'all' || typeFilter === course.type.toLowerCase();
    const courseDate = new Date(course.date);
    const matchesDate = (!startDate || courseDate >= startDate) && (!endDate || courseDate <= endDate);
    return matchesSearch && matchesFee && matchesType && matchesDate;
  });

  return (
    <View style={{ backgroundColor: '#F8F5E4', flex: 1 }}>
      
      <div style={{ flexGrow: 1, padding: 16, overflowY: 'auto', height: '100vh' }}>
      <Banner />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
        
          <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {filteredCourses.map(course => (
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
                    {course.invitation}
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
                    {course.type}
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
                    ราคา : {course.feetype === 'free' ? 'ฟรี' : course.price}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleShare(course)}>Share</Button>
                  <Button size="small" className="nav-link" href="#" onClick={() => navigation.navigate('Training', { id: course.id })}>Learn More</Button>
                </CardActions>
              </Card>
            ))}
          </div>
        </View>
      </div>
    </View>
  );
}