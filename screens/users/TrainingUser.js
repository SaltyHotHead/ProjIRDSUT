import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigation } from '@react-navigation/native';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DatePicker } from '@mui/lab';

export default function TrainingUser() {
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
      text: course.invitation,
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
    <View style={{ backgroundColor: '#FFD7D0', flex: 1, padding: 30 }}>
      <div style={{ flexGrow: 1, padding: 16, overflowY: 'auto', height: '100vh' }}>
      <View style={styles.filterRow}>
        
        <View style={styles.pickerContainer}>
          <Text>ค่าธรรมเนียม  : </Text>
          <Picker
            selectedValue={feeFilter}
            onValueChange={(itemValue) => setFeeFilter(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="ทั้งหมด" value="all" />
            <Picker.Item label="ไม่มีค่าธรรมเนียม" value="no_fee" />
            <Picker.Item label="มีค่าธรรมเนียม" value="with_fee" />
          </Picker>
        </View>

        <View style={styles.pickerContainer}>
          <Text>ประเภทการอบรม  :  </Text>
          <Picker
            selectedValue={typeFilter}
            onValueChange={(itemValue) => setTypeFilter(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="ทั้งหมด" value="all" />
            <Picker.Item label="ออนไลน์" value="online" />
            <Picker.Item label="ออนไซต์" value="onsite" />
            <Picker.Item label="onsite & online" value="online&onsite" />
          </Picker>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(newValue) => setStartDate(newValue)}
          renderInput={(params) => <TextInput {...params} />}
        />

        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(newValue) => setEndDate(newValue)}
          renderInput={(params) => <TextInput {...params} />}
        />

      </View>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          <div style={{ height: '100%', width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' , paddingBottom: '100px'}}>
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
                    {course.description}
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

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 50,
  },
  searchInput: {
    height: 35,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  pickerContainer: {
    width: 180,
    marginHorizontal: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});