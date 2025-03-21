// Spell Selection Interface Component
// Provides an interactive interface for selecting and managing spells

export class SpellSelectionInterface {
    constructor(spellSystem, uiManager) {
        this.spellSystem = spellSystem;
        this.uiManager = uiManager;
        this.selectedSpells = [];
        this.maxSelectedSpells = 5;
        this.filterOptions = {
            element: 'all',
            tier: 'all',
            type: 'all' // damage, healing, utility
        };
    }
    
    init() {
        // Create the spell selection interface
        this.createInterface();
        
        // Set up event listeners
        this.setupEventListeners();
        
        return this;
    }
    
    createInterface() {
        // Create container for spell selection interface
        const container = document.createElement('div');
        container.id = 'spell-selection-interface';
        container.className = 'hidden';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'spell-selection-header';
        header.innerHTML = `
            <h2>Spell Selection</h2>
            <p>Select up to ${this.maxSelectedSpells} spells for your duel</p>
        `;
        container.appendChild(header);
        
        // Create filter section
        const filterSection = document.createElement('div');
        filterSection.className = 'spell-filter-section';
        filterSection.innerHTML = `
            <div class="filter-group">
                <label>Element:</label>
                <select id="element-filter">
                    <option value="all">All Elements</option>
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="earth">Earth</option>
                    <option value="air">Air</option>
                    <option value="arcane">Arcane</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Tier:</label>
                <select id="tier-filter">
                    <option value="all">All Tiers</option>
                    <option value="1">Tier 1</option>
                    <option value="2">Tier 2</option>
                    <option value="3">Tier 3</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Type:</label>
                <select id="type-filter">
                    <option value="all">All Types</option>
                    <option value="damage">Damage</option>
                    <option value="healing">Healing</option>
                    <option value="mana">Mana</option>
                </select>
            </div>
        `;
        container.appendChild(filterSection);
        
        // Create spell list section
        const spellListSection = document.createElement('div');
        spellListSection.className = 'spell-list-section';
        spellListSection.innerHTML = `
            <div class="spell-list-header">
                <h3>Available Spells</h3>
                <span id="spell-count"></span>
            </div>
            <div id="available-spells" class="spell-list"></div>
        `;
        container.appendChild(spellListSection);
        
        // Create selected spells section
        const selectedSpellsSection = document.createElement('div');
        selectedSpellsSection.className = 'selected-spells-section';
        selectedSpellsSection.innerHTML = `
            <div class="spell-list-header">
                <h3>Selected Spells</h3>
                <span id="selected-count">0/${this.maxSelectedSpells}</span>
            </div>
            <div id="selected-spells" class="spell-list"></div>
        `;
        container.appendChild(selectedSpellsSection);
        
        // Create spell tree visualization section
        const spellTreeSection = document.createElement('div');
        spellTreeSection.className = 'spell-tree-section';
        spellTreeSection.innerHTML = `
            <div class="spell-tree-header">
                <h3>Spell Trees</h3>
                <select id="tree-element-selector">
                    <option value="fire">Fire</option>
                    <option value="water">Water</option>
                    <option value="earth">Earth</option>
                    <option value="air">Air</option>
                    <option value="arcane">Arcane</option>
                </select>
            </div>
            <div id="spell-tree-visualization" class="spell-tree"></div>
        `;
        container.appendChild(spellTreeSection);
        
        // Create buttons section
        const buttonsSection = document.createElement('div');
        buttonsSection.className = 'spell-selection-buttons';
        buttonsSection.innerHTML = `
            <button id="reset-selection" class="secondary-button">Reset Selection</button>
            <button id="confirm-selection" class="primary-button">Confirm Selection</button>
        `;
        container.appendChild(buttonsSection);
        
        // Add to document
        document.body.appendChild(container);
    }
    
