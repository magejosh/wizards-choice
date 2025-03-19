// Enhanced Scene Manager for Wizard's Choice
// Handles ThreeJS scene and visual effects with improved graphics

import * as THREE from 'three';

export class EnhancedSceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.playerWizard = null;
        this.opponentWizard = null;
        this.animationFrameId = null;
        this.spellEffects = {};
        this.activeSpellEffects = [];
        this.particles = [];
        this.clock = new THREE.Clock();
        this.battleEnvironment = null;
    }
    
    async init() {
        console.log('Initializing Enhanced Scene Manager...');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        
        // Add fog for depth
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.035);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.z = 5;
        this.camera.position.y = 1;
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.7); // Match battle-scene size
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to DOM
        const battleScene = document.getElementById('battle-scene');
        if (battleScene) {
            battleScene.appendChild(this.renderer.domElement);
        }
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth * 0.6, window.innerHeight * 0.7);
        });
        
        // Initialize spell effects
        this.initSpellEffects();
        
        // Start animation loop
        this.animate();
        
        console.log('Enhanced Scene Manager initialized');
        return Promise.resolve();
    }
    
    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        // Rotate wizards slightly for ambient movement
        if (this.playerWizard) {
            this.playerWizard.rotation.y += 0.005;
            
            // Add subtle floating motion
            this.playerWizard.position.y = -0.5 + Math.sin(this.clock.getElapsedTime() * 0.5) * 0.05;
        }
        
        if (this.opponentWizard) {
            this.opponentWizard.rotation.y += 0.005;
            
            // Add subtle floating motion (out of phase with player)
            this.opponentWizard.position.y = -0.5 + Math.sin(this.clock.getElapsedTime() * 0.5 + Math.PI) * 0.05;
        }
        
        // Update any active spell effects
        this.updateSpellEffects(delta);
        
        // Update particles
        this.updateParticles(delta);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }
    
    setupBattleScene(player, opponent) {
        console.log('Setting up enhanced battle scene');
        
        // Clear any existing objects
        while(this.scene.children.length > 0) { 
            this.scene.remove(this.scene.children[0]); 
        }
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        
        // Add point lights for atmosphere
        const blueLight = new THREE.PointLight(0x3050ff, 1, 10);
        blueLight.position.set(-3, 2, -3);
        this.scene.add(blueLight);
        
        const purpleLight = new THREE.PointLight(0x9050ff, 1, 10);
        purpleLight.position.set(3, 2, -3);
        this.scene.add(purpleLight);
        
        // Create battle environment
        this.createBattleEnvironment();
        
        // Create player wizard
        this.createEnhancedPlayerWizard();
        
        // Create opponent wizard
        this.createEnhancedOpponentWizard();
        
        // Add particle systems
        this.createAmbientParticles();
    }
    
    createBattleEnvironment() {
        // Create a group for the environment
        this.battleEnvironment = new THREE.Group();
        this.scene.add(this.battleEnvironment);
        
        // Create floor/ground
        const floorGeometry = new THREE.CircleGeometry(10, 32);
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x1a1a4a,
            roughness: 0.7,
            metalness: 0.2
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -1;
        floor.receiveShadow = true;
        this.battleEnvironment.add(floor);
        
        // Add magical circle on the floor
        const circleGeometry = new THREE.RingGeometry(3, 3.1, 64);
        const circleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x6040a0,
            side: THREE.DoubleSide
        });
        const magicCircle = new THREE.Mesh(circleGeometry, circleMaterial);
        magicCircle.rotation.x = -Math.PI / 2;
        magicCircle.position.y = -0.99;
        this.battleEnvironment.add(magicCircle);
        
        // Add inner magical circle
        const innerCircleGeometry = new THREE.RingGeometry(1.5, 1.6, 64);
        const innerCircleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9050ff,
            side: THREE.DoubleSide
        });
        const innerMagicCircle = new THREE.Mesh(innerCircleGeometry, innerCircleMaterial);
        innerMagicCircle.rotation.x = -Math.PI / 2;
        innerMagicCircle.position.y = -0.98;
        this.battleEnvironment.add(innerMagicCircle);
        
        // Add magical runes
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 2.3;
            
            const runeGeometry = new THREE.PlaneGeometry(0.5, 0.5);
            const runeMaterial = new THREE.MeshBasicMaterial({ 
                color: 0xa050ff,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            
            const rune = new THREE.Mesh(runeGeometry, runeMaterial);
            rune.position.x = Math.cos(angle) * radius;
            rune.position.z = Math.sin(angle) * radius;
            rune.position.y = -0.97;
            rune.rotation.x = -Math.PI / 2;
            rune.rotation.z = angle;
            
            this.battleEnvironment.add(rune);
        }
        
        // Add background elements (stars, etc.)
        this.createStarfield();
        
        // Add floating crystals
        this.createFloatingCrystals();
    }
    
    createStarfield() {
        // Create a starfield in the background
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.8
        });
        
        const starsVertices = [];
        for (let i = 0; i < 1000; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = -50 - Math.random() * 50;
            
            starsVertices.push(x, y, z);
        }
        
        starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
    }
    
    createFloatingCrystals() {
        // Create floating crystals around the battle area
        const crystalColors = [
            0x5050ff, // Blue
            0xff5050, // Red
            0x50ff50, // Green
            0xff50ff, // Magenta
            0xffff50  // Yellow
        ];
        
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = 6 + Math.random() * 2;
            const height = Math.random() * 3 - 1;
            
            // Create crystal geometry
            const crystalGeometry = new THREE.ConeGeometry(0.2, 0.5, 5);
            const crystalMaterial = new THREE.MeshPhongMaterial({ 
                color: crystalColors[i % crystalColors.length],
                emissive: crystalColors[i % crystalColors.length],
                emissiveIntensity: 0.3,
                shininess: 90
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            crystal.position.x = Math.cos(angle) * radius;
            crystal.position.z = Math.sin(angle) * radius;
            crystal.position.y = height;
            crystal.rotation.x = Math.random() * Math.PI;
            crystal.rotation.z = Math.random() * Math.PI;
            
            // Add animation data to user data
            crystal.userData = {
                initialY: height,
                floatSpeed: 0.5 + Math.random() * 0.5,
                rotationSpeed: 0.2 + Math.random() * 0.3,
                phase: Math.random() * Math.PI * 2
            };
            
            this.scene.add(crystal);
            
            // Add to particles array for animation
            this.particles.push({
                mesh: crystal,
                type: 'crystal'
            });
        }
    }
    
    createEnhancedPlayerWizard() {
        // Create a wizard group
        const wizardGroup = new THREE.Group();
        wizardGroup.position.set(-2, -0.5, 0);
        this.scene.add(wizardGroup);
        this.playerWizard = wizardGroup;
        
        // Create wizard body
        const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x4040ff,
            emissive: 0x101040,
            shininess: 30
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        wizardGroup.add(body);
        
        // Add wizard hat
        const hatGeometry = new THREE.ConeGeometry(0.3, 0.7, 32);
        const hatMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2020a0,
            shininess: 50
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1, 0);
        hat.castShadow = true;
        wizardGroup.add(hat);
        
        // Add staff
        const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const staffMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8b4513,
            shininess: 20
        });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(0.5, 0, 0);
        staff.rotation.z = Math.PI / 4;
        staff.castShadow = true;
        wizardGroup.add(staff);
        
        // Add glowing orb to staff
        const orbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const orbMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00aaaa,
            emissiveIntensity: 0.5,
            shininess: 90
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(0.8, 0.8, 0);
        wizardGroup.add(orb);
        
        // Add point light to orb
        const orbLight = new THREE.PointLight(0x00ffff, 1, 3);
        orbLight.position.copy(orb.position);
        wizardGroup.add(orbLight);
        
        // Add particle system for the orb
        this.createOrbParticles(orb.position, 0x00ffff, wizardGroup);
    }
    
    createEnhancedOpponentWizard() {
        // Create a wizard group
        const wizardGroup = new THREE.Group();
        wizardGroup.position.set(2, -0.5, 0);
        this.scene.add(wizardGroup);
        this.opponentWizard = wizardGroup;
        
        // Create wizard body
        const bodyGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff4040,
            emissive: 0x401010,
            shininess: 30
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        wizardGroup.add(body);
        
        // Add wizard hat
        const hatGeometry = new THREE.ConeGeometry(0.3, 0.7, 32);
        const hatMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xa02020,
            shininess: 50
        });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1, 0);
        hat.castShadow = true;
        wizardGroup.add(hat);
        
        // Add staff
        const staffGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2, 8);
        const staffMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8b4513,
            shininess: 20
        });
        const staff = new THREE.Mesh(staffGeometry, staffMaterial);
        staff.position.set(-0.5, 0, 0);
        staff.rotation.z = -Math.PI / 4;
        staff.castShadow = true;
        wizardGroup.add(staff);
        
        // Add glowing orb to staff
        const orbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const orbMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff00ff,
            emissive: 0xaa00aa,
            emissiveIntensity: 0.5,
            shininess: 90
        });
        const orb = new THREE.Mesh(orbGeometry, orbMaterial);
        orb.position.set(-0.8, 0.8, 0);
        wizardGroup.add(orb);
        
        // Add point light to orb
        const orbLight = new THREE.PointLight(0xff00ff, 1, 3);
        orbLight.position.copy(orb.position);
        wizardGroup.add(orbLight);
        
        // Add particle system for the orb
        this.createOrbParticles(orb.position, 0xff00ff, wizardGroup);
    }
    
    createOrbParticles(position, color, parent) {
        // Create a particle system for the orb
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.03,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const particlesCount = 20;
        const particlesPositions = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            particlesPositions[i3] = position.x;
            particlesPositions[i3 + 1] = position.y;
            particlesPositions[i3 + 2] = position.z;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
        
        const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        parent.add(particleSystem);
        
        // Add to particles array for animation
        this.particles.push({
            mesh: particleSystem,
            type: 'orbParticles',
            center: position.clone(),
            positions: particlesPositions,
            color: color
        });
    }
    
    createAmbientParticles() {
        // Create ambient particles floating in the scene
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x9050ff,
            size: 0.02,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        
        const particlesCount = 100;
        const particlesPositions = new Float32Array(particlesCount * 3);
        const particlesVelocities = [];
        
        for (let i = 0; i < particlesCount; i++) {
            const i3 = i * 3;
            const radius = 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            particlesPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            particlesPositions[i3 + 1] = (Math.random() * 2 - 1) * 2;
            particlesPositions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
            
            particlesVelocities.push({
                x: (Math.random() - 0.5) * 0.01,
                y: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            });
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
        
        const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(particleSystem);
        
        // Add to particles array for animation
        this.particles.push({
            mesh: particleSystem,
            type: 'ambient',
            positions: particlesPositions,
            velocities: particlesVelocities
        });
    }
    
    initSpellEffects() {
        // Initialize enhanced spell effect templates
        this.spellEffects = {
            fire: {
                color: 0xff5030,
                emissive: 0xaa2010,
                particleCount: 60,
                speed: 0.12,
                size: 0.1,
                lightColor: 0xff5030,
                lightIntensity: 2
            },
            water: {
                color: 0x3080ff,
                emissive: 0x1040aa,
                particleCount: 50,
                speed: 0.1,
                size: 0.08,
                lightColor: 0x3080ff,
                lightIntensity: 1.5
            },
            earth: {
                color: 0x80c040,
                emissive: 0x406020,
                particleCount: 40,
                speed: 0.08,
                size: 0.12,
                lightColor: 0x80c040,
                lightIntensity: 1.2
            },
            air: {
                color: 0xc0c0ff,
                emissive: 0x8080aa,
                particleCount: 70,
                speed: 0.15,
                size: 0.06,
                lightColor: 0xc0c0ff,
                lightIntensity: 1.8
            },
            arcane: {
                color: 0xa050ff,
                emissive: 0x6030aa,
                particleCount: 55,
                speed: 0.13,
                size: 0.09,
                lightColor: 0xa050ff,
                lightIntensity: 2
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
        
        // Add a light that follows the spell
        const spellLight = new THREE.PointLight(
            effect.lightColor,
            effect.lightIntensity,
            3
        );
        spellLight.position.copy(source.position);
        particles.add(spellLight);
        
        // Create particles
        for (let i = 0; i < effect.particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(
                effect.size * (0.5 + Math.random() * 0.5), 
                8, 
                8
            );
            const particleMaterial = new THREE.MeshPhongMaterial({
                color: effect.color,
                emissive: effect.emissive,
                emissiveIntensity: 0.5,
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
                life: 1.0,
                initialScale: particle.scale.clone()
            };
            
            particles.add(particle);
        }
        
        // Store particles for animation
        this.activeSpellEffects.push({
            particles,
            light: spellLight,
            type: spellType.toLowerCase(),
            target,
            age: 0
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
        
        // Add impact light
        const impactLight = new THREE.PointLight(
            effect.lightColor,
            effect.lightIntensity * 1.5,
            3
        );
        impactLight.position.copy(target.position);
        impactGroup.add(impactLight);
        
        // Create particles
        for (let i = 0; i < effect.particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(
                effect.size * (0.5 + Math.random() * 0.5), 
                8, 
                8
            );
            const particleMaterial = new THREE.MeshPhongMaterial({
                color: effect.color,
                emissive: effect.emissive,
                emissiveIntensity: 0.5,
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
                    (Math.random() - 0.5) * speed
                ),
                life: 1.0,
                initialScale: particle.scale.clone()
            };
            
            impactGroup.add(particle);
        }
        
        // Store impact for animation
        this.activeSpellEffects.push({
            particles: impactGroup,
            light: impactLight,
            type: 'impact',
            life: 1.0,
            age: 0
        });
    }
    
    updateSpellEffects(delta) {
        if (!this.activeSpellEffects) return;
        
        for (let i = this.activeSpellEffects.length - 1; i >= 0; i--) {
            const effect = this.activeSpellEffects[i];
            effect.age += delta;
            
            if (effect.type === 'impact') {
                // Update impact effect
                effect.life -= delta * 0.7;
                
                if (effect.life <= 0) {
                    this.scene.remove(effect.particles);
                    this.activeSpellEffects.splice(i, 1);
                    continue;
                }
                
                // Update light intensity
                if (effect.light) {
                    effect.light.intensity = effect.life * 2;
                }
                
                // Update particles
                effect.particles.children.forEach(particle => {
                    if (particle.type !== 'PointLight') {
                        particle.position.add(particle.userData.velocity);
                        particle.userData.velocity.multiplyScalar(0.95); // Slow down
                        particle.material.opacity = effect.life;
                        particle.scale.copy(particle.userData.initialScale).multiplyScalar(effect.life);
                        
                        // Add rotation for more dynamic effect
                        particle.rotation.x += delta * 2;
                        particle.rotation.y += delta * 2;
                    }
                });
            } else {
                // Update traveling spell particles
                let allParticlesReached = true;
                
                // Update light position to follow the center of the particles
                if (effect.light && effect.particles.children.length > 1) {
                    const center = new THREE.Vector3();
                    let count = 0;
                    
                    effect.particles.children.forEach(particle => {
                        if (particle.type !== 'PointLight') {
                            center.add(particle.position);
                            count++;
                        }
                    });
                    
                    if (count > 0) {
                        center.divideScalar(count);
                        effect.light.position.copy(center);
                    }
                }
                
                effect.particles.children.forEach(particle => {
                    if (particle.type !== 'PointLight') {
                        // Move particle
                        particle.position.add(particle.userData.velocity);
                        
                        // Add rotation for more dynamic effect
                        particle.rotation.x += delta * 5;
                        particle.rotation.y += delta * 5;
                        
                        // Check if reached target
                        const distanceToTarget = particle.position.distanceTo(effect.target.position);
                        
                        if (distanceToTarget > 0.5) {
                            allParticlesReached = false;
                        } else {
                            // Fade out when reaching target
                            particle.userData.life -= delta * 2;
                            particle.material.opacity = particle.userData.life;
                            particle.scale.copy(particle.userData.initialScale).multiplyScalar(particle.userData.life);
                            
                            if (particle.userData.life <= 0) {
                                effect.particles.remove(particle);
                            }
                        }
                    }
                });
                
                // Remove effect if all particles reached target or disappeared
                if (allParticlesReached || effect.particles.children.length <= 1) {
                    this.scene.remove(effect.particles);
                    this.activeSpellEffects.splice(i, 1);
                }
            }
        }
    }
    
    updateParticles(delta) {
        // Update all particle systems
        this.particles.forEach(particleSystem => {
            switch (particleSystem.type) {
                case 'crystal':
                    // Update floating crystals
                    const crystal = particleSystem.mesh;
                    const userData = crystal.userData;
                    
                    // Float up and down
                    crystal.position.y = userData.initialY + 
                        Math.sin(this.clock.getElapsedTime() * userData.floatSpeed + userData.phase) * 0.2;
                    
                    // Rotate
                    crystal.rotation.x += delta * userData.rotationSpeed;
                    crystal.rotation.z += delta * userData.rotationSpeed;
                    break;
                    
                case 'orbParticles':
                    // Update orb particles
                    const positions = particleSystem.positions;
                    const center = particleSystem.center;
                    
                    for (let i = 0; i < positions.length; i += 3) {
                        // Calculate a random position around the center
                        const angle = Math.random() * Math.PI * 2;
                        const radius = 0.1 + Math.random() * 0.1;
                        
                        positions[i] = center.x + Math.cos(angle) * radius;
                        positions[i + 1] = center.y + Math.sin(angle) * radius;
                        positions[i + 2] = center.z + (Math.random() - 0.5) * 0.1;
                    }
                    
                    particleSystem.mesh.geometry.attributes.position.needsUpdate = true;
                    break;
                    
                case 'ambient':
                    // Update ambient particles
                    const ambientPositions = particleSystem.positions;
                    const velocities = particleSystem.velocities;
                    
                    for (let i = 0; i < ambientPositions.length / 3; i++) {
                        const i3 = i * 3;
                        
                        // Move particle
                        ambientPositions[i3] += velocities[i].x;
                        ambientPositions[i3 + 1] += velocities[i].y;
                        ambientPositions[i3 + 2] += velocities[i].z;
                        
                        // Check boundaries and wrap around
                        if (ambientPositions[i3] < -5) ambientPositions[i3] = 5;
                        if (ambientPositions[i3] > 5) ambientPositions[i3] = -5;
                        
                        if (ambientPositions[i3 + 1] < -2) ambientPositions[i3 + 1] = 2;
                        if (ambientPositions[i3 + 1] > 2) ambientPositions[i3 + 1] = -2;
                        
                        if (ambientPositions[i3 + 2] < -5) ambientPositions[i3 + 2] = 5;
                        if (ambientPositions[i3 + 2] > 5) ambientPositions[i3 + 2] = -5;
                    }
                    
                    particleSystem.mesh.geometry.attributes.position.needsUpdate = true;
                    break;
            }
        });
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
        
        // Dispose of geometries and materials
        this.scene.traverse(object => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            
            if (object.material) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        // Clear arrays
        this.activeSpellEffects = [];
        this.particles = [];
    }
}
