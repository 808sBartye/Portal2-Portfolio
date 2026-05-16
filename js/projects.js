// Projects Page - Three.js Hub with Interactive Portals
// TASK 07: MPA Setup & Three.js Hub Initialization

// Global variables
let scene, camera, renderer;
let composer; // EffectComposer dla post-processing (Bloom)
let hubPlane, portal1, portal2;
let ring1, ring2; // Shader ringi
let particles1, particles2; // Cząsteczki energii wokół portali
let robotPbody, robotAtlas; // Roboty jako invisible meshe dla pozycji
let menuMeshes = []; // Invisible meshe dla pozycji menu
let raycaster, mouse;
let hoveredPortal = null;
let targetCameraPos = { x: 0, y: 0 };
let currentCameraPos = { x: 0, y: 0 };
let targetHubPos = { x: 0, y: 0 };
let currentHubPos = { x: 0, y: 0 };

// Configuration
const CONFIG = {
    fov: 45,
    portalScale: { x: 0.5, y: 0.7, z: 1 }, // Mniejsze portale pasujące do ringów
    // Portale na środku, nisko - bliżej podłogi
    portal1Pos: { x: -0.37, y: -0.5, z: 0.1 },
    portal2Pos: { x: 1.15, y: -0.5, z: 0.1 },
    // Mocniejszy paralaks jak w Education - kamera przesuwa się w lewo-prawo
    parallaxStrength: 0.25,
    parallaxMaxOffset: 0.5,
    // Paralaks tła - tło przesuwa się w przeciwną stronę niż kamera
    hubParallaxStrength: 0.15,
    hubParallaxMaxOffset: 0.3
};

// Initialize the scene
function init() {
    console.log('Initializing scene...');
    // Get the viewport container (letterbox container)
    const viewport = document.getElementById('aperture-viewport');
    const W = viewport.clientWidth;
    const H = viewport.clientHeight;

    // Scene setup
    scene = new THREE.Scene();

    // Camera setup
    camera = new THREE.PerspectiveCamera(
        CONFIG.fov,
        W / H,
        0.1,
        1000
    );
    camera.position.z = 5;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('webgl-container').appendChild(renderer.domElement);

    // Post-processing setup (EffectComposer + Bloom) - WYŁĄCZONE
    // composer = new THREE.EffectComposer(renderer);
    // const renderPass = new THREE.RenderPass(scene, camera);
    // composer.addPass(renderPass);
    // const bloomPass = new THREE.UnrealBloomPass(
    //     new THREE.Vector2(window.innerWidth, window.innerHeight),
    //     1.0, 0.3, 0.95
    // );
    // composer.addPass(bloomPass);

    // Używamy zwykłego renderera bez bloom
    composer = null;

    // Raycaster for mouse interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Load textures and create scene
    const textureLoader = new THREE.TextureLoader();

    // Load all textures - nowe tło Hubu: portal_hub_bg.webp + wizualizacje projektów
    Promise.all([
        loadTexture(textureLoader, 'assets/projects/portal_hub_bg.webp'),
        loadTexture(textureLoader, 'assets/projects/postapo-bg.jpg'),
        loadTexture(textureLoader, 'assets/projects/offce-bg.jpg')
    ]).then((textures) => {
        const hubTexture = textures[0];
        const portal1Texture = textures[1];
        const portal2Texture = textures[2];
        console.log('Textures loaded, creating scene...');
        createHub(hubTexture);
        createPortals(portal1Texture, portal2Texture);
        createRobotInvisibleMeshes();
        createMenuInvisibleMeshes();

        // Setup click handlers
        setupRobotAnimations();
        setupPortalClickAnimation();

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
        console.error('Error details:', error.message, error.stack);
    });

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);

    // Setup navigation
    setupNavigation();
}

// Load texture with error handling
function loadTexture(loader, url) {
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
    });
}