    setupEventListeners() {
        // Filter change events
        document.getElementById('element-filter').addEventListener('change', () => {
            this.filterOptions.element = document.getElementById('element-filter').value;
            this.updateAvailableSpells();
        });
        
        document.getElementById('tier-filter').addEventListener('change', () => {
            this.filterOptions.tier = document.getElementById('tier-filter').value;
            this.updateAvailableSpells();
        });
        
        document.getElementById('type-filter').addEventListener('change', () => {
            this.filterOptions.type = document.getElementById('type-filter').value;
            this.updateAvailableSpells();
        });
        
        // Tree element selector
        document.getElementById('tree-element-selector').addEventListener('change', () => {
            this.updateSpellTreeVisualization();
        });
        
        // Button events
        document.getElementById('reset-selection').addEventListener('click', () => {
            this.resetSelection();
        });
        
        document.getElementById('confirm-selection').addEventListener('click', () => {
            this.confirmSelection();
        });
    }
    
    show(callback) {
        // Store callback for when selection is confirmed
        this.selectionCallback = callback;
        
        // Show the interface
        const container = document.getElementById('spell-selection-interface');
        container.classList.remove('hidden');
        
        // Initialize with current unlocked spells
        this.updateAvailableSpells();
        this.updateSpellTreeVisualization();
        
        // Add entrance animation
        container.classList.add('interface-enter');
        setTimeout(() => {
            container.classList.remove('interface-enter');
        }, 500);
    }
    
    hide() {
        const container = document.getElementById('spell-selection-interface');
        
        // Add exit animation
        container.classList.add('interface-exit');
        
        // Hide after animation completes
        setTimeout(() => {
            container.classList.add('hidden');
            container.classList.remove('interface-exit');
        }, 500);
    }
    
    updateAvailableSpells() {
        const availableSpellsContainer = document.getElementById('available-spells');
        availableSpellsContainer.innerHTML = '';
        
        // Get all unlocked spells
        let spells = this.spellSystem.getUnlockedSpells();
        
        // Apply filters
        spells = this.filterSpells(spells);
        
        // Update spell count
        document.getElementById('spell-count').textContent = `${spells.length} spells`;
        
        // Create spell cards
        spells.forEach(spell => {
            const isSelected = this.selectedSpells.some(s => s.id === spell.id);
            const spellCard = this.createSpellCard(spell, isSelected);
            availableSpellsContainer.appendChild(spellCard);
        });
    }
    
    updateSelectedSpells() {
        const selectedSpellsContainer = document.getElementById('selected-spells');
        selectedSpellsContainer.innerHTML = '';
        
        // Update selected count
        document.getElementById('selected-count').textContent = `${this.selectedSpells.length}/${this.maxSelectedSpells}`;
        
        // Create spell cards for selected spells
        this.selectedSpells.forEach(spell => {
            const spellCard = this.createSpellCard(spell, true);
            selectedSpellsContainer.appendChild(spellCard);
        });
    }
    
