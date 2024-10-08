import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState, useCallback} from 'react';
import axios from 'axios';
import Spinner from './Spinner';
import {useFocusEffect} from '@react-navigation/native';

const MyShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [cancelingShiftId, setCancelingShiftId] = useState(null);
  const currentDate = new Date();
  const formattedCurrentDate = currentDate.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  

  useFocusEffect(React.useCallback(()=>{
    const fetchData = async () => {
        console.log('Fetching booked shifts...');
        try {
          setLoading(true);
          const response = await axios.get('http://192.168.76.154:8080/shifts');
          const bookedShifts = response.data.filter(shift => shift.booked);
          setShifts(bookedShifts);
        } catch (err) {
          console.error('Error fetching shifts:', err);
          setErrorMessage('An error occurred while fetching shifts.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
  },[])
  );
  const calculateCumulativeTime = shifts => {
    let totalMilliseconds = 0;

    shifts.forEach(shift => {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      const difference = end - start; 
      totalMilliseconds += difference;
    });


    const totalMinutes = Math.floor(totalMilliseconds / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return {hours, minutes};
  };

  


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

  const cancelShift = async item => {
    console.log('Canceling shift:', item);
    try {
      setCancelingShiftId(item.id);
      setErrorMessage('');
      await axios.get(`http://192.168.76.154:8080/shifts/${item.id}/cancel`);
      setShifts(prevShifts => prevShifts.filter(shift => shift.id !== item.id));
      console.log('Cancellation successful');
    } catch (error) {
      console.error('Cancellation failed:', error);
      setErrorMessage(
        error?.response?.data?.message ||
          'An error occurred during cancellation.',
      );
    } finally {
      setCancelingShiftId(null);
    }
  };

  const groupedShifts = groupByDate(shifts);

  const renderShiftItem = item => {
    const startTime = new Date(item.startTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = new Date(item.endTime).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const isCancelable = Date.now() < item.startTime;

    return (
      <View  style={styles.shiftContainer} key={item.id}>
      <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={styles.time}>
          {startTime} - {endTime}
        </Text>
        <Text style={styles.status}>Booked</Text>
        <TouchableOpacity
          style={[styles.cancelButton, !isCancelable && styles.disabledButton]}
          disabled={!isCancelable || cancelingShiftId === item.id}
          onPress={() => cancelShift(item)}>
          <Text style={styles.buttonText}>
            {cancelingShiftId === item.id ? (
              <Spinner color="#d9534f" />
            ) : (
              'Cancel'
            )}
          </Text>
        </TouchableOpacity>
        </View>
        <Text style={{color:'#cbd2e1',marginTop:0,}}>{item.area}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <ScrollView>
          {shifts.length > 0 ? (
            Object.entries(groupedShifts).map(([date, shifts]) => (
              <View key={date}>
                <View style={styles.dateHeader}>
                  <Text style={styles.date}>
                    {formattedCurrentDate === date ? 'Today' : date}
                  </Text>

                  <Text style={styles.count}>{shifts.length} shifts</Text>
                  <Text style={styles.date}>
                    {calculateCumulativeTime(shifts).hours}h
                  </Text>
                </View>
                {shifts.map(shift => renderShiftItem(shift))}
              </View>
            ))
          ) : (
            <Text>No booked shifts found.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default MyShifts;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f8fb',
  },
  shiftContainer: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#f1f4f8',
    borderRadius: 5,
    flexDirection: 'col',
    // justifyContent: 'space-between',
    // alignItems: 'center',
  },
  cancelButton: {
    borderRadius: 20,
    width: '30%',
    borderColor: '#d9534f',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
  },
  time: {
    fontWeight: 'bold',
    color: '#a4b8d3',
  },
  buttonText: {
    color: '#d9534f',
    fontWeight: 'bold',
  },
  errorMessage: {
    color: 'red',
    marginVertical: 10,
    textAlign: 'center',
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    backgroundColor: '#cbd2e1',
    padding: 5,
    flexDirection: 'row',
    gap: 20,
  },
  status: {
    fontWeight: 'bold',
    color: '#4f6c92',
  },
  count: {
    color: '#4f6c92',
    fontWeight: 'bold',
  },
  date: {
    color: '#4f6c92',
    fontWeight: 'bold',
  },
});