// Create Hub background plane
function createHub(texture) {
    // Calculate plane size to cover the aperture viewport
    const viewport = document.getElementById('aperture-viewport');
    const aspect = viewport.clientWidth / viewport.clientHeight;
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

// Create interactive portals with PNG ring textures
function createPortals(texture1, texture2) {
    // ===== PORTAL 1 - Overgrown (left side) =====

    // Setup texture for parallax effect and fix 16:9 aspect ratio on a 1:1 circle
    texture1.wrapS = THREE.RepeatWrapping;
    texture1.wrapT = THREE.RepeatWrapping;
    texture1.repeat.set(0.5625, 1.0); // 9/16 for correct aspect ratio
    texture1.offset.set(0.21875, 0.0); // Center the texture horizontally

    const portal1Geometry = new THREE.CircleGeometry(1, 64);
    // MeshBasicMaterial z teksturą wizualizacji
    const portal1Material = new THREE.MeshBasicMaterial({
        map: texture1,
        side: THREE.DoubleSide
    });

    portal1 = new THREE.Mesh(portal1Geometry, portal1Material);
    portal1.position.set(CONFIG.portal1Pos.x, CONFIG.portal1Pos.y, CONFIG.portal1Pos.z);
    portal1.scale.set(CONFIG.portalScale.x, CONFIG.portalScale.y, CONFIG.portalScale.z);
    portal1.userData = {
        id: 'portal1',
        name: 'Overgrown',
        basePos: { ...CONFIG.portal1Pos },
        baseOffsetX: 0.21875,
        baseOffsetY: 0.0,
        glowColor: new THREE.Color(0x00aaff), // Bardzo intensywny niebieski
        particleSpeedMultiplier: 1.0
    };
    scene.add(portal1);

    // PNG OBRAMÓWKA - tekstura z cząsteczkami
    const ring1Texture = new THREE.TextureLoader().load('assets/projects/blue-portal-ring.webp');
    ring1Texture.wrapS = THREE.RepeatWrapping;
    ring1Texture.wrapT = THREE.RepeatWrapping;

    const ring1Geometry = new THREE.PlaneGeometry(2.4, 2.4);
    const ring1Material = new THREE.MeshBasicMaterial({
        map: ring1Texture,
        color: 0x00aaff, // Bardzo intensywny niebieski
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    ring1 = new THREE.Mesh(ring1Geometry, ring1Material);
    ring1.position.set(CONFIG.portal1Pos.x, CONFIG.portal1Pos.y, CONFIG.portal1Pos.z + 0.01);
    ring1.scale.set(CONFIG.portalScale.x, CONFIG.portalScale.y, CONFIG.portalScale.z);
    ring1.userData = {
        basePos: { ...CONFIG.portal1Pos },
        rotationSpeed: 0.005
    };
    scene.add(ring1);
    portal1.userData.ring = ring1;

    // CZĄSTECZKI ENERGII wokół portalu 1 (niebieskie)
    particles1 = createPortalParticles(0x00aaff, CONFIG.portal1Pos);
    portal1.userData.particles = particles1;

    // ===== PORTAL 2 - Retro (right side) =====

    // Setup texture for parallax effect and fix 16:9 aspect ratio on a 1:1 circle
    texture2.wrapS = THREE.RepeatWrapping;
    texture2.wrapT = THREE.RepeatWrapping;
    texture2.repeat.set(0.5625, 1.0); // 9/16 for correct aspect ratio
    texture2.offset.set(0.21875, 0.0); // Center the texture horizontally

    const portal2Geometry = new THREE.CircleGeometry(1, 64);
    // MeshBasicMaterial z teksturą wizualizacji
    const portal2Material = new THREE.MeshBasicMaterial({
        map: texture2,
        side: THREE.DoubleSide
    });

    portal2 = new THREE.Mesh(portal2Geometry, portal2Material);
    portal2.position.set(CONFIG.portal2Pos.x, CONFIG.portal2Pos.y, CONFIG.portal2Pos.z);
    portal2.scale.set(CONFIG.portalScale.x, CONFIG.portalScale.y, CONFIG.portalScale.z);
    portal2.userData = {
        id: 'portal2',
        name: 'Retro',
        basePos: { ...CONFIG.portal2Pos },
        baseOffsetX: 0.21875,
        baseOffsetY: 0.0,
        glowColor: new THREE.Color(0xff6600), // Bardzo intensywny pomarańczowy
        particleSpeedMultiplier: 1.0
    };
    scene.add(portal2);

    // PNG OBRAMÓWKA - tekstura z cząsteczkami (pomarańczowa)
    const ring2Texture = new THREE.TextureLoader().load('assets/projects/orange-portal-ring.webp');
    ring2Texture.wrapS = THREE.RepeatWrapping;
    ring2Texture.wrapT = THREE.RepeatWrapping;

    const ring2Geometry = new THREE.PlaneGeometry(2.4, 2.4);
    const ring2Material = new THREE.MeshBasicMaterial({
        map: ring2Texture,
        color: 0xff6600, // Bardzo intensywny pomarańczowy
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
    ring2.position.set(CONFIG.portal2Pos.x, CONFIG.portal2Pos.y, CONFIG.portal2Pos.z + 0.01);
    ring2.scale.set(CONFIG.portalScale.x, CONFIG.portalScale.y, CONFIG.portalScale.z);
    ring2.userData = {
        basePos: { ...CONFIG.portal2Pos },
        rotationSpeed: 0.005
    };
    scene.add(ring2);
    portal2.userData.ring = ring2;

    // CZĄSTECZKI ENERGII wokół portalu 2 (pomarańczowe)
    particles2 = createPortalParticles(0xff6600, CONFIG.portal2Pos);
    portal2.userData.particles = particles2;
}

// Funkcja tworząca cząsteczki energii wokół portalu
function createPortalParticles(colorHex, basePos) {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Rozmieszcz cząsteczki w okolicach ringu
        angles[i] = Math.random() * Math.PI * 2;
        radii[i] = 1.0 + Math.random() * 0.3; // Odległość od środka
        speeds[i] = 0.5 + Math.random() * 1.5; // Prędkość rotacji

        const x = Math.cos(angles[i]) * radii[i];
        const y = Math.sin(angles[i]) * radii[i];
        const z = (Math.random() - 0.5) * 0.1;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('angle', new THREE.BufferAttribute(angles, 1));
    geometry.setAttribute('radius', new THREE.BufferAttribute(radii, 1));
    geometry.setAttribute('speed', new THREE.BufferAttribute(speeds, 1));

    const material = new THREE.PointsMaterial({
        color: colorHex,
        size: 0.04, // Mniejsze cząsteczki
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    particles.position.set(basePos.x, basePos.y, basePos.z + 0.02);
    particles.scale.set(CONFIG.portalScale.x, CONFIG.portalScale.y, 1);
    particles.userData = {
        basePos: { ...basePos },
        isParticleSystem: true
    };

    scene.add(particles);
    return particles;
}

// Handle mouse movement for raycasting, parallax and texture offset
function onMouseMove(event) {
    const viewport = document.getElementById('aperture-viewport');
    const rect = viewport.getBoundingClientRect();
    const W = viewport.clientWidth;
    const H = viewport.clientHeight;
    // Normalize mouse coords relative to the aperture viewport
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Kamera przesuwa się jak w Education - mocny ruch lewo-prawo
    targetCameraPos.x = mouse.x * CONFIG.parallaxStrength;
    targetCameraPos.y = mouse.y * CONFIG.parallaxStrength;

    // Clamp camera movement
    targetCameraPos.x = Math.max(-CONFIG.parallaxMaxOffset, Math.min(CONFIG.parallaxMaxOffset, targetCameraPos.x));
    targetCameraPos.y = Math.max(-CONFIG.parallaxMaxOffset, Math.min(CONFIG.parallaxMaxOffset, targetCameraPos.y));

    // Tło (hub) przesuwa się w przeciwną stronę niż kamera (paralaks głębi)
    targetHubPos.x = -mouse.x * CONFIG.hubParallaxStrength;
    targetHubPos.y = -mouse.y * CONFIG.hubParallaxStrength;

    // Clamp hub movement
    targetHubPos.x = Math.max(-CONFIG.hubParallaxMaxOffset, Math.min(CONFIG.hubParallaxMaxOffset, targetHubPos.x));
    targetHubPos.y = Math.max(-CONFIG.hubParallaxMaxOffset, Math.min(CONFIG.hubParallaxMaxOffset, targetHubPos.y));

    // Texture offset parallax - wnętrze portali przesuwa się zgodnie z ruchem kamery (ograniczone)
    if (portal1 && portal1.material.map) {
        const offsetX1 = portal1.userData.baseOffsetX + (targetCameraPos.x * 0.1);
        const offsetY1 = portal1.userData.baseOffsetY + (targetCameraPos.y * 0.1);
        portal1.material.map.offset.x = offsetX1;
        portal1.material.map.offset.y = offsetY1;
    }
    if (portal2 && portal2.material.map) {
        const offsetX2 = portal2.userData.baseOffsetX + (targetCameraPos.x * 0.1);
        const offsetY2 = portal2.userData.baseOffsetY + (targetCameraPos.y * 0.1);
        portal2.material.map.offset.x = offsetX2;
        portal2.material.map.offset.y = offsetY2;
    }
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
            document.body.style.cursor = "url('assets/cursor/Alternate-Link.cur'), pointer";
        }
    } else {
        if (hoveredPortal) {
            // Mouse left portal
            animatePortal(hoveredPortal, false);
            hoveredPortal = null;
            document.body.style.cursor = "url('assets/cursor/Normal.cur'), auto";
        }
    }
}

// Animate portal ring on hover
function animatePortal(portal, isHovered) {
    const ring = portal.userData.ring;
    if (ring) {
        // Zwiększenie opacity na hover
        gsap.to(ring.material, {
            opacity: isHovered ? 1.0 : 0.9,
            duration: 0.3,
            ease: "power2.out"
        });

        // Scale obramówki na hover
        gsap.to(ring.scale, {
            x: isHovered ? CONFIG.portalScale.x * 1.08 : CONFIG.portalScale.x,
            y: isHovered ? CONFIG.portalScale.y * 1.08 : CONFIG.portalScale.y,
            duration: 0.3,
            ease: "power2.out"
        });
    }

    // Przyspieszenie cząsteczek tylko na hoverowanym portalu
    portal.userData.particleSpeedMultiplier = isHovered ? 4.0 : 1.0;

    // Subtelna zmiana środka portalu - scale na hover
    gsap.to(portal.scale, {
        x: isHovered ? CONFIG.portalScale.x * 1.05 : CONFIG.portalScale.x,
        y: isHovered ? CONFIG.portalScale.y * 1.05 : CONFIG.portalScale.y,
        duration: 0.3,
        ease: "power2.out"
    });
}

// Smooth camera and hub parallax with LERP
// Portale są ZLOKOWANE do tła - poruszają się razem z hubPlane
function updateCameraParallax() {
    // LERP interpolation for smooth movement - faster response
    currentCameraPos.x += (targetCameraPos.x - currentCameraPos.x) * 0.15;
    currentCameraPos.y += (targetCameraPos.y - currentCameraPos.y) * 0.15;

    currentHubPos.x += (targetHubPos.x - currentHubPos.x) * 0.15;
    currentHubPos.y += (targetHubPos.y - currentHubPos.y) * 0.15;

    // Kamera przesuwa się (jak w Education - lewo-prawo)
    camera.position.x = currentCameraPos.x;
    camera.position.y = currentCameraPos.y;
    camera.lookAt(0, 0, 0);

    // Tło przesuwa się w przeciwną stronę (efekt paralaksy głębi)
    if (hubPlane) {
        hubPlane.position.x = currentHubPos.x;
        hubPlane.position.y = currentHubPos.y;
    }

    // Portale i ringi są ZLOKOWANE do tła - poruszają się razem z hubPlane
    if (portal1 && ring1) {
        portal1.position.x = portal1.userData.basePos.x + currentHubPos.x;
        portal1.position.y = portal1.userData.basePos.y + currentHubPos.y;
        ring1.position.x = ring1.userData.basePos.x + currentHubPos.x;
        ring1.position.y = ring1.userData.basePos.y + currentHubPos.y;
    }
    if (portal2 && ring2) {
        portal2.position.x = portal2.userData.basePos.x + currentHubPos.x;
        portal2.position.y = portal2.userData.basePos.y + currentHubPos.y;
        ring2.position.x = ring2.userData.basePos.x + currentHubPos.x;
        ring2.position.y = ring2.userData.basePos.y + currentHubPos.y;
    }

    // Roboty są ZLOKOWANE do tła - poruszają się razem z hubPlane (jak portale)
    if (robotPbody) {
        robotPbody.position.x = robotPbody.userData.basePos.x + currentHubPos.x;
        robotPbody.position.y = robotPbody.userData.basePos.y + currentHubPos.y;
    }
    if (robotAtlas) {
        robotAtlas.position.x = robotAtlas.userData.basePos.x + currentHubPos.x;
        robotAtlas.position.y = robotAtlas.userData.basePos.y + currentHubPos.y;
    }

    // Menu jest ZLOKOWANE do tła - porusza się razem z hubPlane
    if (menuMeshes.length > 0) {
        menuMeshes.forEach(mesh => {
            mesh.position.x = mesh.userData.basePos.x + currentHubPos.x;
            mesh.position.y = mesh.userData.basePos.y + currentHubPos.y;
        });
    }

    // Synchronizuj pozycje HTML overlay z pozycją Three.js meshe
    syncRobotOverlayPositions();
    syncMenuPositions();
}

// Handle window resize
function onWindowResize() {
    const viewport = document.getElementById('aperture-viewport');
    const W = viewport.clientWidth;
    const H = viewport.clientHeight;

    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);

    // Update hub plane size
    if (hubPlane) {
        const aspect = W / H;
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

    // Animacja cząsteczek - rotacja wokół portali (każdy portal swoją prędkością)
    const time = performance.now() * 0.001;
    animateParticles(particles1, time, portal1?.userData?.particleSpeedMultiplier || 1.0);
    animateParticles(particles2, time, portal2?.userData?.particleSpeedMultiplier || 1.0);

    // Render bez bloom (composer wyłączony)
    renderer.render(scene, camera);
}

// Funkcja animująca cząsteczki - rotacja wokół portalu
function animateParticles(particles, time, speedMultiplier = 1.0) {
    if (!particles) return;

    const positions = particles.geometry.attributes.position.array;
    const angles = particles.geometry.attributes.angle.array;
    const radii = particles.geometry.attributes.radius.array;
    const speeds = particles.geometry.attributes.speed.array;

    for (let i = 0; i < angles.length; i++) {
        // Aktualizuj kąt - rotacja wokół portalu (wolniej normalnie)
        angles[i] += speeds[i] * 0.005 * speedMultiplier;

        // Pulsowanie odległości (fale wychodzą i wracają)
        const pulse = Math.sin(time * 2 + i * 0.3) * 0.1;
        const currentRadius = radii[i] + pulse;

        // Aktualizuj pozycję
        positions[i * 3] = Math.cos(angles[i]) * currentRadius;
        positions[i * 3 + 1] = Math.sin(angles[i]) * currentRadius;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Synchronizuj pozycję z hubParallax (zlokowane do tła)
    if (particles.userData.basePos && currentHubPos) {
        particles.position.x = particles.userData.basePos.x + currentHubPos.x;
        particles.position.y = particles.userData.basePos.y + currentHubPos.y;
    }
}

// Setup portal click animation with FOV tunnel effect
function setupPortalClickAnimation() {
    window.addEventListener('click', (event) => {
        // Sprawdź czy kliknięto w portal
        const viewport = document.getElementById('aperture-viewport');
        const rect = viewport.getBoundingClientRect();
        const portalMouse = new THREE.Vector2();
        portalMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        portalMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        const portalRaycaster = new THREE.Raycaster();
        portalRaycaster.setFromCamera(portalMouse, camera);
        const intersects = portalRaycaster.intersectObjects([portal1, portal2].filter(Boolean));

        if (intersects.length > 0) {
            const portal = intersects[0].object;
            const targetUrl = portal === portal1 ? 'chamber_a.html' : 'chamber_b.html';

            // Zablokuj ruch myszki
            window.removeEventListener('mousemove', onMouseMove);

            // Pokaż overlay jako biały flash
            const overlay = document.querySelector('.page-transition-overlay');
            overlay.style.transition = 'none'; // Disable CSS transition so GSAP can control it smoothly
            overlay.style.backgroundColor = '#fff';
            overlay.style.opacity = '0';
            overlay.style.pointerEvents = 'auto';

            // GSAP animacja: Lot przez portal + fade to white
            gsap.timeline()
                .to(camera, {
                    fov: 120,
                    duration: 0.8,
                    ease: "power2.in",
                    onUpdate: () => camera.updateProjectionMatrix()
                })
                .to(camera.position, {
                    x: portal.position.x,
                    y: portal.position.y,
                    z: portal.position.z - 0.5,
                    duration: 0.8,
                    ease: "power2.in"
                }, "<")
                .to(overlay, {
                    opacity: 1,
                    duration: 0.2,
                    ease: "power1.inOut",
                    onComplete: () => {
                        // Use global chamber transition if available
                        if (typeof window.transitionTo === 'function') {
                            window.transitionTo(targetUrl);
                        } else {
                            window.location.href = targetUrl;
                        }
                    }
                }, "-=0.2");
        }
    });
}

// Setup page navigation with chamber transition sound
function setupNavigation() {
    document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || !href.includes('.html')) {
            return;
        }

        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof window.transitionTo === 'function') {
                window.transitionTo(href);
            } else {
                window.location.href = href;
            }
        });
    });
}