    createSpellCard(spell, isSelected) {
        const spellCard = document.createElement('div');
        spellCard.className = `spell-card ${spell.element} tier-${spell.tier}`;
        if (isSelected) {
            spellCard.classList.add('selected');
        }
        
        // Determine spell type for icon
        let spellTypeIcon = 'utility-icon';
        if (spell.damage > 0) {
            spellTypeIcon = 'damage-icon';
        } else if (spell.healing > 0) {
            spellTypeIcon = 'healing-icon';
        } else if (spell.manaRestore > 0) {
            spellTypeIcon = 'mana-icon';
        }
        
        spellCard.innerHTML = `
            <div class="spell-card-header">
                <div class="spell-icon ${spell.element}-icon"></div>
                <div class="spell-name">${spell.name}</div>
                <div class="spell-tier">Tier ${spell.tier}</div>
            </div>
            <div class="spell-card-body">
                <div class="spell-type ${spellTypeIcon}"></div>
                <div class="spell-stats">
                    <div class="spell-stat mana-cost">Mana: ${spell.manaCost}</div>
                    ${spell.damage > 0 ? `<div class="spell-stat damage">Damage: ${spell.damage}</div>` : ''}
                    ${spell.healing > 0 ? `<div class="spell-stat healing">Healing: ${spell.healing}</div>` : ''}
                    ${spell.manaRestore > 0 ? `<div class="spell-stat mana-restore">Mana Restore: ${spell.manaRestore}</div>` : ''}
                </div>
                <div class="spell-description">${spell.description}</div>
            </div>
            <div class="spell-card-footer">
                <button class="spell-action-button ${isSelected ? 'remove-spell' : 'add-spell'}">
                    ${isSelected ? 'Remove' : 'Add'}
                </button>
            </div>
        `;
        
        // Add click event
        const actionButton = spellCard.querySelector('.spell-action-button');
        actionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isSelected) {
                this.removeSpell(spell);
            } else {
                this.addSpell(spell);
            }
        });
        
        return spellCard;
    }
    
    filterSpells(spells) {
        return spells.filter(spell => {
            // Filter by element
            if (this.filterOptions.element !== 'all' && spell.element !== this.filterOptions.element) {
                return false;
            }
            
            // Filter by tier
            if (this.filterOptions.tier !== 'all' && spell.tier !== parseInt(this.filterOptions.tier)) {
                return false;
            }
            
            // Filter by type
            if (this.filterOptions.type !== 'all') {
                if (this.filterOptions.type === 'damage' && spell.damage <= 0) {
                    return false;
                }
                if (this.filterOptions.type === 'healing' && spell.healing <= 0) {
                    return false;
                }
                if (this.filterOptions.type === 'mana' && spell.manaRestore <= 0) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    addSpell(spell) {
        // Check if already at max
        if (this.selectedSpells.length >= this.maxSelectedSpells) {
            // Show notification
            this.uiManager.showNotification(`You can only select up to ${this.maxSelectedSpells} spells`, 'warning');
            return;
        }
        
        // Check if already selected
        if (this.selectedSpells.some(s => s.id === spell.id)) {
            return;
        }
        
        // Add to selected spells
        this.selectedSpells.push(spell);
        
        // Update UI
        this.updateAvailableSpells();
        this.updateSelectedSpells();
    }
    
    removeSpell(spell) {
        // Remove from selected spells
        this.selectedSpells = this.selectedSpells.filter(s => s.id !== spell.id);
        
        // Update UI
        this.updateAvailableSpells();
        this.updateSelectedSpells();
    }
    
    resetSelection() {
        // Clear selected spells
        this.selectedSpells = [];
        
        // Update UI
        this.updateAvailableSpells();
        this.updateSelectedSpells();
    }
    
    confirmSelection() {
        // Check if any spells are selected
        if (this.selectedSpells.length === 0) {
            this.uiManager.showNotification('Please select at least one spell', 'warning');
            return;
        }
        
        // Hide interface
        this.hide();
        
        // Call callback with selected spells
        if (this.selectionCallback) {
            this.selectionCallback(this.selectedSpells);
        }
    }
    
    updateSpellTreeVisualization() {
        const treeContainer = document.getElementById('spell-tree-visualization');
        treeContainer.innerHTML = '';
        
        // Get selected element
        const element = document.getElementById('tree-element-selector').value;
        
        // Get spell tree for this element
        const tree = this.spellSystem.getSpellTree(element);
        if (!tree) return;
        
        // Create tree visualization
        const treeVisualization = document.createElement('div');
        treeVisualization.className = 'spell-tree-visualization';
        
        // Create nodes for each tier
        const tier1Node = this.createSpellTreeNode(tree.tier1, 1);
        const tier2Node = this.createSpellTreeNode(tree.tier2, 2);
        const tier3Node = this.createSpellTreeNode(tree.tier3, 3);
        
        // Create connections
        const connection1to2 = document.createElement('div');
        connection1to2.className = 'tree-connection';
        
        const connection2to3 = document.createElement('div');
        connection2to3.className = 'tree-connection';
        
        // Add to tree
        treeVisualization.appendChild(tier1Node);
        treeVisualization.appendChild(connection1to2);
        treeVisualization.appendChild(tier2Node);
        treeVisualization.appendChild(connection2to3);
        treeVisualization.appendChild(tier3Node);
        
        // Add to container
        treeContainer.appendChild(treeVisualization);
    }
    
    createSpellTreeNode(spell, tier) {
        const node = document.createElement('div');
        node.className = 'tree-node';
        
        // Check if spell is unlocked
        const isUnlocked = this.spellSystem.playerUnlockedSpells.includes(spell.id);
        
        // Add appropriate classes
        node.classList.add(`tier-${tier}`);
        node.classList.add(spell.element);
        if (isUnlocked) {
            node.classList.add('unlocked');
        } else {
            node.classList.add('locked');
        }
        
        // Create node content
        node.innerHTML = `
            <div class="node-icon ${spell.element}-icon"></div>
            <div class="node-name">${spell.name}</div>
            <div class="node-tier">Tier ${tier}</div>
            ${!isUnlocked ? '<div class="node-locked-overlay"><i class="lock-icon"></i></div>' : ''}
        `;
        
        // Add tooltip with spell details
        if (isUnlocked) {
            node.title = `${spell.name} (${spell.type}): ${spell.description}`;
            
            // Add click event to show spell details
            node.addEventListener('click', () => {
                this.showSpellDetails(spell);
            });
        } else {
            node.title = `Locked: Unlock ${this.getUnlockRequirementText(spell)} to access this spell`;
        }
        
        return node;
    }
    
    getUnlockRequirementText(spell) {
        if (!spell.unlockRequirement) {
            return 'previous tier spells';
        }
        
        const requiredSpell = this.spellSystem.getSpellById(spell.unlockRequirement);
        return requiredSpell ? requiredSpell.name : 'previous tier spells';
    }
    
    showSpellDetails(spell) {
        // Create modal for spell details
        const modal = document.createElement('div');
        modal.className = 'spell-detail-modal';
        
        // Determine spell type for icon
        let spellTypeIcon = 'utility-icon';
        if (spell.damage > 0) {
            spellTypeIcon = 'damage-icon';
        } else if (spell.healing > 0) {
            spellTypeIcon = 'healing-icon';
        } else if (spell.manaRestore > 0) {
            spellTypeIcon = 'mana-icon';
        }
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${spell.name}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="spell-detail-card ${spell.element}">
                        <div class="spell-icon ${spell.element}-icon"></div>
                        <div class="spell-info">
                            <div class="spell-type">Type: ${spell.type}</div>
                            <div class="spell-tier">Tier: ${spell.tier}</div>
                            <div class="spell-element">Element: ${spell.element}</div>
                        </div>
                        <div class="spell-stats">
                            <div class="spell-stat mana-cost">Mana Cost: ${spell.manaCost}</div>
                            <div class="spell-stat cast-time">Cast Time: ${spell.castTime}s</div>
                            <div class="spell-stat cooldown">Cooldown: ${spell.cooldown}s</div>
                            ${spell.damage > 0 ? `<div class="spell-stat damage">Damage: ${spell.damage}</div>` : ''}
                            ${spell.healing > 0 ? `<div class="spell-stat healing">Healing: ${spell.healing}</div>` : ''}
                            ${spell.manaRestore > 0 ? `<div class="spell-stat mana-restore">Mana Restore: ${spell.manaRestore}</div>` : ''}
                        </div>
                        <div class="spell-description">${spell.description}</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="add-to-selection ${this.selectedSpells.some(s => s.id === spell.id) ? 'selected' : ''}">
                        ${this.selectedSpells.some(s => s.id === spell.id) ? 'Remove from Selection' : 'Add to Selection'}
                    </button>
                </div>
            </div>
        `;
        
        // Add to document
        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.add-to-selection').addEventListener('click', () => {
            if (this.selectedSpells.some(s => s.id === spell.id)) {
                this.removeSpell(spell);
                document.body.removeChild(modal);
            } else {
                this.addSpell(spell);
                document.body.removeChild(modal);
            }
        });
        
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }
}
