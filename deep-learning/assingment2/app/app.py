from flask import Flask, render_template, request, jsonify
import pickle
import json
import numpy as np
import pandas as pd
from pathlib import Path
import random

app = Flask(__name__)

# Load models and scaler
MODEL_DIR = Path('models')
DATA_DIR = Path('data')

# Define Perceptron classes (required for unpickling)
class Perceptron:
    def __init__(self, learning_rate=0.01, n_epochs=100, random_state=42):
        self.learning_rate = learning_rate
        self.n_epochs = n_epochs
        self.random_state = random_state
        self.weights = None
        self.bias = None
        self.errors_per_epoch = []
        self.accuracy_per_epoch = []
        
    def fit(self, X, y):
        np.random.seed(self.random_state)
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0
        
        for epoch in range(self.n_epochs):
            errors = 0
            for idx in range(n_samples):
                x_i = X[idx]
                y_i = y[idx]
                linear_output = np.dot(x_i, self.weights) + self.bias
                y_predicted = self._activation(linear_output)
                update = self.learning_rate * (y_i - y_predicted)
                if update != 0:
                    self.weights += update * x_i
                    self.bias += update
                    errors += 1
            self.errors_per_epoch.append(errors)
            accuracy = self._calculate_accuracy(X, y)
            self.accuracy_per_epoch.append(accuracy)
        return self
    
    def predict(self, X):
        linear_output = np.dot(X, self.weights) + self.bias
        return self._activation(linear_output)
    
    def _activation(self, x):
        return np.where(x >= 0, 1, 0)
    
    def _calculate_accuracy(self, X, y):
        predictions = self.predict(X)
        return np.mean(predictions == y)

class WeightedPerceptron(Perceptron):
    def __init__(self, learning_rate=0.01, n_epochs=100, random_state=42, class_weight=None):
        super().__init__(learning_rate, n_epochs, random_state)
        self.class_weight = class_weight
        
    def fit(self, X, y):
        np.random.seed(self.random_state)
        n_samples, n_features = X.shape
        self.weights = np.zeros(n_features)
        self.bias = 0
        
        if self.class_weight == 'balanced':
            class_counts = np.bincount(y)
            total_samples = len(y)
            self.class_weights_dict = {
                0: total_samples / (2 * class_counts[0]),
                1: total_samples / (2 * class_counts[1])
            }
        elif isinstance(self.class_weight, dict):
            self.class_weights_dict = self.class_weight
        else:
            self.class_weights_dict = {0: 1.0, 1: 1.0}
        
        for epoch in range(self.n_epochs):
            errors = 0
            for idx in range(n_samples):
                x_i = X[idx]
                y_i = y[idx]
                linear_output = np.dot(x_i, self.weights) + self.bias
                y_predicted = self._activation(linear_output)
                weight_multiplier = self.class_weights_dict[y_i]
                update = self.learning_rate * (y_i - y_predicted) * weight_multiplier
                if update != 0:
                    self.weights += update * x_i
                    self.bias += update
                    errors += 1
            self.errors_per_epoch.append(errors)
            accuracy = self._calculate_accuracy(X, y)
            self.accuracy_per_epoch.append(accuracy)
        return self

def load_model(model_name):
    """Load a saved model"""
    with open(MODEL_DIR / f'{model_name}.pkl', 'rb') as f:
        return pickle.load(f)

def load_scaler():
    """Load the feature scaler"""
    with open(MODEL_DIR / 'feature_scaler.pkl', 'rb') as f:
        return pickle.load(f)

def load_metadata():
    """Load model metadata"""
    with open(MODEL_DIR / 'models_metadata.json', 'r') as f:
        return json.load(f)

# Load resources
scaler = load_scaler()
metadata = load_metadata()
feature_names = metadata['feature_names']

# Available models
MODELS = {
    'baseline_perceptron': 'Baseline Perceptron',
    'best_lr_perceptron': 'Best Learning Rate Perceptron',
    'best_epoch_perceptron': 'Best Epoch Perceptron',
    'weighted_perceptron_1to2': 'Weighted Perceptron (1:2) - BEST'
}

@app.route('/')
def index():
    """Home page"""
    return render_template('index.html', models=MODELS, features=feature_names)