// Synchronizuj pozycje HTML overlay z pozycją Three.js meshe
function syncRobotOverlayPositions() {
    if (!robotPbody || !robotAtlas) return;

    const pbodyContainer = document.getElementById('robot-pbody-container');
    const atlasContainer = document.getElementById('robot-atlas-container');

    if (pbodyContainer && robotPbody) {
        const vector = robotPbody.position.clone();
        vector.project(camera);
        const viewport = document.getElementById('aperture-viewport');
        const W = viewport.clientWidth;
        const H = viewport.clientHeight;
        const x = (vector.x * 0.5 + 0.5) * W;
        const y = (-(vector.y * 0.5) + 0.5) * H;

        pbodyContainer.style.position = 'absolute';
        pbodyContainer.style.left = x + 'px';
        pbodyContainer.style.top = y + 'px';
        pbodyContainer.style.transform = 'translate(-50%, -50%)';
    }

    if (atlasContainer && robotAtlas) {
        const vector = robotAtlas.position.clone();
        vector.project(camera);
        const viewport = document.getElementById('aperture-viewport');
        const W = viewport.clientWidth;
        const H = viewport.clientHeight;
        const x = (vector.x * 0.5 + 0.5) * W;
        const y = (-(vector.y * 0.5) + 0.5) * H;

        atlasContainer.style.position = 'absolute';
        atlasContainer.style.left = x + 'px';
        atlasContainer.style.top = y + 'px';
        atlasContainer.style.transform = 'translate(-50%, -50%)';
    }
}

