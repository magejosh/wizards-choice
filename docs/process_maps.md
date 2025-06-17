# Process Maps

## Wizard's Study UI Layout

```mermaid
flowchart TD
    WS[Wizard's Study] --> Header[Header Section]
    WS --> MainArea[Main Content Area]
    WS --> Sidebar[Sidebar]
    
    Header --> Title[Title]
    Header --> PlayerInfo[Player Info]
    
    PlayerInfo --> PlayerName[Player Name]
    PlayerInfo --> PlayerLevel[Player Level]
    PlayerInfo --> ProfileButton[Profile Button]
    
    MainArea --> StudyScene[Study Scene]
    MainArea --> Actions[Action Buttons]
    
    StudyScene --> Background[Background]
    Background --> CustomizeBtn[Customize Background Button]
    
    Actions --> PrimaryActions[Primary Actions]
    Actions --> ActionGroups[Action Groups]
    Actions --> SecondaryActions[Secondary Actions]
    
    PrimaryActions --> StartDuel[Start Next Duel]
    
    ActionGroups --> DeckBuilder[Deck Builder]
    ActionGroups --> Equipment[Equipment]
    ActionGroups --> Spellbook[Spellbook]
    
    SecondaryActions --> PotionCrafting[Potion Crafting]
    SecondaryActions --> Marketplace[Marketplace]
    
    Sidebar --> Stats[Wizard Stats]
    Sidebar --> Equipped[Equipped Items]
    Sidebar --> Spells[Equipped Spells]
    Sidebar --> Ingredients[Ingredients]
    
    Stats --> Health[Health]
    Stats --> Mana[Mana]
    Stats --> ManaRegen[Mana Regen]
    Stats --> Experience[Experience]
    Stats --> LevelUpPoints[Level-up Points]
    Stats --> Gold[Gold]
    
    Equipped --> EquipmentSlots[Equipment Slots]
    Spells --> SpellList[Spell List]
    Ingredients --> IngredientCount[Ingredient Count]
```

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

## Battle Consumable Flow