@app.route('/load_data', methods=['POST'])
def load_data():
    """Load training or testing data"""
    data = request.json
    data_type = data.get('data_type', 'train')
    sample_size = data.get('sample_size', None)
    random_sample = data.get('random_sample', False)
    
    # Load data
    if data_type == 'train':
        df = pd.read_csv(DATA_DIR / 'train_data.csv')
    else:
        df = pd.read_csv(DATA_DIR / 'test_data.csv')
    
    # Random sampling if requested
    if random_sample and sample_size:
        sample_size = min(int(sample_size), len(df))
        df = df.sample(n=sample_size, random_state=random.randint(0, 10000))
    elif sample_size:
        sample_size = min(int(sample_size), len(df))
        df = df.head(sample_size)
    
    # Separate features and target
    X = df.drop('Outcome', axis=1)
    y = df['Outcome']
    
    return jsonify({
        'success': True,
        'num_samples': len(df),
        'num_features': len(X.columns),
        'diabetic_count': int(y.sum()),
        'non_diabetic_count': int((y == 0).sum()),
        'data_preview': df.head(10).to_dict('records')
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Make prediction with selected model(s)"""
    data = request.json
    model_names = data.get('models', [])
    input_data = data.get('input_data', None)
    data_type = data.get('data_type', 'train')
    sample_size = data.get('sample_size', None)
    random_sample = data.get('random_sample', False)
    
    # Load data if not providing manual input
    if input_data is None:
        if data_type == 'train':
            df = pd.read_csv(DATA_DIR / 'train_data.csv')
        else:
            df = pd.read_csv(DATA_DIR / 'test_data.csv')
        
        # Sampling
        if random_sample and sample_size:
            sample_size = min(int(sample_size), len(df))
            df = df.sample(n=sample_size, random_state=random.randint(0, 10000))
        elif sample_size:
            sample_size = min(int(sample_size), len(df))
            df = df.head(sample_size)
        
        X = df.drop('Outcome', axis=1).values
        y_true = df['Outcome'].values
    else:
        # Manual input
        X = np.array([input_data])
        y_true = None
    
    # Preprocess: handle zeros and scale
    X_processed = X.copy()
    
    # Replace zeros with median (same as training preprocessing)
    features_to_impute = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']
    feature_indices = {name: i for i, name in enumerate(feature_names)}
    
    for feature in features_to_impute:
        if feature in feature_indices:
            idx = feature_indices[feature]
            mask = X_processed[:, idx] == 0
            if mask.any():
                non_zero_values = X_processed[~mask, idx]
                if len(non_zero_values) > 0:
                    median_val = np.median(non_zero_values)
                    X_processed[mask, idx] = median_val
    
    # Scale features
    X_scaled = scaler.transform(X_processed)
    
    # Make predictions with selected models
    results = {}
    for model_name in model_names:
        model = load_model(model_name)
        predictions = model.predict(X_scaled)
        
        # Calculate metrics if we have true labels
        if y_true is not None:
            accuracy = np.mean(predictions == y_true)
            tp = np.sum((predictions == 1) & (y_true == 1))
            tn = np.sum((predictions == 0) & (y_true == 0))
            fp = np.sum((predictions == 1) & (y_true == 0))
            fn = np.sum((predictions == 0) & (y_true == 1))
            
            precision = tp / (tp + fp) if (tp + fp) > 0 else 0
            recall = tp / (tp + fn) if (tp + fn) > 0 else 0
            f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            results[model_name] = {
                'model_display_name': MODELS[model_name],
                'predictions': predictions.tolist(),
                'metrics': {
                    'accuracy': float(accuracy),
                    'precision': float(precision),
                    'recall': float(recall),
                    'f1_score': float(f1),
                    'confusion_matrix': {
                        'tp': int(tp),
                        'tn': int(tn),
                        'fp': int(fp),
                        'fn': int(fn)
                    }
                },
                'prediction_summary': {
                    'diabetic': int(np.sum(predictions == 1)),
                    'non_diabetic': int(np.sum(predictions == 0))
                }
            }
        else:
            # Single prediction without ground truth
            results[model_name] = {
                'model_display_name': MODELS[model_name],
                'prediction': int(predictions[0]),
                'prediction_label': 'Diabetic' if predictions[0] == 1 else 'Non-Diabetic'
            }
    
    return jsonify({
        'success': True,
        'results': results,
        'num_samples': len(X),
        'has_ground_truth': y_true is not None
    })

@app.route('/get_model_info', methods=['GET'])
def get_model_info():
    """Get information about all models"""
    model_info = []
    for model_data in metadata['models']:
        model_info.append({
            'name': model_data['model_name'],
            'display_name': MODELS.get(model_data['model_name'], model_data['model_name']),
            'description': model_data['description'],
            'metrics': model_data['metrics']
        })
    
    return jsonify({
        'success': True,
        'models': model_info,
        'best_model': metadata['best_model'],
        'feature_names': feature_names,
        'preprocessing_steps': metadata['preprocessing_steps']
    })

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5009)

