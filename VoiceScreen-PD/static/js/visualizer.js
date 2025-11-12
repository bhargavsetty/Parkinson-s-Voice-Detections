class ResultsVisualizer {
    constructor() {
        console.log("📊 ResultsVisualizer initialized");
        this.featuresGrid = document.getElementById('featuresGrid');
    }

    displayResults(results) {
        console.log("🎨 Displaying results:", results);
        
        try {
            this.updateRiskScore(results.risk_score);
            this.updateRiskLevel(results.risk_score, results.confidence);
            this.displayFeatures(results.features);
            this.updateRecommendation(results.risk_score);
            console.log("✅ All results displayed successfully");
        } catch (error) {
            console.error('❌ Error displaying results:', error);
        }
    }

    updateRiskScore(riskScore) {
        console.log(`📈 Updating risk score: ${riskScore}%`);
        
        // Update circle progress
        const circleProgress = document.getElementById('circleProgress');
        if (circleProgress) {
            const degrees = (riskScore / 100) * 360;
            circleProgress.style.transform = `rotate(${degrees}deg)`;
        }
        
        // Update percentage text
        const riskScoreElement = document.getElementById('riskScore');
        if (riskScoreElement) {
            riskScoreElement.textContent = riskScore;
        }
        
        // Update confidence
        const confidenceElement = document.getElementById('confidence');
        if (confidenceElement) {
            confidenceElement.textContent = Math.round((riskScore / 100 + 0.1) * 100);
        }
    }

    updateRiskLevel(riskScore, confidence) {
        console.log(`🎯 Updating risk level: ${riskScore}%`);
        
        const riskText = document.getElementById('riskText');
        const riskDescription = document.getElementById('riskDescription');
        const riskCard = document.getElementById('riskCard');
        
        if (!riskText || !riskDescription) {
            console.error('❌ Risk text elements not found');
            return;
        }
        
        let level, description, colorClass;
        
        if (riskScore < 30) {
            level = 'Low Risk';
            description = 'Your voice patterns show minimal indicators associated with Parkinson\'s disease.';
            colorClass = 'low-risk';
        } else if (riskScore < 70) {
            level = 'Moderate Risk';
            description = 'Some voice characteristics show patterns that may warrant further evaluation.';
            colorClass = 'moderate-risk';
        } else {
            level = 'High Risk';
            description = 'Multiple voice biomarkers show patterns associated with Parkinson\'s disease.';
            colorClass = 'high-risk';
        }
        
        riskText.textContent = level;
        riskDescription.textContent = description;
        
        // Update risk card styling
        if (riskCard) {
            riskCard.className = 'risk-score-card ' + colorClass;
        }
    }

    displayFeatures(features) {
        console.log("🔬 Displaying features:", features);
        
        if (!this.featuresGrid) {
            console.error('❌ Features grid not found');
            return;
        }
        
        if (!features) {
            console.warn('⚠️ No features provided');
            this.featuresGrid.innerHTML = '<div class="feature-item">No features available</div>';
            return;
        }
        
        this.featuresGrid.innerHTML = '';
        
        const importantFeatures = {
            'mean_f0': 'Pitch Stability',
            'std_f0': 'Pitch Variation', 
            'jitter_relative': 'Voice Jitter',
            'shimmer_relative': 'Voice Shimmer',
            'hnr': 'Voice Quality',
            'rms_energy': 'Vocal Strength'
        };
        
        Object.keys(importantFeatures).forEach(key => {
            if (features[key] !== undefined && features[key] !== null) {
                const featureItem = document.createElement('div');
                featureItem.className = 'feature-item';
                
                let value = features[key];
                let displayValue;
                
                // Format values based on their type
                if (key === 'mean_f0') {
                    displayValue = value.toFixed(0) + ' Hz';
                } else if (key === 'std_f0') {
                    displayValue = value.toFixed(1);
                } else if (key.includes('jitter') || key.includes('shimmer')) {
                    displayValue = (value * 100).toFixed(2) + '%';
                } else if (key === 'hnr') {
                    displayValue = value.toFixed(1) + ' dB';
                } else if (key === 'rms_energy') {
                    displayValue = value.toFixed(3);
                } else {
                    displayValue = typeof value === 'number' ? value.toFixed(4) : String(value);
                }
                
                featureItem.innerHTML = `
                    <div class="feature-name">${importantFeatures[key]}</div>
                    <div class="feature-value">${displayValue}</div>
                `;
                
                this.featuresGrid.appendChild(featureItem);
            }
        });
        
        // If no features were added, show a message
        if (this.featuresGrid.children.length === 0) {
            this.featuresGrid.innerHTML = '<div class="feature-item">Feature analysis unavailable</div>';
        }
        
        console.log(`✅ Displayed ${this.featuresGrid.children.length} features`);
    }

    updateRecommendation(riskScore) {
        console.log("💡 Updating recommendations");
        
        const recommendationText = document.getElementById('recommendationText');
        if (!recommendationText) {
            console.error('❌ Recommendation text element not found');
            return;
        }
        
        let recommendation;
        if (riskScore < 30) {
            recommendation = 'Based on your voice analysis, no immediate concerns detected. Your voice patterns appear within normal ranges. Continue with regular health monitoring.';
        } else if (riskScore < 70) {
            recommendation = 'Some voice patterns show moderate risk indicators. Consider consulting a healthcare professional for further evaluation. Regular monitoring is recommended.';
        } else {
            recommendation = 'Voice analysis shows patterns associated with higher risk. We recommend consulting a neurologist for comprehensive evaluation and professional medical advice.';
        }
        
        recommendationText.textContent = recommendation;
    }
}