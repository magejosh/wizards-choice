// Scene Manager class - handles ThreeJS scene and visual effects

import * as THREE from 'three';

export class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.playerWizard = null;
        this.opponentWizard = null;
        this.animationFrameId = null;
        this.spellEffects = {};
        this.container = null;
        this.resizeTimeout = null;
        this.mutationObserver = null;
        this.resizeObserver = null;
    }
    
    async init(container) {
        console.log('Initializing Scene Manager...');
        
        // Store the container reference
        this.container = container || document.getElementById('battle-scene');
        
        if (!this.container) {
            console.warn('No container provided for SceneManager, looking for battle-scene');
            this.container = document.getElementById('battle-scene');
            
            if (!this.container) {
                console.error('Could not find battle-scene container');
                return Promise.reject(new Error('No container for SceneManager'));
            }
        }
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            this.container.clientWidth / this.container.clientHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.z = 5;
        this.camera.position.y = 0.25; // Raise the camera by 5% to shift scene upward
        
        // Create renderer with improved settings
        try {
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true,
                preserveDrawingBuffer: true
            });
            
            // Set initial size to container size
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.container.appendChild(this.renderer.domElement);
        } catch (error) {
            console.error("Could not create WebGLRenderer:", error);
            return Promise.reject(error);
        }
        
        // Call resize immediately after adding to container
        setTimeout(() => this.resizeRenderer(), 0);
        
        // Set up animation loop
        this.animate = this.animate.bind(this);
        this.animate();
        
        // Add window resize listener
        window.addEventListener('resize', () => {
            // Debounce resize events
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            
            this.resizeTimeout = setTimeout(() => {
                this.resizeRenderer();
                console.log('Renderer resized due to window resize');
            }, 100);
        });
        
        // Add ResizeObserver for container size changes
        if (this.container && typeof ResizeObserver !== 'undefined') {
            this.resizeObserver = new ResizeObserver(() => {
                this.resizeRenderer();
            });
            this.resizeObserver.observe(this.container);
        }
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
        
        // Initialize spell effects
        this.initSpellEffects();
        
        console.log('Scene Manager initialized');
        return Promise.resolve();
    }
    
    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        // Rotate wizards slightly for ambient movement
        if (this.playerWizard) {
            this.playerWizard.rotation.y += 0.005;
        }
        
        if (this.opponentWizard) {
            this.opponentWizard.rotation.y += 0.005;
        }
        
        // Update any active spell effects
        this.updateSpellEffects();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    setupBattleScene(player, opponent) {
        console.log('Setting up battle scene');
        
        // Check if scene is initialized
        if (!this.scene) {
            console.error('Scene not initialized. Cannot set up battle scene.');
            return;
        }
        
        // Clear any existing objects
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 1);
        this.scene.add(directionalLight);
        
        // Get scene dimensions to position wizards optimally
        let width = this.container ? this.container.clientWidth : window.innerWidth;
        let height = this.container ? this.container.clientHeight : window.innerHeight * 0.66;
        
        // Scale positioning based on aspect ratio
        const aspectRatio = width / height;
        const wizardSpacing = Math.min(4, Math.max(3, aspectRatio * 2));
        
        // Create player wizard with optimal position
        this.createPlayerWizard();
        this.playerWizard.position.set(-wizardSpacing/2, -0.25, 0); // Raised Y position by 0.25
        
        // Create opponent wizard with optimal position
        this.createOpponentWizard();
        this.opponentWizard.position.set(wizardSpacing/2, -0.25, 0); // Raised Y position by 0.25
        
        // Add background elements
        this.createBackground();
        
        // Resize renderer to match container
        this.resizeRenderer();
        
        // Log scene setup
        console.log(`Battle scene set up with wizards at spacing: ${wizardSpacing}`);
    }
    
    // Add a method to resize the renderer based on the container
    resizeRenderer() {
        // Safety check - do nothing if renderer or camera isn't initialized
        if (!this.renderer || !this.camera) {
            console.warn('Cannot resize: renderer or camera not initialized');
            return;
        }
        
        // Get container dimensions based on actual viewport
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;
        
        // Update camera aspect ratio
        this.camera.aspect = containerWidth / containerHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size to fill the viewport - set to match exactly the pixel size
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(containerWidth, containerHeight, false);
        
        // Make sure canvas is positioned correctly
        if (this.renderer.domElement) {
            this.renderer.domElement.style.display = 'block';
            this.renderer.domElement.style.position = 'absolute';
            this.renderer.domElement.style.top = '0';
            this.renderer.domElement.style.left = '0';
            this.renderer.domElement.style.width = '100%';
            this.renderer.domElement.style.height = '100%';
            this.renderer.domElement.style.zIndex = '1'; // Lower z-index so overlays appear above
        }
        
        // Reposition wizards based on aspect ratio
        if (this.playerWizard && this.opponentWizard) {
            const wizardSpacing = Math.min(4, Math.max(3, this.camera.aspect * 2));
            this.playerWizard.position.set(-wizardSpacing/2, -0.25, 0); // Raised Y position by 0.25
            this.opponentWizard.position.set(wizardSpacing/2, -0.25, 0); // Raised Y position by 0.25
            console.log(`Repositioned wizards with spacing: ${wizardSpacing}`);
        }
    }
    
    createPlayerWizard() {
        // Create a simple wizard representation for MVP
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x4040ff,
            emissive: 0x101040,
            shininess: 30
        });
        
        this.playerWizard = new THREE.Mesh(geometry, material);
        this.playerWizard.position.set(-2, -0.25, 0); // Match the Y position from resizeRenderer
        this.scene.add(this.playerWizard);
        
        // Add wizard hat
        const hatGeometry = new THREE.ConeGeometry(0.3, 0.7, 32);
        const hatMaterial = new THREE.MeshPhongMaterial({ color: 0x2020a0 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1, 0);
        this.playerWizard.add(hat);
        
        // Add staff
        const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const staffMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.5, 0, 0);
        staff.rotation.z = Math.PI / 4;
        this.playerWizard.add(staff);
        
        // Add glowing orb to staff
        const orbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const orbMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00aaaa,
            shininess: 50
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.8, 0.8, 0);
        this.playerWizard.add(orb);
    }
    
    createOpponentWizard() {
        // Create a simple wizard representation for MVP
        const geometry = new THREE.ConeGeometry(0.5, 1.5, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xff4040,
            emissive: 0x401010,
            shininess: 30
        });
        
        this.opponentWizard = new THREE.Mesh(geometry, material);
        this.opponentWizard.position.set(2, -0.25, 0); // Match the Y position from resizeRenderer
        this.scene.add(this.opponentWizard);
        
        // Add wizard hat
        const hatGeometry = new THREE.ConeGeometry(0.3, 0.7, 32);
        const hatMaterial = new THREE.MeshPhongMaterial({ color: 0xa02020 });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1, 0);
        this.opponentWizard.add(hat);
        
        // Add staff
        const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const staffMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(-0.5, 0, 0);
        staff.rotation.z = -Math.PI / 4;
        this.opponentWizard.add(staff);
        
        // Add glowing orb to staff
        const orbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const orbMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff00ff,
            emissive: 0xaa00aa,
            shininess: 50
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(-0.8, 0.8, 0);
        this.opponentWizard.add(orb);
    }
    
    createBackground() {
        // Create a simple background for MVP
        const planeGeometry = new THREE.PlaneGeometry(20, 10);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x0a0a1a,
            side: THREE.DoubleSide
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.z = -5;
        this.scene.add(plane);
        
        // Add some stars
        for (let i = 0; i < 200; i++) {
            const starGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            
            // Random position
            star.position.x = Math.random() * 20 - 10;
            star.position.y = Math.random() * 10 - 5;
            star.position.z = -4.5 - Math.random();
            
            this.scene.add(star);
        }
    }
    
    initSpellEffects() {
        // Initialize spell effect templates
        this.spellEffects = {
            fire: {
                color: 0xff5030,
                emissive: 0xaa2010,
                particleCount: 50,
                speed: 0.1,
                size: 0.1
            },
            water: {
                color: 0x3080ff,
                emissive: 0x1040aa,
                particleCount: 40,
                speed: 0.08,
                size: 0.08
            },
            earth: {
                color: 0x80c040,
                emissive: 0x406020,
                particleCount: 30,
                speed: 0.05,
                size: 0.12
            },
            air: {
                color: 0xc0c0ff,
                emissive: 0x8080aa,
                particleCount: 60,
                speed: 0.15,
                size: 0.06
            },
            arcane: {
                color: 0xa050ff,
                emissive: 0x6030aa,
                particleCount: 45,
                speed: 0.12,
                size: 0.09
            }
        };
    }
    
    playSpellAnimation(caster, spellType) {
        if (!this.spellEffects[spellType.toLowerCase()]) {
            console.error(`Unknown spell type: ${spellType}`);
            return;
        }
        
        const effect = this.spellEffects[spellType.toLowerCase()];
        const source = caster === 'player' ? this.playerWizard : this.opponentWizard;
        const target = caster === 'player' ? this.opponentWizard : this.playerWizard;
        
        if (!source || !target) {
            console.error('Source or target wizard not found');
            return;
        }
        
        // Create spell particles
        const particles = new THREE.Group();
        this.scene.add(particles);
        
        // Create particles
        for (let i = 0; i < effect.particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(effect.size * (0.5 + Math.random() * 0.5), 8, 8);
            const particleMaterial = new THREE.MeshPhongMaterial({
                color: effect.color,
                emissive: effect.emissive,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Set initial position at source
            particle.position.copy(source.position);
            particle.position.x += (Math.random() - 0.5) * 0.5;
            particle.position.y += (Math.random() - 0.5) * 0.5;
            
            // Calculate direction to target
            particle.userData = {
                velocity: new THREE.Vector3(
                    target.position.x - source.position.x,
                    target.position.y - source.position.y,
                    0
                ).normalize().multiplyScalar(effect.speed * (0.8 + Math.random() * 0.4)),
                life: 1.0
            };
            
            particles.add(particle);
        }
        
        // Store particles for animation
        this.activeSpellEffects = this.activeSpellEffects || [];
        this.activeSpellEffects.push({
            particles,
            type: spellType.toLowerCase(),
            target
        });
        
        // Create impact effect after delay
        setTimeout(() => {
            this.createImpactEffect(target, effect);
        }, 1000);
    }
    
    createImpactEffect(target, effect) {
        // Create impact particles
        const impactGroup = new THREE.Group();
        this.scene.add(impactGroup);
        
        // Create particles
        for (let i = 0; i < effect.particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(effect.size * (0.5 + Math.random() * 0.5), 8, 8);
            const particleMaterial = new THREE.MeshPhongMaterial({
                color: effect.color,
                emissive: effect.emissive,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Set initial position at target
            particle.position.copy(target.position);
            
            // Random velocity outward
            const angle = Math.random() * Math.PI * 2;
            const speed = effect.speed * (0.5 + Math.random() * 0.5);
            
            particle.userData = {
                velocity: new THREE.Vector3(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed,
                    0
                ),
                life: 1.0
            };
            
            impactGroup.add(particle);
        }
        
        // Store impact for animation
        this.activeSpellEffects = this.activeSpellEffects || [];
        this.activeSpellEffects.push({
            particles: impactGroup,
            type: 'impact',
            life: 1.0
        });
    }
    
    updateSpellEffects() {
        if (!this.activeSpellEffects) return;
        
        for (let i = this.activeSpellEffects.length - 1; i >= 0; i--) {
            const effect = this.activeSpellEffects[i];
            
            if (effect.type === 'impact') {
                // Update impact effect
                effect.life -= 0.02;
                
                if (effect.life <= 0) {
                    this.scene.remove(effect.particles);
                    this.activeSpellEffects.splice(i, 1);
                    continue;
                }
                
                // Update particles
                effect.particles.children.forEach(particle => {
                    particle.position.add(particle.userData.velocity);
                    particle.userData.velocity.multiplyScalar(0.95); // Slow down
                    particle.material.opacity = effect.life;
                    particle.scale.multiplyScalar(0.98); // Shrink
                });
            } else {
                // Update traveling spell particles
                let allParticlesReached = true;
                
                effect.particles.children.forEach(particle => {
                    // Move particle
                    particle.position.add(particle.userData.velocity);
                    
                    // Check if reached target
                    const distanceToTarget = particle.position.distanceTo(effect.target.position);
                    
                    if (distanceToTarget > 0.5) {
                        allParticlesReached = false;
                    } else {
                        // Fade out when reaching target
                        particle.userData.life -= 0.1;
                        particle.material.opacity = particle.userData.life;
                        
                        if (particle.userData.life <= 0) {
                            effect.particles.remove(particle);
                        }
                    }
                });
                
                // Remove effect if all particles reached target or disappeared
                if (allParticlesReached || effect.particles.children.length === 0) {
                    this.scene.remove(effect.particles);
                    this.activeSpellEffects.splice(i, 1);
                }
            }
        }
    }
    
    // Clean up resources when scene is no longer needed
    dispose() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Remove renderer from DOM
        if (this.renderer && this.renderer.domElement) {
            const parent = this.renderer.domElement.parentElement;
            if (parent) {
                parent.removeChild(this.renderer.domElement);
            }
        }
        
        // Disconnect mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
        }
        
        // Disconnect resize observer
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }
}
