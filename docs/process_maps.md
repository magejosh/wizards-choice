# Process Maps

## Battle System Workflow

```mermaid
flowchart TD
    Start[Player enters battle] --> Init[Initialize Combat State]
    Init --> PlayerTurn[Player Turn]
    
    PlayerTurn --> SelectAction[Player selects action]
    SelectAction --> |Cast Spell| SelectSpell[Select Spell]
    SelectAction --> |Mystic Punch| SelectSpellForPunch[Select Spell to Discard]
    SelectAction --> |Skip Turn| SkipTurn[Skip Turn]
    
    SelectSpell --> CastSpell[Cast Spell]
    SelectSpellForPunch --> ExecutePunch[Execute Mystic Punch]
    SkipTurn --> EndPlayerTurn[End Player Turn]
    
    CastSpell --> ApplyEffects[Apply Spell Effects]
    ExecutePunch --> ApplyDamage[Apply Direct Damage]
    
    ApplyEffects --> CheckEnemyHealth[Check Enemy Health]
    ApplyDamage --> CheckEnemyHealth
    EndPlayerTurn --> EnemyTurn
    
    CheckEnemyHealth --> |Enemy Defeated| Victory[Victory]
    CheckEnemyHealth --> |Enemy Alive| EnemyTurn[Enemy Turn]
    
    EnemyTurn --> AISelectSpell[AI Selects Spell]
    AISelectSpell --> |Cast Spell| AICastSpell[AI Casts Spell]
    AISelectSpell --> |Mystic Punch| AIExecutePunch[AI Executes Mystic Punch]
    
    AICastSpell --> AIApplyEffects[Apply AI Spell Effects]
    AIExecutePunch --> AIApplyDamage[Apply AI Direct Damage]
    
    AIApplyEffects --> CheckPlayerHealth[Check Player Health]
    AIApplyDamage --> CheckPlayerHealth
    
    CheckPlayerHealth --> |Player Defeated| Defeat[Defeat]
    CheckPlayerHealth --> |Player Alive| NewRound[New Round]
    
    NewRound --> EffectTick[Process Active Effects]
    EffectTick --> RegenerateMana[Regenerate Mana]
    RegenerateMana --> PlayerTurn
    
    Victory --> CalculateRewards[Calculate XP & Rewards]
    Defeat --> GameOver[Return to Wizard's Study]
    
    CalculateRewards --> DisplayRewards[Display Rewards]
    DisplayRewards --> EndBattle[Return to Wizard's Study]
```

## Equipment System

```mermaid
flowchart TD
    Start[Equipment System] --> Slots[Equipment Slots]
    Slots --> Head[Head: Wizard Hats]
    Slots --> Hand[Hand: Wands/Staffs/Spellbooks]
    Slots --> Body[Body: Robes]
    Slots --> Neck[Neck: Amulets]
    Slots --> Fingers[Fingers: Rings x2]
    Slots --> Belt[Belt: Potions]
    
    Head --> StatBoosts[Stat Boosts]
    Hand --> SpellEnhancement[Spell Enhancement]
    Body --> DefenseBoosts[Defense Boosts]
    Neck --> SpecialAbilities[Special Abilities]
    Fingers --> PassiveEffects[Passive Effects]
    Belt --> PotionStorage[Potion Storage]
    
    StatBoosts --> ApplyStats[Apply to Wizard Stats]
    SpellEnhancement --> ApplySpell[Apply to Spell Effects]
    DefenseBoosts --> ApplyDefense[Apply to Defense]
    SpecialAbilities --> ApplyAbilities[Apply Special Abilities]
    PassiveEffects --> ApplyPassives[Apply Passive Effects]
    PotionStorage --> UsePotions[Use in Combat]
    
    ApplyStats --> CombatCalculation[Combat Calculations]
    ApplySpell --> CombatCalculation
    ApplyDefense --> CombatCalculation
    ApplyAbilities --> CombatCalculation
    ApplyPassives --> CombatCalculation
    UsePotions --> CombatCalculation
```

## Potion System