// Create invisible meshes for robot position lock (like portals)
function createRobotInvisibleMeshes() {
    // Invisible geometry for raycast and position tracking
    const robotGeometry = new THREE.PlaneGeometry(0.6, 0.84);

    // Invisible material (transparent, no render)
    const invisibleMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });

    // P-Body invisible mesh (dostosowane do pozycji CSS)
    robotPbody = new THREE.Mesh(robotGeometry, invisibleMaterial);
    robotPbody.position.set(-2.6, -1, 0.15);
    robotPbody.userData = {
        id: 'robotPbody',
        basePos: { x: -2.6, y: -1, z: 0.15 },
        isRobot: true
    };
    scene.add(robotPbody);

    // Atlas invisible mesh (dostosowane do pozycji CSS, 3/5 wysokości P-Body)
    const atlasGeometry = new THREE.PlaneGeometry(0.5, 0.504); // 3/5 z 0.84
    robotAtlas = new THREE.Mesh(atlasGeometry, invisibleMaterial);
    robotAtlas.position.set(3.3, -1, 0.15);
    robotAtlas.userData = {
        id: 'robotAtlas',
        basePos: { x: 3.3, y: -1, z: 0.15 },
        isRobot: true
    };
    scene.add(robotAtlas);
}

// ...
let robotAnimations = {
    pbody: { isAnimating: false },
    atlas: { isAnimating: false }
};

