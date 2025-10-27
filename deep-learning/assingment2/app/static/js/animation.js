// Three.js Background Animation
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('bg-canvas'),
    alpha: true,
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Create particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000;

const posArray = new Float32Array(particlesCount * 3);
const colors = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i+=3) {
    // Position
    posArray[i] = (Math.random() - 0.5) * 100;
    posArray[i + 1] = (Math.random() - 0.5) * 100;
    posArray[i + 2] = (Math.random() - 0.5) * 100;
    
    // Colors - gradient from blue to purple
    colors[i] = 0.4 + Math.random() * 0.3;     // R
    colors[i + 1] = 0.5 + Math.random() * 0.3; // G
    colors[i + 2] = 0.8 + Math.random() * 0.2; // B
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

// Material for particles
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.08,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

// Mesh
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Add some rotating torus shapes
const torusGeometry = new THREE.TorusGeometry(10, 0.5, 16, 100);
const torusMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x667eea,
    wireframe: true,
    transparent: true,
    opacity: 0.2
});
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
scene.add(torus);

// Another torus
const torus2 = new THREE.Mesh(
    new THREE.TorusGeometry(15, 0.3, 16, 100),
    new THREE.MeshStandardMaterial({ 
        color: 0x764ba2,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    })
);
torus2.rotation.x = Math.PI / 4;
scene.add(torus2);

// Add lights
const pointLight = new THREE.PointLight(0x667eea, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

// Add a directional light
const directionalLight = new THREE.DirectionalLight(0x764ba2, 0.5);
directionalLight.position.set(-5, 5, 5);
scene.add(directionalLight);

// Mouse movement effect
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate particles slowly
    particlesMesh.rotation.y += 0.0005;
    particlesMesh.rotation.x += 0.0002;
    
    // Rotate torus shapes
    torus.rotation.x += 0.005;
    torus.rotation.y += 0.003;
    torus.rotation.z += 0.002;
    
    torus2.rotation.x -= 0.003;
    torus2.rotation.y -= 0.005;
    torus2.rotation.z += 0.001;
    
    // Camera movement based on mouse position
    camera.position.x = mouseX * 2;
    camera.position.y = mouseY * 2;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Add some floating spheres representing neurons
const spheres = [];
for(let i = 0; i < 20; i++) {
    const geometry = new THREE.SphereGeometry(0.3, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: Math.random() > 0.5 ? 0x667eea : 0x48bb78,
        transparent: true,
        opacity: 0.6,
        emissive: Math.random() > 0.5 ? 0x667eea : 0x48bb78,
        emissiveIntensity: 0.3
    });
    const sphere = new THREE.Mesh(geometry, material);
    
    sphere.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40
    );
    
    sphere.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        )
    };
    
    scene.add(sphere);
    spheres.push(sphere);
}

// Animate spheres
function animateSpheres() {
    spheres.forEach(sphere => {
        sphere.position.add(sphere.userData.velocity);
        
        // Bounce off boundaries
        if(Math.abs(sphere.position.x) > 20) sphere.userData.velocity.x *= -1;
        if(Math.abs(sphere.position.y) > 20) sphere.userData.velocity.y *= -1;
        if(Math.abs(sphere.position.z) > 20) sphere.userData.velocity.z *= -1;
        
        // Pulse effect
        const scale = 1 + Math.sin(Date.now() * 0.001 + sphere.id) * 0.2;
        sphere.scale.set(scale, scale, scale);
    });
}

// Update animation loop
function animateWithSpheres() {
    requestAnimationFrame(animateWithSpheres);
    
    particlesMesh.rotation.y += 0.0005;
    particlesMesh.rotation.x += 0.0002;
    
    torus.rotation.x += 0.005;
    torus.rotation.y += 0.003;
    torus.rotation.z += 0.002;
    
    torus2.rotation.x -= 0.003;
    torus2.rotation.y -= 0.005;
    torus2.rotation.z += 0.001;
    
    animateSpheres();
    
    camera.position.x = mouseX * 2;
    camera.position.y = mouseY * 2;
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

animateWithSpheres();