```mermaid
flowchart TD
    Start[Potion System] --> Types[Potion Types]
    Types --> Health[Health Potions]
    Types --> Mana[Mana Potions]
    Types --> Buff[Buff Potions]
    Types --> Damage[Damage Potions]
    Types --> Defense[Defense Potions]
    Types --> Special[Special Potions]
    
    Health --> Tiers[Potion Tiers]
    Mana --> Tiers
    Buff --> Tiers
    Damage --> Tiers
    Defense --> Tiers
    Special --> Tiers
    
    Tiers --> Minor[Minor: Tier 1]
    Tiers --> Regular[Regular: Tier 2]
    Tiers --> Greater[Greater: Tier 3]
    Tiers --> Superior[Superior: Tier 4]
    Tiers --> Supreme[Supreme: Tier 5]
    
    Minor --> Effects[Potion Effects]
    Regular --> Effects
    Greater --> Effects
    Superior --> Effects
    Supreme --> Effects
    
    Effects --> Storage[Belt Storage]
    Storage --> Usage[Combat Usage]
    Usage --> CombatEffects[Apply Combat Effects]
```

## Potion Crafting System

```mermaid
flowchart TD
    Start[Potion Crafting System] --> GatherIngredients[Gather Ingredients]
    GatherIngredients --> CombatLoot[Combat Loot Drops]
    GatherIngredients --> Quest[Quest Rewards]
    
    CombatLoot --> IngredientInventory[Ingredient Inventory]
    Quest --> IngredientInventory
    
    IngredientInventory --> DiscoverRecipes[Discover Recipes]
    IngredientInventory --> CraftPotions[Craft Known Potions]
    
    DiscoverRecipes --> Experimentation[Experimentation]
    DiscoverRecipes --> FindRecipes[Find Recipe Scrolls]
    
    Experimentation --> ConsumeIngredients[Consume Ingredients]
    ConsumeIngredients --> SuccessfulExperiment{Success?}
    
    SuccessfulExperiment --> |Yes| NewRecipe[Discover New Recipe]
    SuccessfulExperiment --> |No| LostIngredients[Lost Ingredients]
    
    NewRecipe --> RecipeCollection[Recipe Collection]
    FindRecipes --> RecipeCollection
    
    RecipeCollection --> CraftPotions
    CraftPotions --> SelectRecipe[Select Recipe]
    SelectRecipe --> CheckIngredients{Have Required Ingredients?}
    
    CheckIngredients --> |Yes| BrewPotion[Brew Potion]
    CheckIngredients --> |No| GatherMoreIngredients[Gather More Ingredients]
    
    BrewPotion --> RemoveIngredients[Remove Used Ingredients]
    RemoveIngredients --> AddPotion[Add Potion to Inventory]
    
    AddPotion --> UsePotion[Use in Combat]
    UsePotion --> PotionEffect[Apply Potion Effect]
```

## 3D Battle Screen Components

```mermaid
flowchart TD
    BattlePage[Battle Page] --> BattleArena[BattleArena Component]
    BattleArena --> UIPanels[UI Panels & Controls]
    BattleArena --> BattleCanvas[3D Battle Canvas]
    
    BattleCanvas --> BattleScene[BattleScene Component]
    
    BattleScene --> Environment[Environment & Lighting]
    BattleScene --> PlayerWizard[Player Wizard]
    BattleScene --> EnemyWizard[Enemy Wizard]
    BattleScene --> VisualEffects[Visual Effects]
    BattleScene --> UI3D[3D UI Elements]
    
    PlayerWizard --> WizardModel1[WizardModel Component]
    EnemyWizard --> WizardModel2[WizardModel Component]
    
    WizardModel1 --> Body1[3D Body Mesh]
    WizardModel1 --> Head1[3D Head Mesh]
    WizardModel1 --> Staff1[3D Staff/Wand]
    WizardModel1 --> HealthBar1[3D Health Bar]
    WizardModel1 --> Animations1[Hover Animations]
    
    WizardModel2 --> Body2[3D Body Mesh]
    WizardModel2 --> Head2[3D Head Mesh]
    WizardModel2 --> Staff2[3D Staff/Wand]
    WizardModel2 --> HealthBar2[3D Health Bar]
    WizardModel2 --> Animations2[Hover Animations]
    
    VisualEffects --> SpellEffects[Spell Effects]
    VisualEffects --> DamageNumbers[Floating Damage Numbers]
    
    SpellEffects --> SpellEffect3D[SpellEffect3D Component]
    
    SpellEffect3D --> AttackEffects[Attack Spell Effects]
    SpellEffect3D --> DefenseEffects[Defense Spell Effects]
    SpellEffect3D --> HealingEffects[Healing Spell Effects]
    SpellEffect3D --> UtilityEffects[Utility Spell Effects]
    
    AttackEffects --> ElementColors[Element-Based Colors]
    DefenseEffects --> ElementColors
    HealingEffects --> ElementColors
    UtilityEffects --> ElementColors
    
    UIPanels --> PlayerInfo[Player Info Panel]
    UIPanels --> EnemyInfo[Enemy Info Panel]
    UIPanels --> BattleLog[Battle Log]
    UIPanels --> SpellHand[Spell Hand Cards]
    UIPanels --> ActionButtons[Action Buttons]
    
    ActionButtons --> CastSpell[Cast Spell]
    ActionButtons --> MysticPunch[Mystic Punch]
    ActionButtons --> SkipTurn[Skip Turn]
    
    MysticPunch --> SpellSelection[Spell Selection Modal]
```

