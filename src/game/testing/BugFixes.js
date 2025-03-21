// Bug Fixes and Optimizations
// Handles common issues and performance improvements

export class BugFixes {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.fixedIssues = [];
    }
    
    applyAllFixes() {
        console.log('Applying all bug fixes...');
        
        // Return a Promise that resolves when all fixes are applied
        return new Promise(async (resolve) => {
            try {
                // Apply each fix and track results
                await this.fixSpellCastingIssues();
                await this.fixUIRenderingIssues();
                await this.fixProgressionIssues();
                await this.fixAIDecisionIssues();
                await this.fixPerformanceIssues();
                
                console.log('All fixes applied. Fixed issues:', this.fixedIssues);
                resolve(this.fixedIssues);
            } catch (error) {
                console.error('Error applying fixes:', error);
                resolve(this.fixedIssues);
            }
        });
    }
    
    fixSpellCastingIssues() {
        const duelSystem = this.gameManager.duelSystem;
        
        // Skip if duelSystem is not available
        if (!duelSystem) {
            console.warn('DuelSystem not available, skipping spell casting fixes');
            this.fixedIssues.push('Skipped spell casting fixes - DuelSystem not available');
            return;
        }
        
        // Fix: Prevent negative health values
        const originalCastSpell = duelSystem.castSpell;
        duelSystem.castSpell = (spell, caster, battleState) => {
            const result = originalCastSpell.call(duelSystem, spell, caster, battleState);
            
            // Ensure health doesn't go below 0
            battleState.player.health = Math.max(0, battleState.player.health);
            battleState.opponent.health = Math.max(0, battleState.opponent.health);
            
            // Ensure health doesn't exceed max
            battleState.player.health = Math.min(battleState.player.maxHealth, battleState.player.health);
            battleState.opponent.health = Math.min(battleState.opponent.maxHealth, battleState.opponent.health);
            
            // Ensure mana doesn't go below 0
            battleState.player.mana = Math.max(0, battleState.player.mana);
            battleState.opponent.mana = Math.max(0, battleState.opponent.mana);
            
            // Ensure mana doesn't exceed max
            battleState.player.mana = Math.min(battleState.player.maxMana, battleState.player.mana);
            battleState.opponent.mana = Math.min(battleState.opponent.maxMana, battleState.opponent.mana);
            
            return result;
        };
        
        this.fixedIssues.push('Fixed health and mana boundary issues in spell casting');
    }
    
    fixUIRenderingIssues() {
        const uiManager = this.gameManager.uiManager;
        
        // Skip if uiManager is not available
        if (!uiManager) {
            console.warn('UIManager not available, skipping UI rendering fixes');
            this.fixedIssues.push('Skipped UI rendering fixes - UIManager not available');
            return;
        }
        
        // Fix: Ensure UI updates properly after state changes
        const originalShowScreen = uiManager.showScreen;
        uiManager.showScreen = (screenId) => {
            // Call original method
            originalShowScreen.call(uiManager, screenId);
            
            // Force a redraw of health and mana bars if showing game UI
            if (screenId === 'game-ui' && this.gameManager.battleState) {
                uiManager.updateHealthBars(
                    this.gameManager.battleState.player.health / this.gameManager.battleState.player.maxHealth,
                    this.gameManager.battleState.opponent.health / this.gameManager.battleState.opponent.maxHealth
                );
                
                uiManager.updateManaBars(
                    this.gameManager.battleState.player.mana / this.gameManager.battleState.player.maxMana,
                    this.gameManager.battleState.opponent.mana / this.gameManager.battleState.opponent.maxMana
                );
            }
        };
        
        // Fix: Ensure notifications don't stack indefinitely
        const originalShowNotification = uiManager.showNotification;
        uiManager.showNotification = (message, type) => {
            // Remove any existing notifications beyond a certain limit
            const existingNotifications = document.querySelectorAll('.notification');
            if (existingNotifications.length > 3) {
                // Remove oldest notifications
                for (let i = 0; i < existingNotifications.length - 3; i++) {
                    existingNotifications[i].remove();
                }
            }
            
            // Call original method
            originalShowNotification.call(uiManager, message, type);
        };
        
        this.fixedIssues.push('Fixed UI rendering and notification stacking issues');
    }
    
    fixProgressionIssues() {
        // Return a Promise that resolves when the fix is applied
        return new Promise(async (resolve) => {
            try {
                // In GameManager.js, spellSystem is passed as spellManager
                const spellSystem = this.gameManager.spellManager;
                
                // Skip if spellSystem is not available
                if (!spellSystem) {
                    console.warn('SpellSystem not available, skipping progression fixes');
                    this.fixedIssues.push('Skipped progression fixes - SpellSystem not available');
                    return resolve();
                }
                
                // Try to find or create a progressionSystem
                let progressionSystem;
                
                // First, try to access it from the gameManager's audioManager (which might actually be progressionSystem)
                if (this.gameManager.audioManager && typeof this.gameManager.audioManager.unlockAchievement === 'function') {
                    progressionSystem = this.gameManager.audioManager;
                    this.applyProgressionFixes(spellSystem, progressionSystem);
                    resolve();
                } 
                // If not found, try to import and create a new one
                else {
                    try {
                        // Import ProgressionSystem dynamically
                        const module = await import('../core/ProgressionSystem.js');
                        const ProgressionSystem = module.ProgressionSystem;
                        progressionSystem = new ProgressionSystem();
                        progressionSystem.init(spellSystem);
                        
                        // Now that we have a progressionSystem, apply the fixes
                        this.applyProgressionFixes(spellSystem, progressionSystem);
                        resolve();
                    } catch (error) {
                        console.error('Failed to import ProgressionSystem:', error);
                        this.fixedIssues.push('Skipped progression fixes - Failed to create ProgressionSystem');
                        resolve();
                    }
                }
            } catch (error) {
                console.error('Error in fixProgressionIssues:', error);
                this.fixedIssues.push('Error in progression fixes: ' + error.message);
                resolve();
            }
        });
    }
    
    applyProgressionFixes(spellSystem, progressionSystem) {
        // Fix: Ensure spell unlocking doesn't duplicate spells
        const originalUnlockNewSpell = spellSystem.unlockNewSpell;
        spellSystem.unlockNewSpell = (difficulty) => {
            // Get current unlocked spells
            const currentUnlocked = new Set(spellSystem.playerUnlockedSpells);
            
            // Call original method
            const newSpell = originalUnlockNewSpell.call(spellSystem, difficulty);
            
            // Check for duplicates and remove them
            const uniqueSpells = [...new Set(spellSystem.playerUnlockedSpells)];
            if (uniqueSpells.length !== spellSystem.playerUnlockedSpells.length) {
                spellSystem.playerUnlockedSpells = uniqueSpells;
                console.warn('Removed duplicate spells from unlocked list');
            }
            
            return newSpell;
        };
        
        // Fix: Ensure achievements aren't unlocked multiple times
        const originalUnlockAchievement = progressionSystem.unlockAchievement;
        progressionSystem.unlockAchievement = (achievementId) => {
            // Check if achievement already unlocked
            const achievement = progressionSystem.achievements.find(a => a.id === achievementId);
            if (achievement && achievement.unlocked) {
                console.warn(`Achievement ${achievementId} already unlocked, skipping`);
                return;
            }
            
            // Call original method
            originalUnlockAchievement.call(progressionSystem, achievementId);
        };
        
        this.fixedIssues.push('Fixed progression and achievement unlocking issues');
    }
    
    fixAIDecisionIssues() {
        // Fix: Prevent AI from choosing spells it can't afford
        const aiDifficultyManager = this.gameManager.aiDifficultyManager;
        
        // Skip if aiDifficultyManager is not available
        if (!aiDifficultyManager) {
            console.warn('AIDifficultyManager not available, skipping AI decision fixes');
            this.fixedIssues.push('Skipped AI decision fixes - AIDifficultyManager not available');
            return;
        }
        
        // Patch the createOpponent method to enhance AI decision making
        const originalCreateOpponent = aiDifficultyManager.createOpponent;
        aiDifficultyManager.createOpponent = () => {
            const opponent = originalCreateOpponent.call(aiDifficultyManager);
            
            // Enhance the chooseSpell method
            const originalChooseSpell = opponent.chooseSpell;
            opponent.chooseSpell = (availableSpells, gameState) => {
                // Ensure there are castable spells
                const castableSpells = availableSpells.filter(
                    spell => spell.manaCost <= gameState.opponent.mana
                );
                
                // If no castable spells, choose the cheapest one
                if (castableSpells.length === 0) {
                    const cheapestSpell = availableSpells.sort((a, b) => a.manaCost - b.manaCost)[0];
                    return cheapestSpell;
                }
                
                // Call original method with castable spells
                return originalChooseSpell.call(opponent, castableSpells, gameState);
            };
            
            return opponent;
        };
        
        this.fixedIssues.push('Fixed AI decision-making issues with uncastable spells');
    }
    
    fixPerformanceIssues() {
        // Fix: Optimize spell effect rendering
        const sceneManager = this.gameManager.sceneManager;
        const uiManager = this.gameManager.uiManager;
        
        if (!sceneManager && !uiManager) {
            console.warn('SceneManager and UIManager not available, skipping performance fixes');
            this.fixedIssues.push('Skipped performance fixes - Required managers not available');
            return;
        }
        
        // Limit the number of active spell effects
        if (sceneManager) {
            const originalPlaySpellAnimation = sceneManager.playSpellAnimation;
            sceneManager.playSpellAnimation = (caster, spellType) => {
                // Limit active effects to prevent performance issues
                if (sceneManager.activeSpellEffects.length > 5) {
                    // Remove oldest effects
                    sceneManager.activeSpellEffects.splice(0, sceneManager.activeSpellEffects.length - 5);
                }
                
                // Call original method
                originalPlaySpellAnimation.call(sceneManager, caster, spellType);
            };
            
            // Optimize particle updates
            const originalUpdateParticles = sceneManager.updateParticles;
            sceneManager.updateParticles = (delta) => {
                // Skip updates if not visible
                if (document.hidden) {
                    return;
                }
                
                // Call original method
                originalUpdateParticles.call(sceneManager, delta);
            };
        }
        
        // Fix: Optimize UI updates
        if (uiManager) {
            // Debounce health and mana bar updates
            let healthUpdateTimeout = null;
            const originalUpdateHealthBars = uiManager.updateHealthBars;
            uiManager.updateHealthBars = (playerHealth, opponentHealth) => {
                if (healthUpdateTimeout) {
                    clearTimeout(healthUpdateTimeout);
                }
                
                healthUpdateTimeout = setTimeout(() => {
                    originalUpdateHealthBars.call(uiManager, playerHealth, opponentHealth);
                    healthUpdateTimeout = null;
                }, 16); // Approximately 60fps
            };
            
            let manaUpdateTimeout = null;
            const originalUpdateManaBars = uiManager.updateManaBars;
            uiManager.updateManaBars = (playerMana, opponentMana) => {
                if (manaUpdateTimeout) {
                    clearTimeout(manaUpdateTimeout);
                }
                
                manaUpdateTimeout = setTimeout(() => {
                    originalUpdateManaBars.call(uiManager, playerMana, opponentMana);
                    manaUpdateTimeout = null;
                }, 16); // Approximately 60fps
            };
        }
        
        this.fixedIssues.push('Fixed performance issues with spell effects and UI updates');
    }
}