// Animation duration in milliseconds (configurable)
const ANIMATION_DURATION = 3000; // 3 seconds - dostosuj tutaj

// Setup robot click interactions (raycast on invisible meshes, HTML overlay for animation)
function setupRobotAnimations() {
    const pbody = document.getElementById('robot-pbody');
    const pbodyOverlay = document.getElementById('robot-pbody-overlay');
    const atlas = document.getElementById('robot-atlas');
    const atlasOverlay = document.getElementById('robot-atlas-overlay');

    if (!pbody || !atlas || !pbodyOverlay || !atlasOverlay) return;

    // Raycaster for robot clicks on invisible meshes
    const robotRaycaster = new THREE.Raycaster();
    const robotMouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
        const vpRect = document.getElementById('aperture-viewport').getBoundingClientRect();
        robotMouse.x = ((event.clientX - vpRect.left) / vpRect.width) * 2 - 1;
        robotMouse.y = -((event.clientY - vpRect.top) / vpRect.height) * 2 + 1;

        robotRaycaster.setFromCamera(robotMouse, camera);
        const intersects = robotRaycaster.intersectObjects([robotPbody, robotAtlas].filter(Boolean));

        if (intersects.length > 0) {
            const robot = intersects[0].object;

            if (robot === robotPbody && !robotAnimations.pbody.isAnimating) {
                playRobotAnimation(pbody, pbodyOverlay, 'pbody');
            } else if (robot === robotAtlas && !robotAnimations.atlas.isAnimating) {
                playRobotAnimation(atlas, atlasOverlay, 'atlas');
            }
        }
    });
}