```mermaid
flowchart TD
    EnterBattle[Player enters battle] --> EquipCheck[Check equipped potions and scrolls]
    EquipCheck --> BattleUI[Battle Arena UI]
    BattleUI --> BeltBtn[Belt Button]
    BattleUI --> RobesBtn[Robes Button]
    BeltBtn --> |Player clicks| ShowPotions[Show Potions Modal]
    RobesBtn --> |Player clicks| ShowScrolls[Show Scrolls Modal]
    ShowPotions --> UsePotion[Player uses potion]
    ShowScrolls --> UseScroll[Player uses scroll]
    UsePotion --> ApplyPotionEffect[Apply potion effect]
    UseScroll --> ApplyScrollEffect[Apply scroll effect]
    ApplyPotionEffect --> RemovePotion[Remove potion from equipped]
    ApplyScrollEffect --> RemoveScroll[Remove scroll from equipped]
    RemovePotion --> UpdateUI[Update UI]
    RemoveScroll --> UpdateUI
    UpdateUI --> BattleContinues[Continue battle]
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
    
    StatBoosts --> EquipmentStats[Sum to equipmentMaxHealth/equipmentMaxMana]
    SpellEnhancement --> EquipmentStats
    DefenseBoosts --> EquipmentStats
    SpecialAbilities --> EquipmentStats
    PassiveEffects --> EquipmentStats
    PotionStorage --> UsePotions[Use in Combat]
    
    EquipmentStats --> TotalStats[totalMaxHealth/totalMaxMana]
    TotalStats --> CombatCalculation[Combat Calculations]
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
    LearnSpell --> RemoveScroll1[Remove Scroll from Inventory\n(Use updateWizardInSaveSlot for save slot consistency)]
    LearnSpell --> AddSpell[Add Spell to Wizard's Collection]
    
    BattleUse --> CastWithoutMana[Cast Without Mana Cost]
    CastWithoutMana --> ApplySpellEffect[Apply Spell Effect]
    CastWithoutMana --> RemoveScroll2[Remove Scroll from Inventory\n(Use updateWizardInSaveSlot for save slot consistency)]
    
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

## Market UI Component State Management

```mermaid
flowchart TD
    Lifecycle[Component Lifecycle] --> Mount[Component Mount]
    Lifecycle --> Unmount[Component Unmount]
    
    Mount --> InitState[Initialize Local State]
    InitState --> FetchData[Fetch Market Data]
    FetchData --> UpdateLocalState[Update Local State]
    
    UpdateLocalState --> RenderUI[Render UI]
    
    RenderUI --> UserInteraction[User Interaction]
    UserInteraction --> SelectMarket[Select Market]
    UserInteraction --> ChangeTab[Change Tab]
    UserInteraction --> ToggleMode[Toggle Buy/Sell Mode]
    UserInteraction --> SelectItem[Select Item]
    UserInteraction --> ChangeQuantity[Change Quantity]
    UserInteraction --> ExecuteTransaction[Execute Transaction]
    UserInteraction --> RefreshMarket[Refresh Market]
    UserInteraction --> CloseMarket[Close Market]
    
    SelectMarket --> UpdateSelectedMarket[Update Selected Market State]
    UpdateSelectedMarket --> CallVisitMarket[Call visitMarket]
    CallVisitMarket --> RenderUI
    
    ChangeTab --> UpdateTabState[Update Tab State]
    UpdateTabState --> RenderUI
    
    ToggleMode --> UpdateModeState[Update Mode State]
    UpdateModeState --> RenderUI
    
    SelectItem --> UpdateSelectedItem[Update Selected Item State]
    UpdateSelectedItem --> ResetQuantity[Reset Quantity to 1]
    ResetQuantity --> RenderUI
    
    ChangeQuantity --> ValidateQuantity[Validate Quantity]
    ValidateQuantity --> UpdateQuantityState[Update Quantity State]
    UpdateQuantityState --> RenderUI
    
    ExecuteTransaction --> |Buy| CallBuyItem[Call buyItem]
    ExecuteTransaction --> |Sell| CallSellItem[Call sellItem]
    
    CallBuyItem --> UpdateMessage[Update Message State]
    CallBuyItem --> UpdateGold[Update Gold State]
    CallBuyItem --> Success{Transaction Success?}
    
    CallSellItem --> UpdateMessage
    CallSellItem --> UpdateGold
    CallSellItem --> Success
    
    Success --> |Yes| ScheduleReset[Schedule State Reset]
    Success --> |No| RenderUI
    
    ScheduleReset --> ResetSelection[Reset Selected Item]
    ScheduleReset --> ClearMessage[Clear Message]
    ScheduleReset --> RefreshData[Refresh Market Data]
    RefreshData --> UpdateLocalState
    
    RefreshMarket --> CallRefreshMarket[Call refreshMarket]
    CallRefreshMarket --> ScheduleRefreshData[Schedule Data Refresh]
    ScheduleRefreshData --> RefreshData
    %% NOTE: Market refresh interval is now 72 minutes, not 72 hours or days.
    
    CloseMarket --> CheckForAttack[Check for Market Attack]
    CheckForAttack --> AttackFound{Attack Found?}
    
    AttackFound --> |Yes| ShowAttackModal[Show Attack Modal]
    AttackFound --> |No| CallOnClose[Call onClose Prop]
    
    ShowAttackModal --> PlayerDecision[Player Decision]
    PlayerDecision --> |Fight| GoToBattle[Go to Battle]
    PlayerDecision --> |Flee| AttemptFlee[Attempt to Flee]
    
    AttemptFlee --> FleeResult{Flee Success?}
    FleeResult --> |Yes| EscapeSuccess[Show Success Message]
    FleeResult --> |No| GoldLoss[Apply Gold Loss]
    
    EscapeSuccess --> DelayedClose[Delayed Close]
    GoldLoss --> DelayedClose
    DelayedClose --> CallOnClose
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

## Spell Progression Tech Tree System

```mermaid
graph TD
    W[Wizard Center] --> T1[Tier 1 Spells]
    W --> T2[Tier 2 Spells]
    W --> T3[Tier 3 Spells]
    
    T1 --> T2
    T2 --> T3
    
    subgraph "Node Properties"
        N[Spell Node]
        N --> ID[ID]
        N --> S[Spell Data]
        N --> P[Position]
        N --> C[Connections]
        N --> U[Unlocked State]
        N --> CO[Cost]
        N --> PR[Prerequisites]
    end
    
    subgraph "Tree Properties"
        T[Spell Tree]
        T --> NODES[Nodes Array]
        T --> CENTER[Center Node]
        T --> MAXP[Max Points]
        T --> ALLOC[Allocated Points]
    end
```

