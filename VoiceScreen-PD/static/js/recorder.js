class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.canvas = null;
        this.canvasContext = null;
        this.recordingTimer = null;
        this.recordingStartTime = null;
    }

    async startRecording(visualizerCanvas) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 22050,
                    channelCount: 1
                } 
            });
            
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];
            
            this.setupAudioVisualization(visualizerCanvas);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            
            // Start recording timer
            this.startTimer();
            
            return true;
        } catch (error) {
            console.error('Error starting recording:', error);
            alert('Unable to access microphone. Please check your permissions.');
            return false;
        }
    }

    stopRecording() {
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.isRecording) {
                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    this.cleanup();
                    resolve(audioBlob);
                };
                
                this.mediaRecorder.stop();
                this.isRecording = false;
                this.stopTimer();
                
                // Stop all tracks
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }
            } else {
                resolve(null);
            }
        });
    }

    setupAudioVisualization(canvas) {
        this.canvas = canvas;
        this.canvasContext = canvas.getContext('2d');
        
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        
        const source = this.audioContext.createMediaStreamSource(this.stream);
        source.connect(this.analyser);
        
        this.visualize();
    }

    visualize() {
        if (!this.isRecording || !this.analyser) return;

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.isRecording) return;

            requestAnimationFrame(draw);
            
            this.analyser.getByteFrequencyData(dataArray);
            
            this.canvasContext.fillStyle = 'rgb(240, 240, 240)';
            this.canvasContext.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            const barWidth = (this.canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 2;
                
                this.canvasContext.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
                this.canvasContext.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);

                x += barWidth + 1;
            }
        };

        draw();
    }

    startTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
            
            const timerElement = document.getElementById('timer');
            if (timerElement) {
                timerElement.textContent = display;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.analyser = null;
        this.canvas = null;
        this.canvasContext = null;
    }
}