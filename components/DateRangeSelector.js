// DateRangeSelector.js
import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, Button, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Calendar } from 'react-native-calendars';

export default function DateRangeSelector({ initialStartDate, initialEndDate, onDatesChange }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState({});
  const [startDate, setStartDate] = useState(initialStartDate ? new Date(initialStartDate) : null);
  const [endDate, setEndDate] = useState(initialEndDate ? new Date(initialEndDate) : null);

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
    const selectedDate = new Date(day.dateString);

    if (startDate && !endDate) {
      const range = getDatesInRange(startDate.toISOString().split('T')[0], day.dateString);
      range.forEach(date => {
        newMarkedDates[date] = {
          color: '#70d7c7',
          textColor: 'white'
        };
      });
      newMarkedDates[startDate.toISOString().split('T')[0]] = { startingDay: true, color: '#50cebb', textColor: 'white' };
      newMarkedDates[day.dateString] = { endingDay: true, color: '#50cebb', textColor: 'white' };
      setEndDate(selectedDate);
      onDatesChange({ startDate, endDate: selectedDate });
    } else {
      setStartDate(selectedDate);
      setEndDate(null);
      newMarkedDates = {
        [day.dateString]: { startingDay: true, color: '#50cebb', textColor: 'white' }
      };
      onDatesChange({ startDate: selectedDate, endDate: null });
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
      <Button title="เลือกวันที่เริ่มและสิ้นสุดการอบรม" onPress={() => setModalVisible(true)} color="#F89E6C" />
      <Text>วันที่เริ่มการอบรม: {startDate ? startDate.toDateString() : ''}</Text>
      <Text>วันที่สิ้นสุดการอบรม: {endDate ? endDate.toDateString() : ''}</Text>

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