The spell progression tech tree system follows a Path of Exile-style design where:
1. The wizard is positioned at the center of the tree
2. Spells are organized in tiers radiating outward
3. Nodes are connected based on proximity and prerequisites
4. Each node has a cost based on its tier
5. Nodes can only be unlocked if:
   - The player has enough points
   - All prerequisites are met
   - The node is not already unlocked
6. The system includes:
   - Visual feedback for locked/unlocked states
   - Tooltips showing prerequisites and costs
   - Unlocking animations
   - Save/load functionality
   - Reset capability

## Inventory System Workflow

```mermaid
flowchart TD
    Inventory[Inventory System] --> Tabs[Tab Navigation]
    
    Tabs --> EquipmentTab[Equipment Tab]
    Tabs --> ItemsTab[Items Tab]
    Tabs --> ScrollsTab[Spell Scrolls Tab]
    Tabs --> IngredientsTab[Ingredients Tab]
    Tabs --> PotionsTab[Potions Tab]
    
    EquipmentTab --> EquipmentSlots[Equipment Slots]
    EquipmentSlots --> EquipItem[Equip Item]
    EquipmentSlots --> UnequipItem[Unequip Item]
    
    ItemsTab --> ItemGrid[Item Grid]
    ItemGrid --> ViewItem[View Item Details]
    ItemGrid --> UseItem[Use Item]
    
    ScrollsTab --> ScrollGrid[Scroll Grid]
    ScrollGrid --> ViewScroll[View Scroll Details]
    ScrollGrid --> UseScroll[Use Scroll]
    ScrollGrid --> LearnSpell[Learn Spell]
    
    IngredientsTab --> IngredientGrid[Ingredient Grid]
    IngredientGrid --> ViewIngredient[View Ingredient Details]
    IngredientGrid --> UseIngredient[Use Ingredient]
    
    PotionsTab --> PotionGrid[Potion Grid]
    PotionGrid --> ViewPotion[View Potion Details]
    PotionGrid --> UsePotion[Use Potion]
    
    EquipItem --> UpdateStats[Update Wizard Stats]
    UnequipItem --> UpdateStats
    
    UseItem --> ApplyEffects[Apply Item Effects]
    UseScroll --> ApplyEffects
    UseIngredient --> ApplyEffects
    UsePotion --> ApplyEffects
    
    LearnSpell --> UpdateSpellbook[Update Spellbook]
    
    ApplyEffects --> UpdateUI[Update UI]
    UpdateStats --> UpdateUI
    UpdateSpellbook --> UpdateUI
```

## Player Profile System

```mermaid
graph TD
    A[Game Events] --> B[AchievementService]
    B --> C{Check Achievements}
    C -->|Unlocked| D[Update GameState]
    C -->|Not Unlocked| E[Continue]
    D --> F[Trigger Notification]
    F --> G[Save Profile Data]
    
    H[Battle Completion] --> I[Record Battle]
    I --> J[Add to Battle History]
    J --> K[Update Stats]
    K --> L[Check for Achievements]
    L --> M[Save Profile Data]
    
    N[User Opens Profile] --> O[Load Profile Data]
    O --> P[Display Profile Screen]
    P --> Q{Select Tab}
    Q --> R[Summary Tab]
    Q --> S[Achievements Tab]
    Q --> T[Battle History Tab]
    Q --> U[Titles Tab]
    
    V[User Equips Title] --> W[Update GameState]
    W --> X[Apply Title Bonuses]
    X --> Y[Save Profile Data]
    
    Z[User Exports Data] --> AA[Generate Export File]
    AA --> AB[Download File]
```

### Profile System Data Flow

```mermaid
flowchart LR
    subgraph GameEvents
        GE1[Battle] --> GE2[Stat Updates]
        GE2 --> GE3[Level Up]
        GE3 --> GE4[Item Collection]
    end
    
    subgraph StateManagement
        SM1[GameStateContext] --- SM2[GameState]
        SM2 --- SM3[Game Reducers]
    end
    
    subgraph DataPersistence
        DP1[LocalStorage] --- DP2[Save File]
        DP2 --- DP3[Export JSON]
    end
    
    subgraph UIComponents
        UI1[PlayerProfileScreen] --- UI2[StatsSummary]
        UI1 --- UI3[AchievementList]
        UI1 --- UI4[BattleHistoryLog]
        UI1 --- UI5[TitleRankDisplay]
    end
    
    GameEvents --> StateManagement
    StateManagement --> UIComponents
    StateManagement --> DataPersistence
```