## Spell Scroll System

```mermaid
flowchart TD
    Start[Spell Scroll System] --> Acquisition[Scroll Acquisition]
    Acquisition --> Loot[Combat Loot Drops]
    Acquisition --> Purchase[Market Purchases]
    
    Loot --> ScrollInventory[Scroll Inventory]
    Purchase --> ScrollInventory
    
    ScrollInventory --> Usage[Scroll Usage]
    
    Usage --> WizardStudy[Use in Wizard's Study]
    Usage --> BattleUse[Use in Battle]
    
    WizardStudy --> LearnSpell[Learn Spell Permanently]
    LearnSpell --> RemoveScroll1[Remove Scroll from Inventory]
    LearnSpell --> AddSpell[Add Spell to Wizard's Collection]
    
    BattleUse --> CastWithoutMana[Cast Without Mana Cost]
    CastWithoutMana --> ApplySpellEffect[Apply Spell Effect]
    CastWithoutMana --> RemoveScroll2[Remove Scroll from Inventory]
    
    ScrollInventory --> ScrollUI[Scroll UI Interfaces]
    ScrollUI --> StudyInterface[Wizard's Study Interface]
    ScrollUI --> BattleInterface[Battle Interface]
    
    StudyInterface --> ScrollPreview[Scroll/Spell Preview]
    StudyInterface --> LearnButton[Learn Spell Button]
    
    BattleInterface --> ScrollsButton[Use Scroll Button]
    BattleInterface --> ScrollSelection[Scroll Selection Grid]
    ScrollSelection --> SpellEffect[Immediate Spell Effect]
```

## Market System