// Play animation with cross-fade morph
function playRobotAnimation(sprite, overlay, robotName) {
    const anim = robotAnimations[robotName];
    if (anim.isAnimating) return;

    anim.isAnimating = true;

    // Trigger audio exactly when animation starts
    // This uses the aperture-audio.js logic which handles the specific delays per robot
    if (typeof window.playRobotAudio === 'function') {
        window.playRobotAudio(robotName);
    }

    // Cross-fade: sprite opacity 1->0, overlay opacity 0->1
    // Cache-busting to force animation restart from beginning
    const animUrl = robotName === 'pbody' ? 'assets/projects/pbody-animation.png' : 'assets/projects/atlas-animation.png';
    overlay.src = animUrl + '?t=' + Date.now();
    overlay.classList.add('animating');

    sprite.style.opacity = '0';
    overlay.style.opacity = '1';

    // Return to sprite after animation (configurable duration)
    setTimeout(() => {
        overlay.style.opacity = '0'; // Najpierw ukryj overlay
        sprite.style.opacity = '1'; // Potem pokaż sprite

        setTimeout(() => {
            overlay.classList.remove('animating'); // Na końcu usuń klasę (zmiana rozmiaru)
            anim.isAnimating = false;
        }, 300); // Czekaj na transition opacity
    }, ANIMATION_DURATION);
}