### Achievement Unlock Process

```mermaid
sequenceDiagram
    participant GE as Game Event
    participant AS as AchievementService
    participant GS as GameState
    participant NM as NotificationManager
    participant UI as User Interface
    
    GE->>AS: Trigger event (battle win, item collection, etc.)
    AS->>AS: Check achievement conditions
    AS->>GS: Unlock achievement if conditions met
    GS->>GS: Update achievement state
    GS->>GS: Update player stats
    GS->>NM: Notify about new achievement
    NM->>UI: Display achievement notification
    GS->>GS: Save updated state
```

## Player Profile UI Navigation

```mermaid
flowchart TD
    MainFlow[UI Navigation] --> WizardsStudy[Wizard's Study]
    WizardsStudy --> ProfileButton[Profile Button]
    ProfileButton --> Start[Player Profile Screen]
    
    Start --> Tabs[Navigation Tabs]
    Tabs --> SummaryTab[Summary Tab]
    Tabs --> AchievementsTab[Achievements Tab]
    Tabs --> BattleHistoryTab[Battle History Tab]
    Tabs --> TitlesTab[Titles/Ranks Tab]
    
    SummaryTab --> PlayerInfo[Player Information]
    PlayerInfo --> BasicStats[Basic Stats Display]
    BasicStats --> StatCategories[Combat/Collection/Progress Stats]
    BasicStats --> ExportStats[Export Stats Button]
    
    AchievementsTab --> AchievementsList[Achievements List]
    AchievementsList --> AchievementFilter[Filter Options]
    AchievementsList --> AchievementSearch[Search Box]
    AchievementsList --> AchievementCategories[Categories]
    AchievementsList --> AchievementExport[Export Achievements]
    
    BattleHistoryTab --> BattleLogList[Battle Log Entries]
    BattleLogList --> BattleDetails[Battle Details]
    BattleLogList --> BattleStats[Battle Statistics]
    BattleLogList --> BattleFilters[Filters]
    BattleLogList --> BattleExport[Export Battle History]
    
    TitlesTab --> TitlesList[Available Titles]
    TitlesList --> TitleDetails[Title Details]
    TitlesList --> TitleEquip[Equip Title Button]
    TitleDetails --> TitlePrerequisites[Unlock Requirements]
    TitleDetails --> TitleBonuses[Title Bonuses]
```

## Market UI Workflow

## Item and Scroll Generation Workflow

```mermaid
flowchart TD
    subgraph Equipment Generation
        E1[Player Level] --> E2[Equipment Generator]
        E2 --> E3[Procedural Equipment (Robes, Belts, etc.)]
    end

    subgraph Spell Scroll Generation
        S1[Loaded Spells]
        S2[Random Selection & Tier/Rarity Logic]
        S1 --> S2
        S2 --> S3[Spell Scroll Generator]
        S3 --> S4[Spell Scrolls (from Spells)]
    end

    E3 -.->|Not used for scrolls| S4
    S4 -.->|Not equipment| E3
```

## Equipment Slot Handling Process

```mermaid
graph TD
    A[Start Equip Item] --> B{Is slot 'finger'?}
    B -- No --> C[Check if slot occupied]
    C -- Yes --> D[Move old item to inventory]
    C -- No --> E[Proceed]
    D --> E
    E[Equip new item in slot]
    E --> F[Remove new item from inventory]
    F --> G[End]

    B -- Yes --> H{finger1 empty?}
    H -- Yes --> I[Equip in finger1]
    I --> F
    H -- No --> J{finger2 empty?}
    J -- Yes --> K[Equip in finger2]
    K --> F
    J -- No --> L[Move finger1 to inventory]
    L --> M[Equip new item in finger1]
    M --> F

    subgraph Unequip Item
      U1[Start Unequip] --> U2{Is slot 'finger'?}
      U2 -- No --> U3[Remove item from slot]
      U3 --> U4[Add item to inventory]
      U4 --> U5[End]
      U2 -- Yes --> U6{IsSecondFinger?}
      U6 -- Yes --> U7[Remove finger2]
      U7 --> U4
      U6 -- No --> U8[Remove finger1]
      U8 --> U4
    end
```

