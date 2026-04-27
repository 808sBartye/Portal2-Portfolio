// Projects Page - Three.js Hub with Interactive Portals
// TASK 07: MPA Setup & Three.js Hub Initialization

// Global variables
let scene, camera, renderer;
let hubPlane, portal1, portal2;
let raycaster, mouse;
let hoveredPortal = null;
let targetCameraPos = { x: 0, y: 0 };
let currentCameraPos = { x: 0, y: 0 };

// Configuration
const CONFIG = {
    fov: 45,
    portalScale: { x: 0.6, y: 0.8, z: 1 },  // Mniejsze portale
    // Portale na środku, nisko - bliżej podłogi
    portal1Pos: { x: -0.37, y: -0.5, z: 0.1 },
    portal2Pos: { x: 1.15, y: -0.5, z: 0.1 },
    // Lżejszy paralaks - subtelny ruch kamery jak w Education
    parallaxStrength: 0.08,
    parallaxMaxOffset: 0.15
};

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        CONFIG.fov,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 5;
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('webgl-container').appendChild(renderer.domElement);
    
    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Load textures and create scene
    const textureLoader = new THREE.TextureLoader();
    
    // Load all textures - nowe tło Hubu: office-bg.webp
    Promise.all([
        loadTexture(textureLoader, 'assets/projects/office-bg.webp'),
        loadTexture(textureLoader, 'assets/projects/postapo-bg.jpg'),
        loadTexture(textureLoader, 'assets/projects/offce-bg.jpg')
    ]).then(([hubTexture, portal1Texture, portal2Texture]) => {
        createHub(hubTexture);
        createPortals(portal1Texture, portal2Texture);
        
        // Hide loading text
        const loadingText = document.getElementById('loading-text');
        if (loadingText) loadingText.style.display = 'none';
        
        // Start animation loop
        animate();
        
        // Fade in
        setTimeout(() => {
            document.body.classList.remove('page-loading');
            document.body.classList.add('page-loaded');
        }, 100);
    }).catch(error => {
        console.error('Error loading textures:', error);
    });
    
    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    
    // Setup navigation
    setupNavigation();
}

// Helper: Load texture with promise
function loadTexture(loader, url) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
    });
}

// Create Hub background plane
function createHub(texture) {
    // Calculate plane size to cover viewport
    const aspect = window.innerWidth / window.innerHeight;
    const planeHeight = 5 * Math.tan((CONFIG.fov * Math.PI / 180) / 2) * 2;
    const planeWidth = planeHeight * aspect;
    
    const geometry = new THREE.PlaneGeometry(planeWidth * 1.2, planeHeight * 1.2);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        side: THREE.DoubleSide
    });
    
    hubPlane = new THREE.Mesh(geometry, material);
    hubPlane.position.z = 0;
    scene.add(hubPlane);
}

// Create interactive portals
function createPortals(texture1, texture2) {
    // Portal 1 - Overgrown (left side)
    const portal1Geometry = new THREE.CircleGeometry(1, 64);
    const portal1Material = new THREE.MeshBasicMaterial({ 
        map: texture1,
        side: THREE.DoubleSide,
        transparent: true
    });
    
    portal1 = new THREE.Mesh(portal1Geometry, portal1Material);
    portal1.position.set(CONFIG.portal1Pos.x, CONFIG.portal1Pos.y, CONFIG.portal1Pos.z);
    portal1.scale.set(CONFIG.portalScale.x, CONFIG.portalScale.y, CONFIG.portalScale.z);
    portal1.userData = { 
        id: 'portal1', 
        name: 'Overgrown',
        originalColor: new THREE.Color(1, 1, 1),
        hoverColor: new THREE.Color(1.3, 1.3, 1.3)
    };
    scene.add(portal1);
    
    // Portal 2 - Retro (right side)
    const portal2Geometry = new THREE.CircleGeometry(1, 64);
    const portal2Material = new THREE.MeshBasicMaterial({ 
        map: texture2,
        side: THREE.DoubleSide,
        transparent: true
    });
    
    portal2 = new THREE.Mesh(portal2Geometry, portal2Material);
    portal2.position.set(CONFIG.portal2Pos.x, CONFIG.portal2Pos.y, CONFIG.portal2Pos.z);
    portal2.scale.set(CONFIG.portalScale.x, CONFIG.portalScale.y, CONFIG.portalScale.z);
    portal2.userData = { 
        id: 'portal2', 
        name: 'Retro',
        originalColor: new THREE.Color(1, 1, 1),
        hoverColor: new THREE.Color(1.3, 1.3, 1.3)
    };
    scene.add(portal2);
}

// Handle mouse movement for raycasting and parallax
function onMouseMove(event) {
    // Update mouse coordinates for raycaster
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Update target camera position for parallax (inverted for natural feel)
    targetCameraPos.x = -mouse.x * CONFIG.parallaxStrength;
    targetCameraPos.y = -mouse.y * CONFIG.parallaxStrength;
    
    // Clamp camera movement
    targetCameraPos.x = Math.max(-CONFIG.parallaxMaxOffset, Math.min(CONFIG.parallaxMaxOffset, targetCameraPos.x));
    targetCameraPos.y = Math.max(-CONFIG.parallaxMaxOffset, Math.min(CONFIG.parallaxMaxOffset, targetCameraPos.y));
}

// Check for portal hover
function checkPortalHover() {
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects([portal1, portal2]);
    
    if (intersects.length > 0) {
        const object = intersects[0].object;
        
        if (hoveredPortal !== object) {
            // Mouse entered new portal
            if (hoveredPortal) {
                animatePortal(hoveredPortal, false);
            }
            hoveredPortal = object;
            animatePortal(hoveredPortal, true);
            document.body.style.cursor = 'pointer';
        }
    } else {
        if (hoveredPortal) {
            // Mouse left portal
            animatePortal(hoveredPortal, false);
            hoveredPortal = null;
            document.body.style.cursor = 'default';
        }
    }
}

// Animate portal brightness
function animatePortal(portal, isHovered) {
    const targetColor = isHovered ? portal.userData.hoverColor : portal.userData.originalColor;
    
    gsap.to(portal.material.color, {
        r: targetColor.r,
        g: targetColor.g,
        b: targetColor.b,
        duration: 0.3,
        ease: "power2.out"
    });
}

// Smooth camera parallax with LERP
function updateCameraParallax() {
    // LERP interpolation for smooth movement
    currentCameraPos.x += (targetCameraPos.x - currentCameraPos.x) * 0.05;
    currentCameraPos.y += (targetCameraPos.y - currentCameraPos.y) * 0.05;
    
    camera.position.x = currentCameraPos.x;
    camera.position.y = currentCameraPos.y;
    camera.lookAt(0, 0, 0);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update hub plane size
    if (hubPlane) {
        const aspect = window.innerWidth / window.innerHeight;
        const planeHeight = 5 * Math.tan((CONFIG.fov * Math.PI / 180) / 2) * 2;
        const planeWidth = planeHeight * aspect;
        hubPlane.geometry.dispose();
        hubPlane.geometry = new THREE.PlaneGeometry(planeWidth * 1.2, planeHeight * 1.2);
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    checkPortalHover();
    updateCameraParallax();
    
    renderer.render(scene, camera);
}

// Setup page navigation with fade
function setupNavigation() {
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || !href.includes('.html')) {
            return;
        }
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const overlay = document.querySelector('.page-transition-overlay');
            overlay.classList.add('fade-out');
            
            setTimeout(() => {
                window.location.href = href;
            }, 400);
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
