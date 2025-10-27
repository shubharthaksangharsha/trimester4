// Global variables
let scene, camera, renderer, particles, animationId;
let cleaningTools = [];
let bubbles = [];
let mouseX = 0, mouseY = 0;

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    // Initialize Three.js
    initThreeJS();
    initCleaningAnimation();
    
    // Initialize interactive features
    initNavigation();
    initScrollAnimations();
    initCounterAnimations();
    initFormHandling();
    initServiceCards();
    initSmoothScrolling();
    
    // Start animations
    animate();
    
    // Remove loading screen after everything is loaded
    setTimeout(removeLoadingScreen, 2000);
}

// Three.js Setup and Animations
function initThreeJS() {
    const container = document.getElementById('three-container');
    if (!container) return;

    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create floating bubbles
    createBubbles();
    
    // Create cleaning tools
    createCleaningTools();
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    scene.add(directionalLight);

    // Camera position
    camera.position.z = 15;

    // Mouse interaction
    container.addEventListener('mousemove', onMouseMove);
    
    // Responsive resize
    window.addEventListener('resize', onWindowResize);
}

function createBubbles() {
    const bubbleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const bubbleMaterial = new THREE.MeshPhongMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.7,
        shininess: 100
    });

    for (let i = 0; i < 50; i++) {
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        
        bubble.position.x = (Math.random() - 0.5) * 20;
        bubble.position.y = (Math.random() - 0.5) * 20;
        bubble.position.z = (Math.random() - 0.5) * 20;
        
        bubble.userData = {
            velocityY: Math.random() * 0.02 + 0.01,
            velocityX: (Math.random() - 0.5) * 0.01,
            originalScale: Math.random() * 0.5 + 0.5
        };
        
        bubble.scale.setScalar(bubble.userData.originalScale);
        
        bubbles.push(bubble);
        scene.add(bubble);
    }
}

function createCleaningTools() {
    // Create spray bottle
    const sprayBottleGroup = new THREE.Group();
    
    // Bottle body
    const bottleGeometry = new THREE.CylinderGeometry(0.8, 1, 3, 16);
    const bottleMaterial = new THREE.MeshPhongMaterial({ color: 0x4A90E2 });
    const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
    sprayBottleGroup.add(bottle);
    
    // Spray nozzle
    const nozzleGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 8);
    const nozzleMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
    nozzle.position.y = 2;
    nozzle.rotation.z = Math.PI / 4;
    sprayBottleGroup.add(nozzle);
    
    sprayBottleGroup.position.set(-8, 2, 0);
    sprayBottleGroup.userData = { 
        rotationSpeed: 0.01,
        floatSpeed: 0.02,
        floatAmount: 1
    };
    
    cleaningTools.push(sprayBottleGroup);
    scene.add(sprayBottleGroup);

    // Create brush
    const brushGroup = new THREE.Group();
    
    // Brush handle
    const handleGeometry = new THREE.CylinderGeometry(0.2, 0.2, 4, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    brushGroup.add(handle);
    
    // Brush bristles
    const bristleGeometry = new THREE.CylinderGeometry(0.8, 0.6, 0.8, 16);
    const bristleMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const bristles = new THREE.Mesh(bristleGeometry, bristleMaterial);
    bristles.position.y = -2.4;
    brushGroup.add(bristles);
    
    brushGroup.position.set(8, -2, 2);
    brushGroup.userData = { 
        rotationSpeed: -0.008,
        floatSpeed: 0.025,
        floatAmount: 1.5
    };
    
    cleaningTools.push(brushGroup);
    scene.add(brushGroup);

    // Create vacuum cleaner
    const vacuumGroup = new THREE.Group();
    
    // Vacuum body
    const vacuumGeometry = new THREE.BoxGeometry(2, 1.5, 3);
    const vacuumMaterial = new THREE.MeshPhongMaterial({ color: 0xE74C3C });
    const vacuumBody = new THREE.Mesh(vacuumGeometry, vacuumMaterial);
    vacuumGroup.add(vacuumBody);
    
    // Vacuum hose
    const hoseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
    const hoseMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const hose = new THREE.Mesh(hoseGeometry, hoseMaterial);
    hose.position.set(1.5, 1, 0);
    hose.rotation.z = Math.PI / 3;
    vacuumGroup.add(hose);
    
    vacuumGroup.position.set(0, -5, -3);
    vacuumGroup.userData = { 
        rotationSpeed: 0.005,
        floatSpeed: 0.03,
        floatAmount: 0.8
    };
    
    cleaningTools.push(vacuumGroup);
    scene.add(vacuumGroup);
}