## Save Slot Deletion (Per-Slot)

```mermaid
flowchart TD
    A[User sees Save Slots Modal] --> B{Clicks ❌ on a save slot}
    B -->|No| A
    B -->|Yes| C[Show confirmation dialog]
    C -->|Cancel| A
    C -->|Confirm| D[Call deleteSaveSlot for that slot]
    D --> E[Slot is deleted, UI refreshes]
    E --> A
```

## Stat Calculation and Progression

```mermaid
flowchart TD
    Start[Wizard Created or Loaded]
    Start --> BaseStats[baseMaxHealth/baseMaxMana]
    Start --> ProgressionStats[progressionMaxHealth/progressionMaxMana]
    Start --> EquipmentStats[equipmentMaxHealth/equipmentMaxMana]
    
    ProgressionStats <-- LevelUpPoints[Level-Up Points Spent]
    EquipmentStats <-- EquipChange[Equipment Equipped/Unequipped]
    
    BaseStats --> TotalStats[totalMaxHealth/totalMaxMana]
    ProgressionStats --> TotalStats
    EquipmentStats --> TotalStats
    
    TotalStats --> UI[Display in UI/Combat]
```

- **baseMaxHealth/baseMaxMana**: Only changed by rare effects or admin tools
- **progressionMaxHealth/progressionMaxMana**: Increased by level-up points and permanent upgrades
- **equipmentMaxHealth/equipmentMaxMana**: Sum of all currently equipped item bonuses
- **totalMaxHealth/totalMaxMana**: Used for display and combat; sum of all above

### Attribute Upgrade Flow

```mermaid
flowchart TD
    Gain[Gain Level-Up Points] --> Open[Open Attribute Upgrade Screen]
    Open --> Choose[Choose Attribute]
    Choose --> Confirm[Spend Points]
    Confirm --> Update[Update Attribute Value]
    Update --> Recalc[Recalculate Stats]
    Recalc --> Save[Persist to Save Slot]
```

The attribute screen allows players to convert level-up points into permanent
stat increases that update the wizard's saved data.

### Equipment System (updated)

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
    
    StatBoosts --> EquipmentStats[Sum to equipmentMaxHealth/equipmentMaxMana]
    SpellEnhancement --> EquipmentStats
    DefenseBoosts --> EquipmentStats
    SpecialAbilities --> EquipmentStats
    PassiveEffects --> EquipmentStats
    PotionStorage --> UsePotions[Use in Combat]
    
    EquipmentStats --> TotalStats[totalMaxHealth/totalMaxMana]
    TotalStats --> CombatCalculation[Combat Calculations]
    UsePotions --> CombatCalculation
```

## Spell Data Workflow

```mermaid
flowchart TD
    Start[Spell Creation/Editing] --> Validate[Validate XML Schema]
    Validate --> |Valid| SaveXML[Save to /public/data/spell_data.xml]
    Validate --> |Invalid| Error[Show Validation Error]
    SaveXML --> ClearCache[Clear Spell Cache]
    ClearCache --> AssignList[Assign List Membership]
    AssignList --> |archetype| ArchetypeList[Add to Archetype Spell List]
    AssignList --> |creature| CreatureList[Add to Creature Spell List]
    AssignList --> |any| DefaultList[Add to Default Spell List]
    ArchetypeList --> LoadGame[Load Spells at Runtime]
    CreatureList --> LoadGame
    DefaultList --> LoadGame
    LoadGame --> GameUse[Spells Usable in Game]
    Error --> Edit[Edit Spell Data]
    Edit --> Validate
```

- After saving spell data, the spell cache must be cleared using `clearSpellCache` to ensure the game reloads the latest XML.

- The spell data XML file is always located at `/public/data/spell_data.xml` in the project.
- At runtime, it is loaded from `/data/spell_data.xml` (the URL path).
- There is only one file; the `/public` directory is served as the web root.

## Model Loader Workflow

```mermaid
flowchart TD
    Start[Request Model] --> CheckCache{Cached?}
    CheckCache -- Yes --> Clone[Clone Cached]
    CheckCache -- No --> Load[Load From Path]
    Load --> Normalize[Apply Descriptor]
    Normalize --> Cache[Store in Cache]
    Cache --> Clone
    Clone --> Return[Return Scene]
```
