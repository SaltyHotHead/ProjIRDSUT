import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import Cardcourse from '../../components/Cardcourse';

export default function TrainingUser() {
  const [feeType, setFeeType] = useState(null);
  const [trainingType, setTrainingType] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [openFeeType, setOpenFeeType] = useState(false);
  const [openTrainingType, setOpenTrainingType] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const onChangeStartDate = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate.toISOString().split('T')[0]);
    }
  };

  return (
    
      <View style={{ backgroundColor: '#F8F5E4', flex: 1, padding: 10 }}>
        <ScrollView>
          <View style={{ marginBottom: 20 }}>
            <DropDownPicker
              open={openFeeType}
              value={feeType}
              items={[
                { label: 'ไม่มีค่าธรรมเนียม', value: 'no-fee' },
                { label: 'มีค่าธรรมเนียม', value: 'with-fee' },
              ]}
              setOpen={setOpenFeeType}
              setValue={setFeeType}
              placeholder="เลือกประเภทค่าธรรมเนียม"
              style={{ width: 200, marginBottom: 10 }}
            />

            <DropDownPicker
              open={openTrainingType}
              value={trainingType}
              items={[
                { label: 'ออนไลน์', value: 'online' },
                { label: 'ออนไซต์', value: 'onsite' },
              ]}
              setOpen={setOpenTrainingType}
              setValue={setTrainingType}
              placeholder="เลือกประเภทการอบรม"
              style={{ width: 200, marginBottom: 10 }}
            />

            <Text style={{ marginBottom: 5, marginTop: 20 }}>เลือกช่วงเวลา:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput
                placeholder="เริ่มต้น (YYYY-MM-DD)"
                style={styles.dateInput}
                value={startDate}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.iconButton}>
                <Ionicons name="calendar-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput
                placeholder="สิ้นสุด (YYYY-MM-DD)"
                style={styles.dateInput}
                value={endDate}
                editable={false}
              />
              <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.iconButton}>
                <Ionicons name="calendar-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {showStartDatePicker && (
              <DateTimePicker
                testID="startDatePicker"
                value={startDate ? new Date(startDate) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeStartDate}
              />
            )}
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={endDate ? new Date(endDate) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeEndDate}
              />
            )}
          </View>
          
          <form className="d-flex">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'flex-end', // Align items to the right
            alignItems: 'center'
          }}>
            <Cardcourse />
          </View>
        </ScrollView>
      </View>
  
  );

}

const styles = StyleSheet.create({
  dateInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    flex: 1,
    paddingLeft: 10,
    marginBottom: 10
  },
  iconButton: {
    marginLeft: 10,
  }
});