// Create single invisible mesh for entire menu
function createMenuInvisibleMeshes() {
    const invisibleMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0
    });

    // Jeden mesh dla caÅego menu (1.2 szerokoÅÄ x 1.5 wysokoÅci)
    const geometry = new THREE.PlaneGeometry(1.2, 1.5);
    const mesh = new THREE.Mesh(geometry, invisibleMaterial);
    mesh.position.set(-3.6, 0, 0.5);
    mesh.rotation.y = Math.PI / 6; // 30 stopni - obrót jak Åciana po lewej
    mesh.userData = {
        id: 'menuContainer',
        basePos: { x: -3.8, y: 0, z: 0.5 },
        rotation: Math.PI / 6
    };
    scene.add(mesh);
    menuMeshes.push(mesh);
}

// Synchronizuj pozycjÄ kontenera menu z pozycjÄ Three.js mesha
function syncMenuPositions() {
    const menuContainer = document.getElementById('left-wall-menu');
    if (!menuContainer || menuMeshes.length === 0) return;

    const mesh = menuMeshes[0];
    const vector = mesh.position.clone();
    vector.project(camera);
    const viewport = document.getElementById('aperture-viewport');
    const W = viewport.clientWidth;
    const H = viewport.clientHeight;

    const x = (vector.x * 0.5 + 0.5) * W;
    const y = (-(vector.y * 0.5) + 0.5) * H;

    const rotationDeg = (mesh.rotation.y * 180 / Math.PI);

    menuContainer.style.position = 'absolute';
    menuContainer.style.left = x + 'px';
    menuContainer.style.top = y + 'px';
    menuContainer.style.transform = `translate(0, -50%) rotateY(${rotationDeg}deg)`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
