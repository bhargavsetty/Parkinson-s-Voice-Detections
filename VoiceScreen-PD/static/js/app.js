class VoiceScreenApp {
    constructor() {
        this.recorder = new AudioRecorder();
        this.visualizer = new ResultsVisualizer();
        this.isRecording = false;
        this.currentSection = 'recordSection';
        this.testHistory = [];
        this.settings = this.loadSettings();
        
        this.initializeEventListeners();
        this.setupNavigation();
        this.applySettings();
        this.loadHistory();
        console.log("🚀 VoiceScreen App Initialized");
    }

    initializeEventListeners() {
        // Recording controls
        const recordBtn = document.getElementById('recordBtn');
        const stopBtn = document.getElementById('stopBtn');
        const newTestBtn = document.getElementById('newTestBtn');
        
        if (recordBtn) recordBtn.addEventListener('click', () => this.startRecording());
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopRecording());
        if (newTestBtn) newTestBtn.addEventListener('click', () => this.resetApp());
        
        // History controls
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        if (clearHistoryBtn) clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Settings controls
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const resetSettingsBtn = document.getElementById('resetSettingsBtn');
        if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        if (resetSettingsBtn) resetSettingsBtn.addEventListener('click', () => this.resetSettings());
        
        // Report actions
        const saveReportBtn = document.getElementById('saveReportBtn');
        const shareReportBtn = document.getElementById('shareReportBtn');
        if (saveReportBtn) saveReportBtn.addEventListener('click', () => this.saveReport());
        if (shareReportBtn) shareReportBtn.addEventListener('click', () => this.shareReport());
        
        // Modal controls
        const infoBtn = document.getElementById('infoBtn');
        const closeModal = document.getElementById('closeModal');
        
        if (infoBtn) infoBtn.addEventListener('click', () => this.showModal());
        if (closeModal) closeModal.addEventListener('click', () => this.hideModal());
        
        // Close modal when clicking outside
        const modal = document.getElementById('infoModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'infoModal') this.hideModal();
            });
        }
        
        console.log("✅ Event listeners initialized");
    }

    setupNavigation() {
        // Bottom nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            if (!item.id) {
                item.addEventListener('click', (e) => {
                    const target = e.currentTarget.getAttribute('data-target');
                    if (target) this.showSection(target);
                });
            }
        });
    }

    // Settings Management
    loadSettings() {
        const defaultSettings = {
            audioQuality: 'medium',
            noiseReduction: true,
            autoStop: true,
            saveHistory: true,
            exportData: true,
            analytics: false,
            theme: 'auto',
            fontSize: 'medium',
            hapticFeedback: true
        };
        
        try {
            const saved = localStorage.getItem('voiceScreenSettings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            const settings = {
                audioQuality: document.getElementById('audioQuality').value,
                noiseReduction: document.getElementById('noiseReduction').checked,
                autoStop: document.getElementById('autoStop').checked,
                saveHistory: document.getElementById('saveHistory').checked,
                exportData: document.getElementById('exportData').checked,
                analytics: document.getElementById('analytics').checked,
                theme: document.getElementById('theme').value,
                fontSize: document.getElementById('fontSize').value,
                hapticFeedback: document.getElementById('hapticFeedback').checked
            };
            
            localStorage.setItem('voiceScreenSettings', JSON.stringify(settings));
            this.settings = settings;
            this.applySettings();
            this.showToast('Settings saved successfully!', 'success');
            console.log('✅ Settings saved:', settings);
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Error saving settings', 'error');
        }
    }

    resetSettings() {
        try {
            localStorage.removeItem('voiceScreenSettings');
            this.settings = this.loadSettings();
            this.populateSettingsForm();
            this.applySettings();
            this.showToast('Settings reset to defaults', 'success');
            console.log('✅ Settings reset to defaults');
        } catch (error) {
            console.error('Error resetting settings:', error);
            this.showToast('Error resetting settings', 'error');
        }
    }

    populateSettingsForm() {
        document.getElementById('audioQuality').value = this.settings.audioQuality;
        document.getElementById('noiseReduction').checked = this.settings.noiseReduction;
        document.getElementById('autoStop').checked = this.settings.autoStop;
        document.getElementById('saveHistory').checked = this.settings.saveHistory;
        document.getElementById('exportData').checked = this.settings.exportData;
        document.getElementById('analytics').checked = this.settings.analytics;
        document.getElementById('theme').value = this.settings.theme;
        document.getElementById('fontSize').value = this.settings.fontSize;
        document.getElementById('hapticFeedback').checked = this.settings.hapticFeedback;
    }

    applySettings() {
        // Apply theme
        this.applyTheme(this.settings.theme);
        
        // Apply font size
        document.documentElement.style.fontSize = this.getFontSizeValue(this.settings.fontSize);
        
        // Populate form with current settings
        this.populateSettingsForm();
        
        console.log('✅ Settings applied:', this.settings);
    }

    applyTheme(theme) {
        const html = document.documentElement;
        
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark-theme');
        } else {
            html.classList.remove('dark-theme');
        }
    }

    getFontSizeValue(size) {
        const sizes = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        return sizes[size] || '16px';
    }

    // History Management
    loadHistory() {
        try {
            if (!this.settings.saveHistory) {
                this.testHistory = [];
                return;
            }
            
            const saved = localStorage.getItem('voiceScreenHistory');
            this.testHistory = saved ? JSON.parse(saved) : [];
            this.updateHistoryDisplay();
            console.log('✅ History loaded:', this.testHistory.length, 'items');
        } catch (error) {
            console.error('Error loading history:', error);
            this.testHistory = [];
        }
    }

    saveToHistory(results) {
        if (!this.settings.saveHistory) return;
        
        try {
            const historyItem = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                riskScore: results.risk_score,
                confidence: results.confidence,
                features: results.features,
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString()
            };
            
            this.testHistory.unshift(historyItem);
            
            // Keep only last 50 items
            if (this.testHistory.length > 50) {
                this.testHistory = this.testHistory.slice(0, 50);
            }
            
            localStorage.setItem('voiceScreenHistory', JSON.stringify(this.testHistory));
            this.updateHistoryDisplay();
            console.log('✅ Saved to history:', historyItem);
        } catch (error) {
            console.error('Error saving to history:', error);
        }
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all test history? This action cannot be undone.')) {
            try {
                this.testHistory = [];
                localStorage.removeItem('voiceScreenHistory');
                this.updateHistoryDisplay();
                this.showToast('History cleared successfully', 'success');
                console.log('✅ History cleared');
            } catch (error) {
                console.error('Error clearing history:', error);
                this.showToast('Error clearing history', 'error');
            }
        }
    }

    updateHistoryDisplay() {
        const historyList = document.getElementById('historyList');
        const totalTests = document.getElementById('totalTests');
        const avgRisk = document.getElementById('avgRisk');
        const lastTest = document.getElementById('lastTest');
        
        if (!historyList) return;
        
        if (this.testHistory.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clipboard-list"></i>
                    <h4>No tests yet</h4>
                    <p>Your test history will appear here after you complete voice analyses.</p>
                </div>
            `;
        } else {
            historyList.innerHTML = this.testHistory.map(item => `
                <div class="history-item ${this.getRiskClass(item.riskScore)}" onclick="app.viewHistoryItem(${item.id})">
                    <div class="history-item-header">
                        <span class="history-date">${item.date} • ${item.time}</span>
                        <span class="history-risk ${this.getRiskClass(item.riskScore)}">${item.riskScore}%</span>
                    </div>
                    <div class="history-features">
                        <div class="history-feature">
                            Pitch: <span>${item.features?.mean_f0 ? item.features.mean_f0.toFixed(0) + ' Hz' : 'N/A'}</span>
                        </div>
                        <div class="history-feature">
                            Jitter: <span>${item.features?.jitter_relative ? (item.features.jitter_relative * 100).toFixed(2) + '%' : 'N/A'}</span>
                        </div>
                        <div class="history-feature">
                            HNR: <span>${item.features?.hnr ? item.features.hnr.toFixed(1) + ' dB' : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        
        // Update stats
        if (totalTests) totalTests.textContent = this.testHistory.length;
        if (avgRisk) {
            const average = this.testHistory.length > 0 
                ? Math.round(this.testHistory.reduce((sum, item) => sum + item.riskScore, 0) / this.testHistory.length)
                : 0;
            avgRisk.textContent = average + '%';
        }
        if (lastTest) {
            lastTest.textContent = this.testHistory.length > 0 
                ? this.testHistory[0].date 
                : '-';
        }
    }

    getRiskClass(riskScore) {
        if (riskScore < 30) return 'low-risk';
        if (riskScore < 70) return 'moderate-risk';
        return 'high-risk';
    }

    viewHistoryItem(itemId) {
        const item = this.testHistory.find(i => i.id === itemId);
        if (item) {
            // Display the historical result
            this.visualizer.displayResults(item);
            this.showSection('resultsSection');
            this.showToast('Viewing historical result', 'success');
        }
    }

    // Report Management
    saveReport() {
        const currentResults = this.getCurrentResults();
        if (!currentResults) {
            this.showToast('No results to save', 'warning');
            return;
        }
        
        try {
            const report = {
                ...currentResults,
                generatedAt: new Date().toISOString(),
                appVersion: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `voicescreen-report-${new Date().getTime()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Report downloaded successfully', 'success');
            console.log('✅ Report saved');
        } catch (error) {
            console.error('Error saving report:', error);
            this.showToast('Error saving report', 'error');
        }
    }

    shareReport() {
        if (navigator.share) {
            const currentResults = this.getCurrentResults();
            if (currentResults) {
                navigator.share({
                    title: 'VoiceScreen PD Report',
                    text: `My Parkinson's risk assessment: ${currentResults.riskScore}% risk`,
                    url: window.location.href
                }).then(() => {
                    this.showToast('Report shared successfully', 'success');
                }).catch(error => {
                    console.error('Error sharing:', error);
                    this.showToast('Sharing cancelled', 'warning');
                });
            }
        } else {
            this.showToast('Web Share API not supported', 'warning');
        }
    }

    getCurrentResults() {
        // This would return the current analysis results
        // For now, return a mock object
        return {
            riskScore: document.getElementById('riskScore')?.textContent || 0,
            confidence: document.getElementById('confidence')?.textContent || '0%',
            timestamp: new Date().toISOString()
        };
    }

    // Toast Notifications
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${this.getToastTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle'
        };
        return icons[type] || 'info-circle';
    }

    getToastTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning'
        };
        return titles[type] || 'Info';
    }

    // Existing methods from previous implementation...
    showSection(sectionId) {
        console.log(`🔄 Switching to section: ${sectionId}`);
        
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        } else {
            console.error(`❌ Section not found: ${sectionId}`);
            return;
        }
        
        // Update bottom nav
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const correspondingNav = document.querySelector(`[data-target="${sectionId}"]`);
        if (correspondingNav) {
            correspondingNav.classList.add('active');
        }
        
        this.currentSection = sectionId;
        
        // Update progress steps
        this.updateProgressSteps(sectionId);
        
        // Load history when showing history section
        if (sectionId === 'historySection') {
            this.loadHistory();
        }
        
        // Populate settings when showing settings section
        if (sectionId === 'settingsSection') {
            this.populateSettingsForm();
        }
    }

    updateProgressSteps(sectionId) {
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        switch(sectionId) {
            case 'recordSection':
                document.querySelector('[data-step="1"]').classList.add('active');
                break;
            case 'loadingSection':
                document.querySelector('[data-step="2"]').classList.add('active');
                break;
            case 'resultsSection':
                document.querySelector('[data-step="3"]').classList.add('active');
                break;
        }
    }

    async startRecording() {
        console.log("🎙️ Starting recording...");
        const visualizerCanvas = document.getElementById('visualizer');
        
        if (!visualizerCanvas) {
            console.error("❌ Visualizer canvas not found");
            return;
        }
        
        const success = await this.recorder.startRecording(visualizerCanvas);
        
        if (success) {
            this.isRecording = true;
            document.getElementById('recordBtn').disabled = true;
            document.getElementById('stopBtn').disabled = false;
            
            // Update UI
            const recordingStatus = document.getElementById('recordingStatus');
            if (recordingStatus) {
                recordingStatus.innerHTML = '<div class="status-dot recording"></div><span>Recording</span>';
            }
            
            const recordBtn = document.getElementById('recordBtn');
            if (recordBtn) {
                recordBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Recording...</span>';
            }
            
            console.log("✅ Recording started successfully");
        } else {
            console.error("❌ Failed to start recording");
        }
    }

    async stopRecording() {
        console.log("⏹️ Stopping recording...");
        
        document.getElementById('recordBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        this.isRecording = false;
        
        // Update UI
        const recordingStatus = document.getElementById('recordingStatus');
        if (recordingStatus) {
            recordingStatus.innerHTML = '<div class="status-dot"></div><span>Processing</span>';
        }
        
        const recordBtn = document.getElementById('recordBtn');
        if (recordBtn) {
            recordBtn.innerHTML = '<i class="fas fa-microphone"></i><span>Start Recording</span>';
        }
        
        // Show loading section
        this.showSection('loadingSection');
        console.log("🔄 Showing loading section");
        
        try {
            const audioBlob = await this.recorder.stopRecording();
            console.log(`🎹 Recording stopped. Blob size: ${audioBlob ? audioBlob.size : 0} bytes`);
            
            if (audioBlob && audioBlob.size > 0) {
                // Start analysis progress animation
                this.simulateAnalysisProgress();
                
                // Send to backend for analysis
                await this.analyzeAudio(audioBlob);
            } else {
                throw new Error('No audio data recorded or blob is empty');
            }
        } catch (error) {
            console.error('❌ Error in recording process:', error);
            this.showError('Recording failed. Please try again. Make sure you spoke for at least 2-3 seconds.');
            this.showSection('recordSection');
        }
    }

    simulateAnalysisProgress() {
        console.log("🔄 Starting analysis progress simulation");
        const steps = document.querySelectorAll('.analysis-step');
        let currentStep = 0;
        
        // Reset all steps first
        steps.forEach(step => step.classList.remove('active'));
        
        const progressInterval = setInterval(() => {
            if (currentStep > 0) {
                steps[currentStep - 1].classList.remove('active');
            }
            
            if (currentStep < steps.length) {
                steps[currentStep].classList.add('active');
                console.log(`📊 Analysis step ${currentStep + 1} completed`);
                currentStep++;
            } else {
                clearInterval(progressInterval);
                console.log("✅ All analysis steps completed");
            }
        }, 800);
    }

    async analyzeAudio(audioBlob) {
        console.log("📤 Sending audio for analysis...");
        
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob, 'recording.wav');
            
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });
            
            console.log(`📡 Response status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const results = await response.json();
            console.log("✅ Analysis results received:", results);
            
            if (results.error) {
                throw new Error(results.error);
            }
            
            // Save to history
            this.saveToHistory(results);
            
            // Show results section
            this.showSection('resultsSection');
            
            // Display the results
            this.displayAnalysisResults(results);
            
        } catch (error) {
            console.error('❌ Analysis error:', error);
            this.showError('Analysis failed: ' + error.message);
            this.showSection('recordSection');
        }
    }

    displayAnalysisResults(results) {
        console.log("📊 Displaying analysis results");
        
        try {
            this.visualizer.displayResults(results);
            console.log("✅ Results displayed successfully");
        } catch (error) {
            console.error('❌ Error displaying results:', error);
            this.showError('Error displaying results');
        }
    }

    showError(message) {
        this.showToast(message, 'error');
        console.error('💥 User Error:', message);
    }

    showModal() {
        const modal = document.getElementById('infoModal');
        if (modal) {
            modal.classList.add('active');
            console.log("ℹ️ Modal shown");
        }
    }

    hideModal() {
        const modal = document.getElementById('infoModal');
        if (modal) {
            modal.classList.remove('active');
            console.log("ℹ️ Modal hidden");
        }
    }

    resetApp() {
        console.log("🔄 Resetting app...");
        
        // Reset recording timer
        const timer = document.getElementById('timer');
        if (timer) {
            timer.innerHTML = '<i class="fas fa-clock"></i><span>00:00</span>';
        }
        
        // Clear visualizer
        const canvas = document.getElementById('visualizer');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Reset UI states
        const recordingStatus = document.getElementById('recordingStatus');
        if (recordingStatus) {
            recordingStatus.innerHTML = '<div class="status-dot"></div><span>Ready</span>';
        }
        
        // Show recording section
        this.showSection('recordSection');
        
        console.log("✅ App reset complete");
    }

    handleResize() {
        // Adjust visualizer canvas size for responsive design
        const canvas = document.getElementById('visualizer');
        if (canvas) {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth - 40;
        }
    }
}

// Make app globally available for history item clicks
window.app = new VoiceScreenApp();

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM fully loaded, initializing app...");
    window.app = new VoiceScreenApp();
});

// Handle any uncaught errors
window.addEventListener('error', (event) => {
    console.error('💥 Global error:', event.error);
});