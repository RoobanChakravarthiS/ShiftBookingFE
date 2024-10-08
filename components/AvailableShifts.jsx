import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import { useFocusEffect } from '@react-navigation/native';

const AvailableShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState([]);
  const [selectedArea, setSelectedArea] = useState('');
  const [bookingShiftId, setBookingShiftId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await axios.get('http://192.168.76.154:8080/shifts');
          const data = response.data.map(shift => ({
            ...shift,
            status: shift.booked ? 'Booked' : '', // Set initial status
          }));
          setShifts(data);
          const uniqueAreas = [...new Set(data.map(shift => shift.area))];
          setAreas(uniqueAreas);
        } catch (error) {
          setErrorMessage('An error occurred while fetching shifts.');
          console.error('Fetching failed:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [])
  );


  const lengthFinder=(area)=>{
    let count=0;
    shifts.forEach(item=>{
        if(item.area===area){
          count++;
        }
    })
    return count
  }
 
  

  const groupByDate = shifts => {
    return shifts.reduce((acc, shift) => {
      const date = new Date(shift.startTime).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(shift);
      return acc;
    }, {});
  };

  


  const bookShift = async item => {
    try {
      setBookingShiftId(item.id);
      setErrorMessage('');

      const response = await axios.get(
        `http://192.168.76.154:8080/shifts/${item.id}/book`,
      );
      setShifts(prevShifts =>
        prevShifts.map(shift =>
          shift.id === item.id
            ? {...shift, booked: true, status: 'Booked'}
            : shift,
        ),
      );
      console.log('Booking successful:', response.data);
    } catch (error) {
      handleBookingError(error, item);
    } finally {
      setBookingShiftId(null);
    }
  };

  

  const cancelShift = async item => {
    try {
      setBookingShiftId(item.id);
      setErrorMessage('');

      const response = await axios.get(
        `http://192.168.76.154:8080/shifts/${item.id}/cancel`,
      );
      setShifts(prevShifts =>
        prevShifts.map(shift =>
          shift.id === item.id ? {...shift, booked: false, status: ''} : shift,
        ),
      );
      console.log('Cancellation successful:', response.data);
    } catch (error) {
      handleBookingError(error, item);
    } finally {
      setBookingShiftId(null);
    }
  };


  const handleBookingError = (error, item) => {
    const errorMessage =
      error?.response?.data?.message || 'An error occurred during booking.';
    setErrorMessage(errorMessage);

    let newStatus = 'Error';
    if (errorMessage === 'Cannot book an overlapping shift') {
      newStatus = 'Overlapping';
    } else if (errorMessage.includes('already booked')) {
      newStatus = 'Booked';
    } else if (errorMessage === 'Shift is already finished') {
      newStatus = 'Finished';
    } else if (errorMessage.includes('already started')) {
      newStatus = 'Started';
    } else if (errorMessage.includes('Shift not found')) {
      newStatus = 'Not Found';
    }

    setShifts(prevShifts =>
      prevShifts.map(shift =>
        shift.id === item.id ? {...shift, status: newStatus} : shift,
      ),
    );
    console.error('Booking failed:', errorMessage);
  };

  

  const sortedShifts = shifts
    .filter(shift => !selectedArea || shift.area === selectedArea)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const groupedShifts = groupByDate(sortedShifts);

  

  const isPastShift = shift => {
    return new Date(shift.endTime) < new Date();
  };

  

  const renderShiftItem = item => {
    const startTime = new Date(item.startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(item.endTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isPast = isPastShift(item);

    return (
      <View style={styles.shiftContainer} key={item.id}>
        <Text style={styles.time}>
          {startTime} - {endTime}
        </Text>
        <Text
          style={[
            styles.status,
            item.status === 'Overlapping' && {color: 'red'},
          ]}>
          {item.status}
        </Text>
        <TouchableOpacity
          style={[
            styles.bookButton,
            item.booked ? styles.cancelButton : null,
            isPast ? styles.unavailableButton : null,
          ]}
          disabled={bookingShiftId === item.id || isPast}
          onPress={() => (item.booked ? cancelShift(item) : bookShift(item))}>
          <Text
            style={[
              styles.buttonText,
              item.booked ? styles.cancelText : styles.bookText,
              isPast ? styles.unavailableText : null,
            ]}>
            {isPast ? (
              'Unavailable'
            ) : bookingShiftId === item.id ? (
              <Spinner color={(item.booked)?'red':"#16A64D"} />
            ) : item.booked ? (
              'Cancel'
            ) : (
              'Book'
            )}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  

  const renderDateSection = (date, shifts) => {
    return (
      <View key={date}>
        <Text style={styles.dateHeader}>
          {formattedCurrentDate === date ? 'Today' : date}
        </Text>

        {shifts.map(shift => renderShiftItem(shift))}
      </View>
    );
  };

  

  const handleAreaSelect = area => {
    setSelectedArea(area === selectedArea ? '' : area);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollView>
          <View style={styles.areaNav}>
            {areas.map(area => (
              <TouchableOpacity
                key={area}
                onPress={() => handleAreaSelect(area)}
                style={[
                  styles.areaButton,
                  selectedArea === area && styles.selectedArea,
                ]}>
                <Text style={{color: '#000'}}>{area} - {lengthFinder(area)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {errorMessage && (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          )}

          {Object.entries(groupedShifts).map(([date, shifts]) =>
            renderDateSection(date, shifts),
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default AvailableShifts;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f8fb',
  },
  areaNav: {
    flexDirection: 'row',
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  areaButton: {
    marginRight: 10,
    padding: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedArea: {
    backgroundColor: '#a0c4ff',
  },
  shiftContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f1f4f8',
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    backgroundColor: '#cbd2e1',
    padding: 5,
    color: '#4f6c92',
    // fontWeight:'bold'
  },
  bookButton: {
    borderRadius: 20,
    width: '30%',
    borderColor: '#55cb82',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  cancelButton: {
    borderColor: '#d9534f',
  },
  unavailableButton: {
    borderColor: '#a4b8d3',
    backgroundColor: '#f1f4f8',
  },
  time: {
    fontWeight: 'bold',
    color: '#a4b8d3',
  },
  buttonText: {
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#d9534f', 
  },
  bookText: {
    color: '#16a64d',
  },
  unavailableText: {
    color: '#a4b8d3', 
  },
  errorMessage: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  status: {
    fontWeight: 'bold',
    color: '#4f6c92',
  },
});
