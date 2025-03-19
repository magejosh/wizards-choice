// Bug Fixes and Optimizations
// Handles common issues and performance improvements

export class BugFixes {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.fixedIssues = [];
    }
    
    applyAllFixes() {
        console.log('Applying all bug fixes...');
        
        // Apply each fix and track results
        this.fixSpellCastingIssues();
        this.fixUIRenderingIssues();
        this.fixProgressionIssues();
        this.fixAIDecisionIssues();
        this.fixPerformanceIssues();
        
        console.log('All fixes applied. Fixed issues:', this.fixedIssues);
        return this.fixedIssues;
    }
    
    fixSpellCastingIssues() {
        const duelSystem = this.gameManager.duelSystem;
        
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
        const progressionSystem = this.gameManager.progressionSystem;
        const spellSystem = this.gameManager.spellSystem;
        
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
            // Check if already unlocked
            const achievement = progressionSystem.achievements.find(a => a.id === achievementId);
            if (achievement && achievement.unlocked) {
                return; // Already unlocked, do nothing
            }
            
            // Call original method
            originalUnlockAchievement.call(progressionSystem, achievementId);
        };
        
        this.fixedIssues.push('Fixed progression and achievement unlocking issues');
    }
    
    fixAIDecisionIssues() {
        // Fix: Prevent AI from choosing spells it can't afford
        const aiDifficultyManager = this.gameManager.aiDifficultyManager;
        
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
        const sceneManager = this.gameManager.uiManager.sceneManager;
        
        if (sceneManager) {
            // Limit the number of active spell effects
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
        const uiManager = this.gameManager.uiManager;
        
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
        
        // Apply each optimization and track results
        this.optimizeRendering();
        this.optimizeMemoryUsage();
        this.optimizeEventHandling();
        this.optimizeDataStorage();
        this.optimizeMobileExperience();
        
        console.log('All optimizations applied:', this.appliedOptimizations);
        return this.appliedOptimizations;
    }
    
    optimizeRendering() {
        const sceneManager = this.gameManager.uiManager.sceneManager;
        
        if (sceneManager) {
            // Use adaptive rendering quality based on device performance
            const performanceCheck = () => {
                // Measure FPS
                let frameCount = 0;
                let lastTime = performance.now();
                let fps = 0;
                
                const checkFrame = () => {
                    frameCount++;
                    const now = performance.now();
                    const elapsed = now - lastTime;
                    
                    if (elapsed >= 1000) {
                        fps = frameCount / (elapsed / 1000);
                        frameCount = 0;
                        lastTime = now;
                        
                        // Adjust quality based on FPS
                        if (fps < 30) {
                            // Low performance - reduce quality
                            sceneManager.renderer.setPixelRatio(Math.min(1, window.devicePixelRatio));
                            
                            // Reduce particle count
                            sceneManager.spellEffects.fire.particleCount = 30;
                            sceneManager.spellEffects.water.particleCount = 25;
                            sceneManager.spellEffects.earth.particleCount = 20;
                            sceneManager.spellEffects.air.particleCount = 35;
                            sceneManager.spellEffects.arcane.particleCount = 25;
                            
                            console.log('Reduced rendering quality for better performance');
                        } else if (fps > 55) {
                            // High performance - increase quality
                            sceneManager.renderer.setPixelRatio(window.devicePixelRatio);
                            
                            // Restore particle count
                            sceneManager.spellEffects.fire.particleCount = 60;
                            sceneManager.spellEffects.water.particleCount = 50;
                            sceneManager.spellEffects.earth.particleCount = 40;
                            sceneManager.spellEffects.air.particleCount = 70;
                            sceneManager.spellEffects.arcane.particleCount = 55;
                        }
                    }
                    
                    requestAnimationFrame(checkFrame);
                };
                
                checkFrame();
            };
            
            // Run performance check after scene is initialized
            const originalInit = sceneManager.init;
            sceneManager.init = async () => {
                await originalInit.call(sceneManager);
                performanceCheck();
            };
        }
        
        this.appliedOptimizations.push('Applied adaptive rendering quality based on device performance');
    }
    
    optimizeMemoryUsage() {
        // Implement object pooling for frequently created objects
        const sceneManager = this.gameManager.uiManager.sceneManager;
        
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
                        const spell = this.gameManager.spellSystem.getSpellById(spellId);
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
        // Implement efficient local storage usage
        const spellSystem = this.gameManager.spellSystem;
        
        // Compress data before storing
        const originalSaveProgress = spellSystem.saveProgress;
        spellSystem.saveProgress = () => {
            try {
                const progressData = {
                    u: spellSystem.playerUnlockedSpells, // shortened key
                    p: {
                        w: spellSystem.playerProgress.wins,
                        l: spellSystem.playerProgress.losses,
                        s: spellSystem.playerProgress.spellsUnlocked,
                        h: spellSystem.playerProgress.highestTier
                    }
                };
                
                localStorage.setItem('wc_prog', JSON.stringify(progressData)); // shortened key
                console.log('Compressed progress saved');
            } catch (error) {
                console.error('Error saving progress:', error);
            }
        };
        
        // Decompress data when loading
        const originalLoadProgress = spellSystem.loadProgress;
        spellSystem.loadProgress = () => {
            try {
                const savedData = localStorage.getItem('wc_prog');
                if (savedData) {
                    const progressData = JSON.parse(savedData);
                    
                    if (progressData.u) {
                        spellSystem.playerUnlockedSpells = progressData.u;
                    }
                    
                    if (progressData.p) {
                        spellSystem.playerProgress = {
                            wins: progressData.p.w || 0,
                            losses: progressData.p.l || 0,
                            spellsUnlocked: progressData.p.s || 0,
                            highestTier: progressData.p.h || 1
                        };
                    }
                    
                    console.log('Compressed progress loaded');
                }
            } catch (error) {
                console.error('Error loading progress:', error);
                
                // Try loading from original format as fallback
                originalLoadProgress.call(spellSystem);
            }
        };
        
        // Batch save operations
        let saveTimeout = null;
        const batchSave = () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
            
            saveTimeout = setTimeout(() => {
                spellSystem.saveProgress();
                saveTimeout = null;
            }, 1000);
        };
        
        // Replace direct saves with batched saves
        const progressionSystem = this.gameManager.progressionSystem;
        const originalProcessBattleResult = progressionSystem.processBattleResult;
        progressionSystem.processBattleResult = (won, difficulty, usedSpells) => {
            const result = originalProcessBattleResult.call(
                progressionSystem, 
                won, 
                difficulty, 
                usedSpells
            );
            
            // Use batched save instead of immediate save
            batchSave();
            
            return result;
        };
        
        this.appliedOptimizations.push('Optimized data storage with compression and batch saving');
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
            const sceneManager = this.gameManager.uiManager.sceneManager;
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
