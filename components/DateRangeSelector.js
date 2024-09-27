// DateRangeSelector.js
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Button, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function DateRangeSelector({ initialStartDate, initialEndDate, onDatesChange }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [startDate, setStartDate] = useState(initialStartDate || '');
  const [endDate, setEndDate] = useState(initialEndDate || '');

  useEffect(() => {
    if (initialStartDate && initialEndDate) {
      const range = getDatesInRange(initialStartDate, initialEndDate);
      const newMarkedDates = {};
      range.forEach(date => {
        newMarkedDates[date] = {
          color: '#70d7c7',
          textColor: 'white'
        };
      });
      newMarkedDates[initialStartDate] = { startingDay: true, color: '#50cebb', textColor: 'white' };
      newMarkedDates[initialEndDate] = { endingDay: true, color: '#50cebb', textColor: 'white' };
      setMarkedDates(newMarkedDates);
    }
  }, [initialStartDate, initialEndDate]);

  const onDayPress = (day) => {
    let newMarkedDates = {};
    if (startDate && !endDate) {
      const range = getDatesInRange(startDate, day.dateString);
      range.forEach(date => {
        newMarkedDates[date] = {
          color: '#70d7c7',
          textColor: 'white'
        };
      });
      newMarkedDates[startDate] = { startingDay: true, color: '#50cebb', textColor: 'white' };
      newMarkedDates[day.dateString] = { endingDay: true, color: '#50cebb', textColor: 'white' };
      setEndDate(day.dateString);
      onDatesChange({ startDate, endDate: day.dateString });
    } else {
      setStartDate(day.dateString);
      setEndDate('');
      newMarkedDates = {
        [day.dateString]: { startingDay: true, color: '#50cebb', textColor: 'white' }
      };
      onDatesChange({ startDate: day.dateString, endDate: '' });
    }
    setMarkedDates(newMarkedDates);
  };

  const getDatesInRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Select Date Range" onPress={() => setModalVisible(true)} />
      <Text>Start Date: {startDate}</Text>
      <Text>End Date: {endDate}</Text>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Calendar
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType={'period'}
            />
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    marginTop: 10,
    color: 'blue',
  },
});