```mermaid
flowchart TD
    Start[Market System] --> Locations[Market Locations]
    Locations --> NoviceBazaar[Novice Bazaar]
    Locations --> HerbalistHaven[Herbalist's Haven]
    Locations --> ArcaneEmporium[Arcane Emporium]
    Locations --> AlchemistSquare[Alchemist's Square]
    Locations --> SpellcasterExchange[Spellcaster's Exchange]
    Locations --> EtherealBazaar[Ethereal Bazaar]
    Locations --> EnchantersWorkshop[Enchanter's Workshop]
    Locations --> CelestialApothecary[Celestial Apothecary]
    Locations --> ArchmageRepository[Archmage's Repository]
    Locations --> ElementalNexus[Elemental Nexus]
    Locations --> TemporalAuctionHouse[Temporal Auction House]
    Locations --> PhilosophersEmporium[Philosopher's Emporium]
    Locations --> CosmicLibrary[Cosmic Library]
    
    NoviceBazaar --> Level1[Level 1 Unlock]
    HerbalistHaven --> Level5[Level 5 Unlock]
    ArcaneEmporium --> Level10[Level 10 Unlock]
    AlchemistSquare --> Level15[Level 15 Unlock]
    SpellcasterExchange --> Level20[Level 20 Unlock]
    EtherealBazaar --> Level25[Level 25 Unlock]
    EnchantersWorkshop --> Level50[Level 50 Unlock]
    CelestialApothecary --> Level75[Level 75 Unlock]
    ArchmageRepository --> Level100[Level 100 Unlock]
    ElementalNexus --> Level150[Level 150 Unlock]
    TemporalAuctionHouse --> Level250[Level 250 Unlock]
    PhilosophersEmporium --> Level500[Level 500 Unlock]
    CosmicLibrary --> Level1000[Level 1000 Unlock]
    
    Locations --> MarketInventory[Market Inventory]
    MarketInventory --> Ingredients[Ingredients Stock]
    MarketInventory --> Potions[Potions Stock]
    MarketInventory --> Equipment[Equipment Stock]
    MarketInventory --> Scrolls[Spell Scrolls]
    
    MarketInventory --> PriceFluctuation[Price Fluctuations]
    PriceFluctuation --> Supply[Supply Levels]
    PriceFluctuation --> Demand[Demand Levels]
    
    Supply --> SupplyAffectsPrice[Supply Affects Price]
    Demand --> DemandAffectsPrice[Demand Affects Price]
    
    MarketInventory --> RefreshCycle[Inventory Refresh Cycle]
    RefreshCycle --> NormalRefresh[Regular Time Interval]
    RefreshCycle --> ManualRefresh[Player-Triggered Refresh]
    
    Start --> PlayerInteractions[Player Interactions]
    PlayerInteractions --> Buying[Buy Items]
    PlayerInteractions --> Selling[Sell Items]
    
    Buying --> TransactionBuy[Transaction Recorded]
    Selling --> TransactionSell[Transaction Recorded]
    
    TransactionBuy --> GoldDeducted[Gold Deducted]
    TransactionBuy --> InventoryUpdated[Item Added to Inventory]
    TransactionBuy --> MarketStockReduced[Market Stock Reduced]
    
    TransactionSell --> GoldAdded[Gold Added]
    TransactionSell --> InventoryRemoved[Item Removed from Inventory]
    
    Start --> Reputation[Market Reputation]
    Reputation --> ReputationEffects[Affects Prices]
    ReputationEffects --> BetterDeals[Higher Reputation = Better Deals]

    Start --> MarketAttacks[Market Attack System]
    MarketAttacks --> AttackChance[Attack Chance When Leaving]
    AttackChance --> MarketLevel[Based on Market Level]
    AttackChance --> GameDifficulty[Modified by Game Difficulty]
    
    MarketAttacks --> PlayerChoice[Player Choice]
    PlayerChoice --> Fight[Fight Attacker]
    PlayerChoice --> Flee[Attempt to Flee]
    
    Fight --> CombatResult{Combat Result}
    CombatResult --> |Victory| RareRewards[Earn Rare Ingredients]
    CombatResult --> |Defeat| GoldPenalty[Lose Gold]
    
    Flee --> FleeResult{Flee Success?}
    FleeResult --> |Yes (50%)| SafeReturn[Return to Study]
    FleeResult --> |No (50%)| GoldLoss[Lose Gold]
```

## Market Attack System

```mermaid
flowchart TD
    Start[Leave Market] --> AttackCheck{Check for Attack}
    AttackCheck --> |No Attack| SafeExit[Return to Wizard's Study]
    AttackCheck --> |Attack Occurs| Ambush[Market Ambush]
    
    Ambush --> PlayerChoice[Player Decision]
    PlayerChoice --> |Fight| InitiateDuel[Initiate Duel]
    PlayerChoice --> |Flee| FleeAttempt{Flee Attempt}
    
    FleeAttempt --> |Success 50%| EscapeSuccess[Escape Successfully]
    FleeAttempt --> |Failure 50%| GoldLoss[Lose Gold]
    
    InitiateDuel --> BattleSystem[Battle System]
    BattleSystem --> BattleResult{Battle Outcome}
    
    BattleResult --> |Victory| RewardIngredients[Earn Rare Ingredients]
    BattleResult --> |Defeat| LoseGold[Lose Gold]
    
    RewardIngredients --> ReturnToStudy[Return to Wizard's Study]
    LoseGold --> ReturnToStudy
    GoldLoss --> ReturnToStudy
    EscapeSuccess --> ReturnToStudy
    
    SafeExit --> End[End Market Visit]
    ReturnToStudy --> End
```