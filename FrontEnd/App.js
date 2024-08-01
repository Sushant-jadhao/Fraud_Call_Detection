import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Platform, ScrollView, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [recording, setRecording] = useState();
  const [recordings, setRecordings] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [tag, setTag] = useState('processing');
  const [confidenceLevel, setConfidenceLevel] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [count, setCount] = useState(''); // New state for count

  async function startRecording() {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync({
          android: {
            extension: '.wav',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WAV,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 16000,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          ios: {
            extension: '.wav',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
            sampleRate: 16000,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });
        setRecording(recording);
        setIsRecording(true);
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    setRecording(undefined);

    await recording.stopAndUnloadAsync();
    let allRecordings = [...recordings];
    const { sound, status } = await recording.createNewLoadedSoundAsync();
    allRecordings.push({
      sound: sound,
      duration: getDurationFormatted(status.durationMillis),
      file: recording.getURI(),
      tag: tag,
      confidenceLevel: confidenceLevel,
      text: text
    });

    setRecordings(allRecordings);
    sendAudioToServer(recording.getURI());
    downloadAudioFile(recording.getURI());
  }

  async function fetchTagFromServer(responseText) {
    try {
      const dataArray = responseText.split('$$$');
      const fetchedTag = dataArray[0].trim();
      const fetchedConfidenceLevel = dataArray[1].trim();
      const fetchedText = dataArray[2].trim();
      const fetchedCount = dataArray[3].trim(); // Extract count from response
      setTag(fetchedTag);
      setConfidenceLevel(fetchedConfidenceLevel);
      setText(fetchedText);
      setCount(fetchedCount); // Set count in state
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to parse server response:', error);
      setIsLoading(false);
    }
  }

  async function sendAudioToServer(uri) {
  try {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
      name: 'audio.wav',
      type: 'audio/wav',
    });
    formData.append('phone', phoneNumber);

    const responseData = await fetch('http://172.20.10.7:5000/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const responseText = await responseData.text();
    console.log('Response Text:', responseText);
    fetchTagFromServer(responseText); // Call fetchTagFromServer to update state variables
    console.log('Tag:', tag);
    console.log('Audio sent successfully');
  } catch (error) {
    console.error('Failed to send audio:', error);
    setIsLoading(false);
  }
}


  async function downloadAudioFile(uri) {
    try {
      const fileUri = FileSystem.documentDirectory + 'audio.wav';
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });
      console.log('Downloaded audio file:', fileUri);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Failed to download audio file:', error);
    }
  }

  function getDurationFormatted(milliseconds) {
    const minutes = milliseconds / 1000 / 60;
    const seconds = Math.round((minutes - Math.floor(minutes)) * 60);
    return `${Math.floor(minutes)}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => {
      return (
        <View key={index} style={styles.recordingContainer}>
          <View style={styles.firstDiv}>
            <Text style={styles.recordingText}>
              Recording #{index + 1} | {recordingLine.duration}
            </Text>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => downloadRecording(recordingLine.file)}>
              <Ionicons name="download" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonContainer} onPress={() => recordingLine.sound.replayAsync()}>
              <Ionicons name="play" size={20} color="green" />
            </TouchableOpacity>
            <View style={[styles.tagContainer, { backgroundColor: recordingLine.tag === 'Fraud' ? 'red' : 'green' }]}>
              <Text style={styles.tagText}>{recordingLine.tag === 'Fraud' ? 'Fraud Detected' : 'All Okay!'}</Text>
            </View>
          </View>
          <View style={styles.secondDiv}>
  {isLoading ? (
    <Text>Loading...</Text>
  ) : (
    <>
      <Text style={styles.recordingText}>Text: {recordingLine.text}</Text>
      <Text style={styles.recordingText}>Confidence Level: {recordingLine.confidenceLevel}</Text>
      <Text style={styles.recordingText}>Count: {count}</Text> 
    </>
  )}
</View>

        </View>
      );
    });
  }

  async function downloadRecording(uri) {
    try {
      const fileUri = FileSystem.documentDirectory + 'audio.wav';
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });
      console.log('Downloaded audio file:', fileUri);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error('Failed to download recording:', error);
    }
  }

  function clearRecordings() {
    setRecordings([]);
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: isRecording ? '#FF6347' : '#32CD32' }]}
          onPress={isRecording ? stopRecording : startRecording}>
          <Text style={styles.buttonText}>{isRecording ? 'Stop Recording' : 'Start Recording'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          onChangeText={setPhoneNumber}
          value={phoneNumber}
          placeholder="Enter Phone Number"
        />
        {getRecordingLines()}
        {recordings.length > 0 && (
          <Button title="Clear Recordings" onPress={clearRecordings} color="#FF6347" />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  input: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  firstDiv: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
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
    width: '90%',
  },
  secondDiv: {
    padding: 10,
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
    width: '90%',
  },
  recordingText: {
    marginHorizontal: 10,
    marginBottom: 5,
    fontSize: 14,
  },
  buttonContainer: {
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#007bff',
    marginHorizontal: 5,
  },
  tagContainer: {
    padding: 8,
    borderRadius: 5,
    width: '25%',
    alignItems: 'center',
    backgroundColor: 'yellow',
  },
  button: {
    padding: 10,
    borderRadius: 5,
    width: '60%',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});