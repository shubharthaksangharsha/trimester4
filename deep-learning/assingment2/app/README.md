# 🏥 Diabetes Prediction Web Application

An interactive web application for predicting diabetes using Perceptron neural network models with a beautiful Three.js animated background.

## Features

- 🎨 **Stunning Three.js Background Animation** - Interactive particle system and animated geometric shapes
- 📊 **Multiple Model Comparison** - Compare performance across 4 different Perceptron models
- 🔄 **Flexible Data Loading** - Load training or test data with optional random sampling
- ✍️ **Manual Input** - Enter patient data manually for instant predictions
- 📈 **Comprehensive Metrics** - View accuracy, recall, precision, F1-score, and confusion matrices
- 🎯 **Best Model Highlighted** - Weighted Perceptron (1:2) achieves 72% recall on diabetic patients

## Models Included

1. **Baseline Perceptron** (LR=0.01, Epochs=100)
   - Test Accuracy: 72.73%
   - Diabetic Recall: 37.93%

2. **Best Learning Rate Perceptron** (LR=0.01, Epochs=100)
   - Test Accuracy: 72.73%
   - Diabetic Recall: 37.93%

3. **Best Epoch Perceptron** (LR=0.01, Epochs=100)
   - Test Accuracy: 72.73%
   - Diabetic Recall: 37.93%

4. **Weighted Perceptron (1:2)** ⭐ **BEST MODEL**
   - Test Accuracy: 74.03%
   - Diabetic Recall: 72.41%
   - Significant improvement in detecting diabetic patients!

## Installation

1. **Navigate to the app directory:**
```bash
cd app
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

## Usage

1. **Start the Flask server:**
```bash
python app.py
```

2. **Open your browser and navigate to:**
```
http://localhost:5000
```

3. **Using the Application:**

### Option 1: Load Existing Data
- Select data source (Training or Test data)
- Optionally specify sample size
- Enable random sampling if desired
- Click "Load Data"

### Option 2: Manual Input
- Click "Show Manual Input"
- Enter values for all 8 features:
  - Pregnancies
  - Glucose
  - Blood Pressure
  - Skin Thickness
  - Insulin
  - BMI
  - Diabetes Pedigree Function
  - Age

### Making Predictions

1. **Single Model:**
   - Select "Select Single Model"
   - Check the model(s) you want to use
   - Click "Make Prediction"

2. **Compare All Models:**
   - Select "Compare All Models"
   - Click "Make Prediction"
   - View side-by-side comparison

## Features Input Guide

| Feature | Description | Normal Range |
|---------|-------------|--------------|
| Pregnancies | Number of times pregnant | 0-15 |
| Glucose | Plasma glucose concentration (mg/dL) | 70-200 |
| BloodPressure | Diastolic blood pressure (mm Hg) | 60-90 |
| SkinThickness | Triceps skin fold thickness (mm) | 10-50 |
| Insulin | 2-Hour serum insulin (μU/ml) | 15-276 |
| BMI | Body mass index (weight in kg/(height in m)²) | 18.5-40 |
| DiabetesPedigreeFunction | Diabetes pedigree function | 0.08-2.42 |
| Age | Age (years) | 21-81 |

## API Endpoints

### `GET /`
Returns the main application page

### `POST /load_data`
Load training or test data
```json
{
  "data_type": "train" | "test",
  "sample_size": 100,
  "random_sample": true | false
}
```

### `POST /predict`
Make predictions with selected models
```json
{
  "models": ["baseline_perceptron", "weighted_perceptron_1to2"],
  "data_type": "train" | "test",
  "sample_size": 100,
  "random_sample": true | false,
  "input_data": [6, 148, 72, 35, 0, 33.6, 0.627, 50]  // Optional manual input
}
```

### `GET /get_model_info`
Get information about all available models

## Project Structure

```
app/
├── app.py                  # Flask backend
├── requirements.txt        # Python dependencies
├── README.md              # This file
├── models/                # Trained models
│   ├── baseline_perceptron.pkl
│   ├── best_lr_perceptron.pkl
│   ├── best_epoch_perceptron.pkl
│   ├── weighted_perceptron_1to2.pkl
│   ├── feature_scaler.pkl
│   └── models_metadata.json
├── data/                  # Dataset files
│   ├── train_data.csv
│   └── test_data.csv
├── templates/             # HTML templates
│   └── index.html
└── static/               # Static assets
    ├── css/
    │   └── style.css
    └── js/
        ├── animation.js   # Three.js background
        └── main.js        # Main application logic
```

## Technology Stack

- **Backend:** Flask (Python)
- **Frontend:** HTML5, CSS3, JavaScript
- **3D Graphics:** Three.js
- **Machine Learning:** Scikit-learn, NumPy, Pandas
- **Models:** Custom Perceptron implementation with weighted updates

## Performance Highlights

The **Weighted Perceptron (1:2)** model achieved:
- ✅ 72.41% recall for diabetic patients (vs 37.93% baseline)
- ✅ 74.03% overall accuracy
- ✅ Reduced missed diagnoses by 56%
- ✅ Clinically relevant for diabetes screening

## Medical Implications

This model prioritizes **sensitivity (recall)** over precision, making it suitable for screening applications where:
- False negatives (missing diabetes) are more dangerous than false positives
- Follow-up testing can confirm positive predictions
- Early detection improves patient outcomes

## Credits

Built for Deep Learning Assignment 2 - Diabetes Prediction using Perceptron
- Dataset: Pima Indians Diabetes Database
- Models: Custom Perceptron implementation with class weighting
- Visualization: Three.js particle system and geometric animations

## License

Educational use only - Assignment 2 Project

---

**Note:** This application is for educational purposes and should not be used for actual medical diagnosis. Always consult healthcare professionals for medical advice.