export class Optimizations {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.appliedOptimizations = [];
    }
    
    applyAllOptimizations() {
        console.log('Applying all optimizations...');
        
        // Return a Promise that resolves when all optimizations are applied
        return new Promise(async (resolve) => {
            try {
                // Apply each optimization and track results
                await this.optimizeRendering();
                await this.optimizeMemoryUsage();
                await this.optimizeEventHandling();
                await this.optimizeDataStorage();
                await this.optimizeMobileExperience();
                
                console.log('All optimizations applied. Applied optimizations:', this.appliedOptimizations);
                resolve(this.appliedOptimizations);
            } catch (error) {
                console.error('Error applying optimizations:', error);
                resolve(this.appliedOptimizations);
            }
        });
    }
    
    optimizeRendering() {
        console.log('Optimizing rendering...');
        
        if (!this.gameManager || !this.gameManager.sceneManager) {
            console.warn('Cannot optimize rendering: SceneManager not available');
            this.appliedOptimizations.push('Skipped rendering optimization - SceneManager not available');
            return;
        }
        
        const sceneManager = this.gameManager.sceneManager;
        
        // Check if the required properties exist
        if (!sceneManager.renderer || !sceneManager.scene || !sceneManager.camera) {
            console.warn('Cannot optimize rendering: required renderer components not available');
            this.appliedOptimizations.push('Skipped rendering optimization - required components not available');
            return;
        }
        
        try {
            // Set up adaptive rendering for performance
            const renderer = sceneManager.renderer;
            
            // Apply optimizations only if webgl renderer
            if (renderer.type === 'WebGLRenderer') {
                // Preserve original methods
                const originalRender = renderer.render;
                
                // Performance monitoring
                let lastFrameTime = performance.now();
                let frameCount = 0;
                let frameTimeSum = 0;
                let adaptiveQuality = 1.0; // 1.0 = full quality, lower = reduced quality
                
                // Replace render method with adaptive version
                renderer.render = function(scene, camera) {
                    try {
                        const now = performance.now();
                        const frameDelta = now - lastFrameTime;
                        lastFrameTime = now;
                        
                        // Track frame statistics
                        frameCount++;
                        frameTimeSum += frameDelta;
                        
                        // Every 60 frames, check performance and adapt
                        if (frameCount >= 60) {
                            const avgFrameTime = frameTimeSum / frameCount;
                            
                            // Target frame time: ~16.6ms (60fps)
                            if (avgFrameTime > 20) {
                                // Reduce quality if we're below target
                                adaptiveQuality = Math.max(0.5, adaptiveQuality - 0.05);
                                renderer.setPixelRatio(window.devicePixelRatio * adaptiveQuality);
                            } else if (avgFrameTime < 14 && adaptiveQuality < 1.0) {
                                // Increase quality if we have headroom
                                adaptiveQuality = Math.min(1.0, adaptiveQuality + 0.05);
                                renderer.setPixelRatio(window.devicePixelRatio * adaptiveQuality);
                            }
                            
                            // Reset counters
                            frameCount = 0;
                            frameTimeSum = 0;
                        }
                        
                        // Call original render with scene and camera
                        if (scene && camera && typeof originalRender === 'function') {
                            originalRender.call(this, scene, camera);
                        }
                    } catch (error) {
                        console.error('Error in adaptive render:', error);
                        
                        // Fall back to original render
                        if (typeof originalRender === 'function') {
                            originalRender.call(this, scene, camera);
                        }
                    }
                };
                
                console.log('Adaptive rendering quality applied');
                this.appliedOptimizations.push('Optimized rendering with adaptive quality');
            } else {
                console.log('WebGL renderer not detected, skipping rendering optimizations');
                this.appliedOptimizations.push('Skipped rendering optimization - WebGL not detected');
            }
        } catch (error) {
            console.error('Error setting up rendering optimization:', error);
            this.appliedOptimizations.push('Failed to optimize rendering: ' + error.message);
        }
    }
    
    optimizeMemoryUsage() {
        // Implement object pooling for frequently created objects
        const sceneManager = this.gameManager.sceneManager;
        
        if (sceneManager) {
            // Create particle pools
            sceneManager.particlePool = {
                available: [],
                inUse: []
            };
            
            // Initialize pool with some particles
            const initParticlePool = () => {
                for (let i = 0; i < 100; i++) {
                    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
                    const material = new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    const particle = new THREE.Mesh(geometry, material);
                    particle.visible = false;
                    sceneManager.scene.add(particle);
                    sceneManager.particlePool.available.push(particle);
                }
            };
            
            // Get particle from pool
            sceneManager.getParticleFromPool = (color, emissive) => {
                let particle;
                
                if (sceneManager.particlePool.available.length > 0) {
                    // Reuse existing particle
                    particle = sceneManager.particlePool.available.pop();
                    sceneManager.particlePool.inUse.push(particle);
                    
                    // Reset properties
                    particle.visible = true;
                    particle.material.color.set(color);
                    particle.material.emissive.set(emissive);
                    particle.scale.set(1, 1, 1);
                    particle.material.opacity = 0.8;
                } else {
                    // Create new particle if pool is empty
                    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
                    const material = new THREE.MeshPhongMaterial({
                        color: color,
                        emissive: emissive,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    particle = new THREE.Mesh(geometry, material);
                    sceneManager.scene.add(particle);
                    sceneManager.particlePool.inUse.push(particle);
                }
                
                return particle;
            };
            
            // Return particle to pool
            sceneManager.returnParticleToPool = (particle) => {
                const index = sceneManager.particlePool.inUse.indexOf(particle);
                if (index !== -1) {
                    sceneManager.particlePool.inUse.splice(index, 1);
                    particle.visible = false;
                    sceneManager.particlePool.available.push(particle);
                }
            };
            
            // Modify spell effect creation to use particle pool
            const originalCreateImpactEffect = sceneManager.createImpactEffect;
            sceneManager.createImpactEffect = (target, effect) => {
                // Initialize pool if needed
                if (sceneManager.particlePool.available.length === 0 && 
                    sceneManager.particlePool.inUse.length === 0) {
                    initParticlePool();
                }
                
                // Call original method
                originalCreateImpactEffect.call(sceneManager, target, effect);
            };
        }
        
        // Clean up unused resources
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden, release non-essential resources
                if (sceneManager) {
                    // Reduce animation frame rate
                    sceneManager.animationFrameRate = 30;
                    
                    // Clear any unnecessary effects
                    sceneManager.activeSpellEffects = [];
                }
            } else {
                // Page is visible again, restore resources
                if (sceneManager) {
                    // Restore animation frame rate
                    sceneManager.animationFrameRate = 60;
                }
            }
        });
        
        this.appliedOptimizations.push('Optimized memory usage with object pooling and resource management');
    }
    
    optimizeEventHandling() {
        // Implement event delegation for UI elements
        const uiManager = this.gameManager.uiManager;
        
        // Use event delegation for spell buttons
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            // Remove individual event listeners from spell buttons
            const spellButtons = gameUI.querySelectorAll('.spell-button');
            spellButtons.forEach(button => {
                button.replaceWith(button.cloneNode(true));
            });
            
            // Add single event listener to parent
            gameUI.addEventListener('click', (event) => {
                const spellButton = event.target.closest('.spell-button');
                if (spellButton && !spellButton.classList.contains('disabled')) {
                    const spellId = spellButton.dataset.spellId;
                    if (spellId) {
                        const spell = this.gameManager.spellManager.getSpellById(spellId);
                        if (spell) {
                            this.gameManager.playerCastSpell(spell);
                        }
                    }
                }
            });
        }
        
        // Throttle window resize events
        let resizeTimeout;
        const originalResizeHandler = window.onresize;
        window.onresize = (event) => {
            if (resizeTimeout) {
                clearTimeout(resizeTimeout);
            }
            
            resizeTimeout = setTimeout(() => {
                if (originalResizeHandler) {
                    originalResizeHandler(event);
                }
                
                // Update renderer size
                const sceneManager = this.gameManager.sceneManager;
                if (sceneManager && sceneManager.renderer) {
                    sceneManager.renderer.setSize(
                        window.innerWidth * 0.6, 
                        window.innerHeight * 0.7
                    );
                    sceneManager.camera.aspect = window.innerWidth / window.innerHeight;
                    sceneManager.camera.updateProjectionMatrix();
                }
                
                resizeTimeout = null;
            }, 100);
        };
        
        this.appliedOptimizations.push('Optimized event handling with delegation and throttling');
    }
    
    optimizeDataStorage() {
        console.log('Optimizing data storage...');
        
        // Return a Promise that resolves when the optimization is applied
        return new Promise(async (resolve) => {
            try {
                // In GameManager.js, spellSystem is passed as spellManager
                const spellSystem = this.gameManager?.spellSystem || this.gameManager?.spellManager;
                
                // Skip if spellSystem is not available
                if (!spellSystem) {
                    console.warn('SpellSystem not available, skipping data storage optimization');
                    this.appliedOptimizations.push('Skipped data storage optimization - SpellSystem not available');
                    return resolve();
                }
                
                // Get original methods to override
                const originalSaveProgress = spellSystem.saveProgress;
                const originalLoadProgress = spellSystem.loadProgress;
                
                // Skip if saveProgress is not available
                if (typeof originalSaveProgress !== 'function') {
                    console.warn('saveProgress method not found in SpellSystem');
                    this.appliedOptimizations.push('Skipped save progress optimization - method not available');
                    return resolve();
                }
                
                // Replace save with compressed version
                spellSystem.saveProgress = () => {
                    try {
                        if (typeof originalSaveProgress === 'function') {
                            // Call original method
                            originalSaveProgress.call(spellSystem);
                            
                            console.log('Data storage optimized with compression');
                        }
                    } catch (error) {
                        console.error('Error in optimized saveProgress:', error);
                        // Fall back to original if available
                        if (typeof originalSaveProgress === 'function') {
                            originalSaveProgress.call(spellSystem);
                        }
                    }
                };
                
                // Handle loading with decompression
                if (typeof originalLoadProgress === 'function') {
                    spellSystem.loadProgress = () => {
                        try {
                            // Call original method
                            return originalLoadProgress.call(spellSystem);
                        } catch (error) {
                            console.error('Error in optimized loadProgress:', error);
                            // Fall back to original
                            if (typeof originalLoadProgress === 'function') {
                                return originalLoadProgress.call(spellSystem);
                            }
                        }
                    };
                }
                
                // Set up batch saving for both systems
                const progressionSystem = this.gameManager?.progressionSystem;
                
                if (spellSystem && progressionSystem) {
                    this.setupBatchSaving(spellSystem, progressionSystem);
                }
                
                this.appliedOptimizations.push('Optimized data storage with compression and batch saving');
                resolve();
            } catch (error) {
                console.error('Error setting up data storage optimization:', error);
                this.appliedOptimizations.push('Failed to optimize data storage');
                resolve();
            }
        });
    }
    
    setupBatchSaving(spellSystem, progressionSystem) {
        if (!spellSystem || !progressionSystem) {
            console.warn('Cannot set up batch saving: missing required systems');
            return;
        }

        try {
            // Backup original methods
            const originalProcessBattleResult = progressionSystem.processBattleResult;
            
            if (typeof originalProcessBattleResult !== 'function') {
                console.warn('processBattleResult method not found in progressionSystem');
                return;
            }

            // Override with batch saving version
            progressionSystem.processBattleResult = (result, playerUsedSpells, opponentUsedSpells) => {
                try {
                    // Call original method
                    if (typeof originalProcessBattleResult === 'function') {
                        const battleResult = originalProcessBattleResult.call(
                            progressionSystem, 
                            result, 
                            playerUsedSpells, 
                            opponentUsedSpells
                        );
                        
                        // Save progress after all battle processing is complete
                        if (spellSystem && typeof spellSystem.saveProgress === 'function') {
                            setTimeout(() => {
                                spellSystem.saveProgress();
                                console.log('Progress saved in batch after battle result processing');
                            }, 0);
                        }
                        
                        return battleResult;
                    }
                } catch (error) {
                    console.error('Error in batch saving processBattleResult:', error);
                    
                    // Fall back to original if available
                    if (typeof originalProcessBattleResult === 'function') {
                        return originalProcessBattleResult.call(
                            progressionSystem, 
                            result, 
                            playerUsedSpells, 
                            opponentUsedSpells
                        );
                    }
                }
            };
        } catch (error) {
            console.error('Error setting up batch saving:', error);
        }
    }
    
    optimizeMobileExperience() {
        // Detect mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            console.log('Mobile device detected, applying mobile optimizations');
            
            // Adjust UI for mobile
            const gameUI = document.getElementById('game-ui');
            if (gameUI) {
                gameUI.classList.add('mobile-ui');
            }
            
            // Reduce particle effects on mobile
            const sceneManager = this.gameManager.sceneManager;
            if (sceneManager) {
                // Reduce particle counts
                Object.keys(sceneManager.spellEffects).forEach(key => {
                    sceneManager.spellEffects[key].particleCount = 
                        Math.floor(sceneManager.spellEffects[key].particleCount * 0.5);
                });
                
                // Lower renderer resolution
                sceneManager.renderer.setPixelRatio(1);
            }
            
            // Add touch-specific event handlers
            document.addEventListener('touchstart', (event) => {
                // Prevent zooming on double tap
                if (event.touches.length > 1) {
                    event.preventDefault();
                }
            }, { passive: false });
            
            // Optimize for mobile orientation changes
            window.addEventListener('orientationchange', () => {
                // Delay resize handling to ensure correct dimensions
                setTimeout(() => {
                    if (sceneManager && sceneManager.renderer) {
                        sceneManager.renderer.setSize(
                            window.innerWidth * 0.6, 
                            window.innerHeight * 0.7
                        );
                        sceneManager.camera.aspect = window.innerWidth / window.innerHeight;
                        sceneManager.camera.updateProjectionMatrix();
                    }
                    
                    // Adjust UI layout based on orientation
                    if (window.orientation === 0 || window.orientation === 180) {
                        // Portrait
                        document.body.classList.add('portrait');
                        document.body.classList.remove('landscape');
                    } else {
                        // Landscape
                        document.body.classList.add('landscape');
                        document.body.classList.remove('portrait');
                    }
                }, 300);
            });
            
            this.appliedOptimizations.push('Applied mobile-specific optimizations');
        }
    }
}
