
        // Breed databases
        const cattleBreeds = [
            { name: "Jersey", info: "Small dairy breed producing rich, high-butterfat milk, golden-brown colored" },
            // { name: "Brahman", info: "Heat-resistant breed with distinctive hump, ideal for tropical climates" },
           
        ];

        const buffaloBreeds = [
            // { name: "Murrah Buffalo", info: "Premier dairy breed from India with excellent milk production" },
            // { name: "Jafarabadi Buffalo", info: "Large Indian breed with good milk yield and draught power" },
        ];

        // Camera and live analysis variables
        let currentStream = null;
        let currentMode = 'upload';
        let isLiveAnalysisActive = false;
        let liveAnalysisInterval = null;
        let currentFacingMode = 'environment';
        let availableCameras = [];
        let animationFrameId = null;
        
        // Matrix Rain Effect
        function createMatrixRain() {
            const matrixContainer = document.getElementById('matrixRain');
            if (!matrixContainer) return;
            
            const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
            
            function createMatrixChar() {
                const char = document.createElement('div');
                char.className = 'matrix-char';
                char.textContent = chars[Math.floor(Math.random() * chars.length)];
                char.style.left = Math.random() * 100 + '%';
                char.style.animationDuration = (Math.random() * 8 + 5) + 's';
                char.style.animationDelay = Math.random() * 2 + 's';
                matrixContainer.appendChild(char);
                
                setTimeout(() => {
                    if (char.parentNode) char.remove();
                }, 15000);
            }
            
            setInterval(createMatrixChar, 300);
        }
        
        // Counter animation function
        function animateCounter(element, target, duration = 2000) {
            const start = parseInt(element.textContent) || 0;
            const increment = (target - start) / (duration / 16);
            let current = start;
            
            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target;
                }
            };
            
            updateCounter();
        }
        
        // Initialize enhanced page functionality
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize Matrix Rain
            createMatrixRain();
            
            const counters = document.querySelectorAll('.counter');
            
            const observerOptions = {
                threshold: 0.5
            };
            
            const counterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = parseInt(entry.target.dataset.target);
                        animateCounter(entry.target, target);
                        counterObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            
            counters.forEach(counter => {
                counterObserver.observe(counter);
            });
            
            // Initialize slide-in animations
            const slideElements = document.querySelectorAll('.slide-in-left, .slide-in-right');
            const slideObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateX(0)';
                    }
                });
            }, observerOptions);
            
            slideElements.forEach(element => {
                element.style.opacity = '0';
                slideObserver.observe(element);
            });
        });

        // Scroll to classifier function
        function scrollToClassifier() {
            document.getElementById('classifier').scrollIntoView({
                behavior: 'smooth'
            });
        }

        // Mode switching functions
        function switchToUploadMode() {
            currentMode = 'upload';
            document.getElementById('uploadMode').classList.remove('hidden');
            document.getElementById('cameraMode').classList.add('hidden');
            document.getElementById('uploadModeBtn').classList.add('active');
            document.getElementById('cameraModeBtn').classList.remove('active');
            
            // Stop camera if active
            if (currentStream) {
                stopCamera();
            }
        }

        function switchToCameraMode() {
            currentMode = 'camera';
            document.getElementById('uploadMode').classList.add('hidden');
            document.getElementById('cameraMode').classList.remove('hidden');
            document.getElementById('uploadModeBtn').classList.remove('active');
            document.getElementById('cameraModeBtn').classList.add('active');
        }

        // Event listeners for mode buttons
        document.getElementById('uploadModeBtn').addEventListener('click', switchToUploadMode);
        document.getElementById('cameraModeBtn').addEventListener('click', switchToCameraMode);

        // File handling functions
        function handleDragOver(e) {
            e.preventDefault();
            e.currentTarget.classList.add('dragover');
        }

        function handleDragLeave(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('dragover');
        }

        function handleDrop(e) {
            e.preventDefault();
            e.currentTarget.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                displayImage(files[0]);
            }
        }

        function handleFileSelect(e) {
            const file = e.target.files[0];
            if (file) {
                displayImage(file);
            }
        }

        function displayImage(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewImage = document.getElementById('previewImage');
                previewImage.src = e.target.result;
                document.getElementById('imagePreview').classList.remove('hidden');
                document.getElementById('results').classList.add('hidden');
            };
            reader.readAsDataURL(file);
            
            // Clear file input
            const fileInput = document.getElementById('fileInput');
            fileInput.value = '';
        }

        function classifyImage() {
            // Enhanced loading animation
            const loadingOverlay = document.createElement('div');
            loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loadingOverlay.innerHTML = `
                <div class="bg-white p-8 rounded-2xl text-center shadow-2xl transform scale-0 transition-transform duration-300">
                    <div class="relative mb-6">
                        <div class="loading-spinner w-16 h-16 mx-auto mb-4"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                    <p class="text-lg font-semibold mb-2 typewriter">Analyzing image...</p>
                    <p class="text-gray-600 mb-4">Please wait while our AI processes the image</p>
                    
                    <!-- Progress steps -->
                    <div class="flex justify-center space-x-2 mb-4">
                        <div class="step-indicator w-3 h-3 bg-blue-600 rounded-full" style="animation-delay: 0s;"></div>
                        <div class="step-indicator w-3 h-3 bg-gray-300 rounded-full" style="animation-delay: 0.5s;"></div>
                        <div class="step-indicator w-3 h-3 bg-gray-300 rounded-full" style="animation-delay: 1s;"></div>
                        <div class="step-indicator w-3 h-3 bg-gray-300 rounded-full" style="animation-delay: 1.5s;"></div>
                    </div>
                    
                    <div class="text-sm text-gray-500">
                        <span class="processing-step">Preprocessing image...</span>
                    </div>
                </div>
            `;
            document.body.appendChild(loadingOverlay);
            
            // Animate modal appearance
            setTimeout(() => {
                loadingOverlay.querySelector('.bg-white').style.transform = 'scale(1)';
            }, 10);
            
            // Animate processing steps
            const steps = ['Preprocessing image...', 'Extracting features...', 'Running AI analysis...', 'Finalizing results...'];
            const stepIndicators = loadingOverlay.querySelectorAll('.step-indicator');
            const stepText = loadingOverlay.querySelector('.processing-step');
            
            steps.forEach((step, index) => {
                setTimeout(() => {
                    stepText.textContent = step;
                    if (stepIndicators[index]) {
                        stepIndicators[index].classList.remove('bg-gray-300');
                        stepIndicators[index].classList.add('bg-blue-600', 'animate-pulse');
                    }
                }, index * 500);
            });

            setTimeout(() => {
                // Animate modal disappearance
                loadingOverlay.querySelector('.bg-white').style.transform = 'scale(0)';
                setTimeout(() => {
                    document.body.removeChild(loadingOverlay);
                    showResults();
                }, 300);
            }, 2500);
        }

        function showResults() {
            // Simulate classification results
            const isCattle = Math.random() > 0.5;
            const breeds = isCattle ? cattleBreeds : buffaloBreeds;
            const selectedBreed = breeds[Math.floor(Math.random() * breeds.length)];
            const confidence = (85 + Math.random() * 12).toFixed(1);

            // Update results
            document.getElementById('resultType').textContent = isCattle ? 'Cattle' : 'Buffalo';
            document.getElementById('resultConfidence').textContent = confidence + '%';
            document.getElementById('resultBreed').textContent = selectedBreed.name;
            document.getElementById('breedInfo').textContent = selectedBreed.info;

            // Show results with animation
            const resultsSection = document.getElementById('results');
            resultsSection.classList.remove('hidden');
            setTimeout(() => {
                resultsSection.querySelector('.result-card').classList.add('show');
            }, 100);
        }

        function resetClassifier() {
            document.getElementById('imagePreview').classList.add('hidden');
            document.getElementById('results').classList.add('hidden');
            document.getElementById('fileInput').value = '';
        }

        // Camera functions
        async function startCamera() {
            try {
                // Get available cameras
                await getCameras();
                
                const constraints = {
                    video: {
                        facingMode: currentFacingMode,
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };

                currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                const video = document.getElementById('cameraVideo');
                video.srcObject = currentStream;

                document.getElementById('cameraNotStarted').classList.add('hidden');
                document.getElementById('cameraActive').classList.remove('hidden');

                // Show camera selector if multiple cameras available
                if (availableCameras.length > 1) {
                    document.getElementById('cameraSelector').classList.remove('hidden');
                }

            } catch (error) {
                console.error('Error accessing camera:', error);
                alert('Could not access camera. Please ensure camera permissions are granted.');
            }
        }

        async function getCameras() {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                availableCameras = devices.filter(device => device.kind === 'videoinput');
                
                const select = document.getElementById('cameraSelect');
                select.innerHTML = '<option value="">Select Camera</option>';
                
                availableCameras.forEach((camera, index) => {
                    const option = document.createElement('option');
                    option.value = camera.deviceId;
                    option.textContent = camera.label || `Camera ${index + 1}`;
                    select.appendChild(option);
                });

                select.addEventListener('change', switchCamera);
            } catch (error) {
                console.error('Error getting cameras:', error);
            }
        }

        async function switchCamera() {
            const select = document.getElementById('cameraSelect');
            const deviceId = select.value;
            
            if (deviceId && currentStream) {
                stopCamera();
                
                const constraints = {
                    video: {
                        deviceId: { exact: deviceId },
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }
                };

                try {
                    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
                    const video = document.getElementById('cameraVideo');
                    video.srcObject = currentStream;
                } catch (error) {
                    console.error('Error switching camera:', error);
                    startCamera(); // Fallback to default camera
                }
            }
        }

        function stopCamera() {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
                currentStream = null;
            }

            document.getElementById('cameraNotStarted').classList.remove('hidden');
            document.getElementById('cameraActive').classList.add('hidden');
            document.getElementById('liveResults').classList.add('hidden');
            
            // Stop live analysis
            if (isLiveAnalysisActive) {
                toggleLiveAnalysis();
            }
        }

        function flipCamera() {
            currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
            if (currentStream) {
                stopCamera();
                startCamera();
            }
        }

        function capturePhoto() {
            const video = document.getElementById('cameraVideo');
            const canvas = document.getElementById('captureCanvas');
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob and display in upload mode
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const previewImage = document.getElementById('previewImage');
                previewImage.src = url;
                
                // Switch to upload mode and show preview
                switchToUploadMode();
                document.getElementById('imagePreview').classList.remove('hidden');
            });
        }

        function toggleLiveAnalysis() {
            isLiveAnalysisActive = !isLiveAnalysisActive;
            const btn = document.getElementById('liveAnalysisBtn');
            const overlay = document.getElementById('liveAnalysis');
            const resultsPanel = document.getElementById('liveResults');
            
            // Add button animation
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 150);
            
            if (isLiveAnalysisActive) {
                btn.innerHTML = '⏸️ Stop Live Analysis';
                btn.classList.remove('bg-purple-600', 'hover:bg-purple-700');
                btn.classList.add('bg-red-600', 'hover:bg-red-700', 'pulse-glow');
                
                // Animate overlay appearance
                overlay.classList.remove('hidden');
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    overlay.style.opacity = '1';
                    overlay.style.transform = 'scale(1)';
                }, 10);
                
                // Animate results panel
                resultsPanel.classList.remove('hidden');
                resultsPanel.style.opacity = '0';
                resultsPanel.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    resultsPanel.style.opacity = '1';
                    resultsPanel.style.transform = 'translateY(0)';
                }, 200);
                
                // Start continuous analysis
                liveAnalysisInterval = setInterval(performLiveAnalysis, 3000);
                
                // Initial analysis
                setTimeout(() => performLiveAnalysis(), 500);
            } else {
                btn.innerHTML = '🔍 Start Live Analysis';
                btn.classList.remove('bg-red-600', 'hover:bg-red-700', 'pulse-glow');
                btn.classList.add('bg-purple-600', 'hover:bg-purple-700');
                
                // Animate overlay disappearance
                overlay.style.opacity = '0';
                overlay.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    overlay.classList.add('hidden');
                }, 300);
                
                // Animate results panel disappearance
                resultsPanel.style.opacity = '0';
                resultsPanel.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    resultsPanel.classList.add('hidden');
                }, 300);
                
                if (liveAnalysisInterval) {
                    clearInterval(liveAnalysisInterval);
                }
            }
        }

        function performLiveAnalysis() {
            // Show processing indicator with animation
            const processingIndicator = document.getElementById('processingIndicator');
            processingIndicator.classList.remove('hidden');
            
            // Show scanning animation
            const scanningOverlay = document.getElementById('scanningOverlay');
            scanningOverlay.classList.remove('hidden');
            
            setTimeout(() => {
                // Simulate real-time classification
                const isCattle = Math.random() > 0.5;
                const breeds = isCattle ? cattleBreeds : buffaloBreeds;
                const selectedBreed = breeds[Math.floor(Math.random() * breeds.length)];
                const confidence = (80 + Math.random() * 18).toFixed(1);
                
                // Animate the results update
                const classificationEl = document.getElementById('liveClassification');
                const confidenceEl = document.getElementById('liveConfidence');
                const breedEl = document.getElementById('liveBreed');
                
                // Add success animation
                classificationEl.classList.add('success-check');
                confidenceEl.classList.add('success-check');
                breedEl.classList.add('success-check');
                
                // Update live results with typewriter effect
                typewriterEffect(classificationEl, isCattle ? 'Cattle' : 'Buffalo');
                setTimeout(() => typewriterEffect(confidenceEl, `${confidence}%`), 200);
                setTimeout(() => typewriterEffect(breedEl, selectedBreed.name), 400);
                
                // Animate progress bars
                setTimeout(() => {
                    document.getElementById('classificationProgress').style.width = '100%';
                    document.getElementById('confidenceProgress').style.width = confidence + '%';
                    document.getElementById('breedProgress').style.width = '85%';
                }, 600);
                
                // Update detection box
                updateDetectionBox(isCattle ? 'Cattle' : 'Buffalo', confidence);
                
                // Hide processing indicators
                processingIndicator.classList.add('hidden');
                scanningOverlay.classList.add('hidden');
                
                // Remove animation classes after animation completes
                setTimeout(() => {
                    classificationEl.classList.remove('success-check');
                    confidenceEl.classList.remove('success-check');
                    breedEl.classList.remove('success-check');
                }, 600);
            }, 1500);
        }
        
        function typewriterEffect(element, text) {
            element.textContent = '';
            let i = 0;
            const interval = setInterval(() => {
                element.textContent += text.charAt(i);
                i++;
                if (i >= text.length) {
                    clearInterval(interval);
                }
            }, 50);
        }

        function updateDetectionBox(type, confidence) {
            const detectionBox = document.getElementById('detectionBox');
            const detectionLabel = document.getElementById('detectionLabel');
            
            detectionLabel.textContent = `${type} (${confidence}%)`;
            
            // Position detection box (simulated)
            const video = document.getElementById('cameraVideo');
            const videoRect = video.getBoundingClientRect();
            
            // Random position within video bounds (simulated detection)
            const x = Math.random() * (videoRect.width - 200);
            const y = Math.random() * (videoRect.height - 150);
            const width = 150 + Math.random() * 100;
            const height = 100 + Math.random() * 80;
            
            detectionBox.style.left = x + 'px';
            detectionBox.style.top = y + 'px';
            detectionBox.style.width = width + 'px';
            detectionBox.style.height = height + 'px';
            detectionBox.classList.remove('hidden');
            
            // Hide after 2 seconds
            setTimeout(() => {
                detectionBox.classList.add('hidden');
            }, 2000);
        }
