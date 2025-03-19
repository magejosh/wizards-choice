// Audio Manager class - handles sound effects and music

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.volume = 0.7;
    }
    
    async init() {
        console.log('Initializing Audio Manager...');
        
        // For MVP, we'll use simple audio elements
        // In a full implementation, we would load actual audio files
        this.createAudioElements();
        
        console.log('Audio Manager initialized');
        return Promise.resolve();
    }
    
    createAudioElements() {
        // Create audio elements for each sound type
        const soundTypes = [
            'spell_fire',
            'spell_water',
            'spell_earth',
            'spell_air',
            'spell_arcane',
            'victory',
            'defeat',
            'menu_click',
            'battle_start'
        ];
        
        // For MVP, we'll create audio elements but not load actual files
        // This allows the structure to be in place for later implementation
        soundTypes.forEach(type => {
            this.sounds[type] = document.createElement('audio');
            this.sounds[type].volume = this.volume;
        });
        
        // Create background music element
        this.music = document.createElement('audio');
        this.music.loop = true;
        this.music.volume = this.volume * 0.5; // Music at lower volume than effects
    }
    
    playSound(soundType) {
        if (this.isMuted) return;
        
        // Map general spell types to specific sound types
        if (soundType.toLowerCase() === 'fire') {
            soundType = 'spell_fire';
        } else if (soundType.toLowerCase() === 'water') {
            soundType = 'spell_water';
        } else if (soundType.toLowerCase() === 'earth') {
            soundType = 'spell_earth';
        } else if (soundType.toLowerCase() === 'air') {
            soundType = 'spell_air';
        } else if (soundType.toLowerCase() === 'arcane') {
            soundType = 'spell_arcane';
        }
        
        // Check if sound exists
        if (!this.sounds[soundType]) {
            console.warn(`Sound not found: ${soundType}`);
            return;
        }
        
        // For MVP, we'll just log the sound that would play
        // In a full implementation, we would play the actual sound
        console.log(`Playing sound: ${soundType}`);
        
        try {
            // Reset the audio to the beginning
            this.sounds[soundType].currentTime = 0;
            
            // Play the sound
            const playPromise = this.sounds[soundType].play();
            
            // Handle play promise (required for modern browsers)
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error playing sound: ${error}`);
                });
            }
        } catch (error) {
            console.warn(`Error playing sound: ${error}`);
        }
    }
    
    playMusic(musicType) {
        if (this.isMuted) return;
        
        // For MVP, we'll just log the music that would play
        console.log(`Playing music: ${musicType}`);
        
        // In a full implementation, we would set the music source and play it
        try {
            const playPromise = this.music.play();
            
            // Handle play promise (required for modern browsers)
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error playing music: ${error}`);
                });
            }
        } catch (error) {
            console.warn(`Error playing music: ${error}`);
        }
    }
    
    stopMusic() {
        try {
            this.music.pause();
            this.music.currentTime = 0;
        } catch (error) {
            console.warn(`Error stopping music: ${error}`);
        }
    }
    
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Update volume for all sounds
        for (const sound of Object.values(this.sounds)) {
            sound.volume = this.volume;
        }
        
        // Update music volume (lower than sound effects)
        this.music.volume = this.volume * 0.5;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.isMuted) {
            this.stopMusic();
        } else {
            // Resume music if it was playing
            if (this.music.src) {
                this.music.play().catch(error => {
                    console.warn(`Error resuming music: ${error}`);
                });
            }
        }
        
        return this.isMuted;
    }
    
    // Method to preload sounds for better performance
    // This would be implemented in a full version
    preloadSounds() {
        // This is a placeholder for future implementation
        console.log('Preloading sounds...');
    }
}