function initCleaningAnimation() {
    const container = document.getElementById('cleaning-animation');
    if (!container) return;

    // Create a second Three.js scene for the cleaning animation
    const cleaningScene = new THREE.Scene();
    const cleaningCamera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.1, 1000);
    const cleaningRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    cleaningRenderer.setSize(container.offsetWidth, container.offsetHeight);
    cleaningRenderer.setClearColor(0x000000, 0);
    container.appendChild(cleaningRenderer.domElement);

    // Add spinning sparkles
    const sparkleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    const sparkles = [];
    
    for (let i = 0; i < 20; i++) {
        const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
        sparkle.position.set(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        sparkles.push(sparkle);
        cleaningScene.add(sparkle);
    }

    cleaningCamera.position.z = 8;

    function animateCleaningScene() {
        requestAnimationFrame(animateCleaningScene);
        
        sparkles.forEach((sparkle, index) => {
            sparkle.rotation.x += 0.01;
            sparkle.rotation.y += 0.01;
            sparkle.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
        });
        
        cleaningRenderer.render(cleaningScene, cleaningCamera);
    }
    
    animateCleaningScene();
}

function onMouseMove(event) {
    const container = document.getElementById('three-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function onWindowResize() {
    const container = document.getElementById('three-container');
    if (!container || !camera || !renderer) return;
    
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);
    
    if (!scene || !camera || !renderer) return;

    // Animate bubbles
    bubbles.forEach(bubble => {
        bubble.position.y += bubble.userData.velocityY;
        bubble.position.x += bubble.userData.velocityX;
        
        // Reset bubble position when it goes too high
        if (bubble.position.y > 12) {
            bubble.position.y = -12;
            bubble.position.x = (Math.random() - 0.5) * 20;
        }
        
        // Gentle scaling animation
        const scale = bubble.userData.originalScale + Math.sin(Date.now() * 0.001) * 0.1;
        bubble.scale.setScalar(scale);
    });

    // Animate cleaning tools
    cleaningTools.forEach(tool => {
        tool.rotation.y += tool.userData.rotationSpeed;
        tool.position.y += Math.sin(Date.now() * tool.userData.floatSpeed) * 0.01;
    });

    // Mouse interaction with camera
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
}

// Navigation functionality
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 70;
                const elementPosition = target.offsetTop;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .feature-item, .contact-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
}

// Counter animations
function initCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number');
    let hasAnimated = false;

    const animateCounters = () => {
        if (hasAnimated) return;
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000;
            const start = 0;
            const increment = target / (duration / 16);
            let current = start;

            const timer = setInterval(() => {
                current += increment;
                counter.textContent = Math.floor(current);
                
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                }
            }, 16);
        });
        
        hasAnimated = true;
    };

    const statsSection = document.querySelector('.hero-stats');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
}

// Service cards interaction
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });

        // Add click interaction for mobile
        card.addEventListener('click', () => {
            const serviceType = card.getAttribute('data-service');
            // You can add more specific functionality here
            console.log(`Clicked on ${serviceType} service`);
        });
    });
}

// Form handling
function initFormHandling() {
    const contactForm = document.getElementById('contact-form');
    const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');
    
    // Form input animations
    formInputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });

    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual endpoint)
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Success state
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
                
                // Reset form
                contactForm.reset();
                formInputs.forEach(input => {
                    input.parentElement.classList.remove('focused');
                });
                
                // Show success message
                showNotification('Thank you! We\'ll get back to you soon.', 'success');
                
            } catch (error) {
                // Error state
                submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Try Again';
                showNotification('Something went wrong. Please try again.', 'error');
            }
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 3000);
        });
    }
}

// Button interactions
document.addEventListener('DOMContentLoaded', () => {
    const getQuoteBtn = document.getElementById('get-quote-btn');
    const learnMoreBtn = document.getElementById('learn-more-btn');
    
    if (getQuoteBtn) {
        getQuoteBtn.addEventListener('click', () => {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', () => {
            document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Loading screen
function removeLoadingScreen() {
    const loader = document.querySelector('.loading');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
            loader.remove();
        }, 500);
    }
}

// Particle cursor effect
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) {
        createParticle(e.clientX, e.clientY);
    }
});

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    particle.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        width: 6px;
        height: 6px;
        background: radial-gradient(circle, #2563eb, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        animation: particleFade 1s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 1000);
}

// Add particle animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(300px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes particleFade {
        0% { transform: scale(1) translateY(0); opacity: 1; }
        100% { transform: scale(0) translateY(-20px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Cleanup Three.js on page unload
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    if (scene) {
        scene.clear();
    }
    
    if (renderer) {
        renderer.dispose();
    }
});

// Performance optimization: Pause animations when page is not visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    } else {
        animate();
    }
});

// Easter egg: Konami code
let konamiCode = [];
const konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    
    if (konamiCode.length > konami.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.join(',') === konami.join(',')) {
        showNotification('🎉 You found the secret! Extra sparkle mode activated!', 'success');
        
        // Add extra sparkle effect
        document.body.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
        setTimeout(() => {
            document.body.style.background = '';
        }, 5000);
        
        konamiCode = [];
    }
}); 