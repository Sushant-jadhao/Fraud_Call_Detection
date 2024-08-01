import re
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC


class PredictionModel(object):


    model = None
    dataSet = None
    vec  = None

    def loadDataset(self,dataset_path,newData ):

        self.dataSet = pd.read_csv(dataset_path)
        print(newData)
        for reports in newData:
            
            df2 = pd.DataFrame({'label': ['fraud'], 'content': [reports] })
            new_data = 0
            self.dataSet = pd.concat([self.dataSet , df2],ignore_index=True)

        self.dataSet.to_csv('updatedDataset.csv')
        
        self.train_text_classification_model(self.dataSet)


    def train_text_classification_model(self,dataset_path):
        # Read dataset
        data = self.dataSet

        # Preprocessing function
        def preprocess_text(text):
            # Remove special characters, punctuation, and numbers
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            # Convert to lowercase
            text = text.lower()
            return text

        # Apply preprocessing
        data['content'] = data['content'].apply(preprocess_text)

        # Split dataset into train and test sets
        X_train, X_test, y_train, y_test = train_test_split(data['content'], data['label'], test_size=0.2, random_state=42)

        # Vectorize text data
        vectorizer = TfidfVectorizer()
        X_train_vectorized = vectorizer.fit_transform(X_train)
        X_test_vectorized = vectorizer.transform(X_test)

        self.vec  = vectorizer

        # Train SVM classifier
        svm_classifier = SVC(probability=True)
        svm_classifier.fit(X_train_vectorized, y_train)

        # Define function for prediction

        # Return trained model and prediction function
        self.model = svm_classifier

        print("modelTrained", self.model)

    def predict_text(self,input_text):

        vectorizer = self.vec
        svm_classifier = self.model
        input_text = [input_text]
        input_vector = vectorizer.transform(input_text)
        prediction = svm_classifier.predict(input_vector)
        prediction_prob = svm_classifier.predict_proba(input_vector)
        confidence = np.max(prediction_prob)
        
        if prediction[0] == 'normal': 
            return "Normal", confidence
        else:
            return "Fraud", confidence

        

        #New data must be array

                