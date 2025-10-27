// Global variables
let loadedData = null;
let modelInfo = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadModelInfo();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Model selection mode
    document.querySelectorAll('input[name="selection-mode"]').forEach(radio => {
        radio.addEventListener('change', handleSelectionModeChange);
    });
}

// Handle selection mode change
function handleSelectionModeChange(event) {
    const checkboxes = document.querySelectorAll('.model-checkbox');
    
    if(event.target.value === 'compare') {
        // Check all models for comparison
        checkboxes.forEach(cb => cb.checked = true);
        checkboxes.forEach(cb => cb.disabled = true);
    } else {
        // Enable checkboxes for single selection
        checkboxes.forEach(cb => cb.disabled = false);
        checkboxes.forEach(cb => cb.checked = false);
    }
}

// Load model information
async function loadModelInfo() {
    try {
        const response = await fetch('/get_model_info');
        const data = await response.json();
        
        if(data.success) {
            modelInfo = data;
            displayModelCards(data.models, data.best_model);
        }
    } catch(error) {
        console.error('Error loading model info:', error);
        showAlert('Error loading model information', 'error');
    }
}

// Display model cards
function displayModelCards(models, bestModel) {
    const container = document.getElementById('model-cards');
    container.innerHTML = '';
    
    models.forEach(model => {
        const isBest = model.name === bestModel;
        const card = document.createElement('div');
        card.className = `model-card ${isBest ? 'best-model' : ''}`;
        
        card.innerHTML = `
            <h3>${model.display_name} ${isBest ? '[BEST]' : ''}</h3>
            <p>${model.description}</p>
            <div class="model-metrics">
                <div class="metric">
                    <div class="metric-label">Accuracy</div>
                    <div class="metric-value">${(model.metrics.test_accuracy * 100).toFixed(2)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Recall</div>
                    <div class="metric-value">${(model.metrics.diabetic_recall * 100).toFixed(2)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">Precision</div>
                    <div class="metric-value">${(model.metrics.diabetic_precision * 100).toFixed(2)}%</div>
                </div>
                <div class="metric">
                    <div class="metric-label">F1-Score</div>
                    <div class="metric-value">${model.metrics.f1_score.toFixed(4)}</div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Toggle manual input form
function toggleManualInput() {
    const form = document.getElementById('manual-input-form');
    const button = document.getElementById('manual-toggle-text');
    
    if(form.style.display === 'none') {
        form.style.display = 'block';
        button.textContent = 'Hide Manual Input';
    } else {
        form.style.display = 'none';
        button.textContent = 'Show Manual Input';
    }
}

// Load data from server
async function loadData() {
    const dataType = document.getElementById('data-type').value;
    const sampleSize = document.getElementById('sample-size').value;
    const randomSample = document.getElementById('random-sample').checked;
    
    showLoading(true);
    
    try {
        const response = await fetch('/load_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data_type: dataType,
                sample_size: sampleSize || null,
                random_sample: randomSample
            })
        });
        
        const data = await response.json();
        
        if(data.success) {
            loadedData = data;
            displayDataInfo(data);
            showAlert(`Loaded ${data.num_samples} samples successfully!`, 'success');
        } else {
            showAlert('Error loading data', 'error');
        }
    } catch(error) {
        console.error('Error:', error);
        showAlert('Error loading data', 'error');
    } finally {
        showLoading(false);
    }
}

// Display data information
function displayDataInfo(data) {
    document.getElementById('total-samples').textContent = data.num_samples;
    document.getElementById('diabetic-count').textContent = data.diabetic_count;
    document.getElementById('non-diabetic-count').textContent = data.non_diabetic_count;
    document.getElementById('feature-count').textContent = data.num_features;
    document.getElementById('data-info').style.display = 'block';
}

// Make prediction
async function makePrediction() {
    const selectionMode = document.querySelector('input[name="selection-mode"]:checked').value;
    let selectedModels = [];
    
    if(selectionMode === 'compare') {
        // Get all model names
        selectedModels = Array.from(document.querySelectorAll('.model-checkbox')).map(cb => cb.value);
    } else {
        // Get checked models
        selectedModels = Array.from(document.querySelectorAll('.model-checkbox:checked')).map(cb => cb.value);
        
        if(selectedModels.length === 0) {
            showAlert('Please select at least one model', 'error');
            return;
        }
    }
    
    // Check if using manual input
    const manualInputForm = document.getElementById('manual-input-form');
    let inputData = null;
    
    if(manualInputForm.style.display !== 'none') {
        // Get manual input values
        inputData = modelInfo.feature_names.map(feature => {
            const input = document.getElementById(`input-${feature}`);
            return parseFloat(input.value) || 0;
        });
        
        // Validate input
        if(inputData.every(val => val === 0)) {
            showAlert('Please enter valid feature values or load data', 'error');
            return;
        }
    } else if(!loadedData) {
        showAlert('Please load data first or use manual input', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const requestData = {
            models: selectedModels
        };
        
        if(inputData) {
            requestData.input_data = inputData;
        } else {
            requestData.data_type = document.getElementById('data-type').value;
            requestData.sample_size = document.getElementById('sample-size').value || null;
            requestData.random_sample = document.getElementById('random-sample').checked;
        }
        
        const response = await fetch('/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if(data.success) {
            displayResults(data, selectionMode === 'compare');
            showAlert('Prediction completed successfully!', 'success');
        } else {
            showAlert('Error making prediction', 'error');
        }
    } catch(error) {
        console.error('Error:', error);
        showAlert('Error making prediction', 'error');
    } finally {
        showLoading(false);
    }
}

// Display results
function displayResults(data, isComparison) {
    const resultsSection = document.getElementById('results-section');
    const resultsContainer = document.getElementById('results-container');
    
    resultsSection.style.display = 'block';
    resultsContainer.innerHTML = '';
    
    if(isComparison && data.has_ground_truth) {
        displayComparison(data.results, resultsContainer);
    } else if(data.has_ground_truth) {
        displayDetailedResults(data.results, resultsContainer);
    } else {
        displaySinglePrediction(data.results, resultsContainer);
    }
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

// Display comparison of all models
function displayComparison(results, container) {
    const comparisonDiv = document.createElement('div');
    comparisonDiv.className = 'result-card';
    
    let html = '<h3>Model Comparison</h3>';
    html += '<table class="comparison-table"><thead><tr>';
    html += '<th>Model</th><th>Accuracy</th><th>Recall</th><th>Precision</th><th>F1-Score</th>';
    html += '<th>True Positives</th><th>False Negatives</th></tr></thead><tbody>';
    
    Object.keys(results).forEach(modelName => {
        const result = results[modelName];
        const metrics = result.metrics;
        
        html += '<tr>';
        html += `<td><strong>${result.model_display_name}</strong></td>`;
        html += `<td>${(metrics.accuracy * 100).toFixed(2)}%</td>`;
        html += `<td>${(metrics.recall * 100).toFixed(2)}%</td>`;
        html += `<td>${(metrics.precision * 100).toFixed(2)}%</td>`;
        html += `<td>${metrics.f1_score.toFixed(4)}</td>`;
        html += `<td>${metrics.confusion_matrix.tp}</td>`;
        html += `<td>${metrics.confusion_matrix.fn}</td>`;
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    
    // Add visual comparison chart
    html += '<div class="metrics-grid" style="margin-top: 30px;">';
    Object.keys(results).forEach(modelName => {
        const result = results[modelName];
        const metrics = result.metrics;
        
        html += '<div class="stat-card">';
        html += `<h4>${result.model_display_name}</h4>`;
        html += `<div class="stat-value">${(metrics.recall * 100).toFixed(1)}%</div>`;
        html += `<div class="stat-label">Diabetic Recall</div>`;
        html += `<div style="margin-top: 10px;">`;
        html += `<small>Accuracy: ${(metrics.accuracy * 100).toFixed(1)}%</small><br>`;
        html += `<small>F1: ${metrics.f1_score.toFixed(3)}</small>`;
        html += `</div></div>`;
    });
    html += '</div>';
    
    comparisonDiv.innerHTML = html;
    container.appendChild(comparisonDiv);
}

// Display detailed results for individual models
function displayDetailedResults(results, container) {
    Object.keys(results).forEach(modelName => {
        const result = results[modelName];
        const metrics = result.metrics;
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        
        let html = `<h3>${result.model_display_name}</h3>`;
        
        // Metrics grid
        html += '<div class="metrics-grid">';
        html += `<div class="stat-card">
            <span class="stat-value">${(metrics.accuracy * 100).toFixed(2)}%</span>
            <span class="stat-label">Accuracy</span>
        </div>`;
        html += `<div class="stat-card">
            <span class="stat-value">${(metrics.recall * 100).toFixed(2)}%</span>
            <span class="stat-label">Recall (Sensitivity)</span>
        </div>`;
        html += `<div class="stat-card">
            <span class="stat-value">${(metrics.precision * 100).toFixed(2)}%</span>
            <span class="stat-label">Precision</span>
        </div>`;
        html += `<div class="stat-card">
            <span class="stat-value">${metrics.f1_score.toFixed(4)}</span>
            <span class="stat-label">F1-Score</span>
        </div>`;
        html += '</div>';
        
        // Confusion matrix
        html += '<h4 style="margin-top: 20px;">Confusion Matrix</h4>';
        html += '<div class="confusion-matrix">';
        html += `<div class="confusion-cell">
            <span class="value">${metrics.confusion_matrix.tn}</span>
            <span class="label">True Negatives</span>
        </div>`;
        html += `<div class="confusion-cell">
            <span class="value">${metrics.confusion_matrix.fp}</span>
            <span class="label">False Positives</span>
        </div>`;
        html += `<div class="confusion-cell">
            <span class="value">${metrics.confusion_matrix.fn}</span>
            <span class="label">False Negatives</span>
        </div>`;
        html += `<div class="confusion-cell">
            <span class="value">${metrics.confusion_matrix.tp}</span>
            <span class="label">True Positives</span>
        </div>`;
        html += '</div>';
        
        // Prediction summary
        html += '<div class="metrics-grid" style="margin-top: 20px;">';
        html += `<div class="stat-card">
            <span class="stat-value">${result.prediction_summary.diabetic}</span>
            <span class="stat-label">Predicted Diabetic</span>
        </div>`;
        html += `<div class="stat-card">
            <span class="stat-value">${result.prediction_summary.non_diabetic}</span>
            <span class="stat-label">Predicted Non-Diabetic</span>
        </div>`;
        html += '</div>';
        
        resultCard.innerHTML = html;
        container.appendChild(resultCard);
    });
}

// Display single prediction (manual input)
function displaySinglePrediction(results, container) {
    Object.keys(results).forEach(modelName => {
        const result = results[modelName];
        
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        
        const isPredictionDiabetic = result.prediction === 1;
        const color = isPredictionDiabetic ? '#f56565' : '#48bb78';
        
        let html = `<h3>${result.model_display_name}</h3>`;
        html += `<div class="stat-card" style="border-color: ${color}; margin-top: 20px;">`;
        html += `<span class="stat-value" style="color: ${color}; font-size: 3em;">`;
        html += `${result.prediction_label}</span>`;
        html += `<span class="stat-label" style="margin-top: 15px; font-size: 1.1em;">Prediction Result</span>`;
        html += '</div>';
        
        resultCard.innerHTML = html;
        container.appendChild(resultCard);
    });
}

// Show/hide loading overlay
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = show ? 'flex' : 'none';
}

// Show alert message
function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '10000';
    alertDiv.style.minWidth = '300px';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.style.transition = 'opacity 0.5s';
        alertDiv.style.opacity = '0';
        setTimeout(() => alertDiv.remove(), 500);
    }, 3000);
}

