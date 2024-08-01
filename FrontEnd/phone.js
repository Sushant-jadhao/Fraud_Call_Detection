import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [tag, setTag] = useState('processing'); // Initialize tag as 'processing'

  useEffect(() => {
    fetchData(); // Fetch data when component mounts
  }, []);

  const fetchData = async () => {
    try {
      // Perform your fetch request here
      const response = await fetch('https://api.example.com/data');
      const jsonData = await response.json();
      // Update state with fetched data
      setRecordings(jsonData.recordings);
      setTag(jsonData.tag);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  async function startRecording() {
    try {
      // Your recording logic here
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    try {
      // Your stop recording logic here
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.recordingContainer}>
          <Text style={styles.recordingText}>
            Recording #{index + 1} | {recordingLine.duration}
          </Text>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => downloadRecording(recordingLine.file)}>
            <Ionicons name="download" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContainer} onPress={() => recordingLine.sound.replayAsync()}>
            <Ionicons name="play" size={24} color="green" />
          </TouchableOpacity>
          <View style={[styles.tagContainer, { backgroundColor: recordingLine.tag === 'Fraud' ? 'red' : 'green' }]}>
            <Text style={styles.tagText}>{recordingLine.tag === 'Fraud' ? 'Fraud Detected' : 'All Okay!'}</Text>
          </View>
        </View>
      );
    });
  }

  async function downloadRecording(uri) {
    try {
      // Your download recording logic here
    } catch (error) {
      console.error('Failed to download recording:', error);
    }
  }

  function clearRecordings() {
    setRecordings([]);
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: isRecording ? '#FF6347' : '#32CD32' }]}
        onPress={isRecording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>
      {getRecordingLines()}
      {recordings.length > 0 && (
        <Button title="Clear Recordings" onPress={clearRecordings} color="#FF6347" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20, // Increased paddingHorizontal for more space on the sides
  },
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20, // Added marginBottom for spacing between recording containers
    padding: 10, // Reduced padding for a more compact look
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%', // Changed width to 100% for full width
  },
  recordingText: {
    flex: 1,
    marginHorizontal: 10, // Added marginHorizontal for spacing between text and buttons
    marginBottom: 5, // Added marginBottom for spacing between recording text and buttons
  },
  buttonContainer: {
    padding: 10, 
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#007bff',
    marginHorizontal: 10, //
  },
  tagContainer: {
    padding: 10,
    borderRadius: 5,
    width: '25%', 
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  button: {
    padding: 10, 
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
    marginBottom:10,
  },
  tagText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
