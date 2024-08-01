from flask import Flask, request, render_template
import requests
# import speech_recognition as sr 
import speech_recognition as sr  
import re
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import confusion_matrix, accuracy_score, recall_score, classification_report
import svm
import json


app = Flask(__name__)

PreBankeywords = {'1234567890' : 10 , "9420609831" : 2000} 

dataset_updated = []
dataset_link = "updatedDataset.csv"

modelUsed = svm.PredictionModel()
modelUsed.loadDataset(dataset_link , dataset_updated)
# def download_file(url ):
#     return requests.get(url)


# phoneFraudReports = {'a':'a'}
# f = open("phoneFraudReports.txt","w") 
# f.write(json.dumps(phoneFraudReports)) 


@app.route('/')
def index():
    return 'Server is running!'


@app.route('/upload', methods=['POST'])
def upload():  
    
    recognizer = sr.Recognizer()
    file = request.files['file']
    phoneNum = request.form['phone']
    audio_ex = sr.AudioFile(file)
    type(audio_ex)
    with audio_ex as source:
        audiodata = recognizer.record(audio_ex)
    type(audiodata)

    # Extract text
    text = recognizer.recognize_google(audio_data=audiodata, language='en-US')
    text = recognizer.recognize_google(audio_data=audiodata, language='hi-IN')
    from googletrans import Translator
    translator = Translator()
    translated_text = translator.translate(text, src='hi', dest='en')
    # return predict_text(translated_text.text)
    status , confidence = modelUsed.predict_text(translated_text.text)

    if(status == 'Normal'):

        if(confidence > 90):

            status = "Fraud"

    # return json.dumps({"tag" : status , "confidence" : str(confidence) , "text" : translated_text.text})
    return (status + ' $$$ ' + str(confidence) + " $$$ " + translated_text.text + " $$$ " + str(PreBankeywords.get(phoneNum,0)) )
    # return translated_text.text



@app.route('/report',methods=['POST'])
def report():

    if(request.method == 'POST'):

        data = request.form["data"]
        try:

            phone = request.form['phone']
            PreBankeywords[phone] = PreBankeywords.get(phone,0) + 1
        except:
            pass    


        dataToReport = data 
        global dataset_updated
        dataset_updated.append(dataToReport)
        modelUsed.loadDataset(dataset_link , dataset_updated)
        return "Added data to dataset"

@app.route('/uploadtext',methods=['POST'])
def uploadtext():

    if(request.method == 'POST'):

        status , confidence = modelUsed.predict_text(request.form['text'])

        if(status == 'Normal'):

            if(confidence > 90):

                status = "Fraud"

        # return json.dumps({"tag" : status , "confidence" : str(confidence) , "text" : translated_text.text})
        return (status + ' $$$ ' + str(confidence) + " $$$ " + request.form['text'] )

        


    
@app.route('/faq' )
def faq():
    return render_template("index.html")


 