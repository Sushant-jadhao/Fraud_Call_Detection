# # import requests

# # # URL of your Flask application
# # url = 'http://127.0.0.1:5000/upload'

# # # Path to the audio file you want to upload
# # file_path = 'test.wav'

# # # Open the audio file in binary mode
# # with open(file_path, 'rb') as file:
# #     # Create a dictionary to store the file data
# #     files = {'file': file}
    
# #     # Send a POST request to upload the file
# #     response = requests.post(url, files=files)
    
# #     # Print the response from the Flask application
# #     print(response.text) 

# data = "ajinkyatest.wav"
# wav_path = r"C:\Users\anura\OneDrive\Desktop\Hackathon\hackathon111"
# import wavio
# wavio.write(wav_path , data, 16000 ,sampwidth=2)


# import speech_recognition as sr

# recognizer = sr.Recognizer()
# file = 'hinditest.wav'
# audio_ex = sr.AudioFile(file)
# type(audio_ex)
# with audio_ex as source:
#     audiodata = recognizer.record(audio_ex)
# type(audiodata)

# # Extract text
# text = recognizer.recognize_google(audio_data=audiodata, language='en-US')
# print(text) 


d = {}

for j in range(1000):

    s = input("Enter Keyword")
    if(s=="stop"):
        break
    d[s] = 1 

print(d)