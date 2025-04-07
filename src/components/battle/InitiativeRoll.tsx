import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './InitiativeRoll.module.css';

interface InitiativeRollResults {
  playerRoll: number;
  enemyRoll: number;
}

interface InitiativeRollProps {
  onRollComplete: (results: InitiativeRollResults) => void;
  isEnemy?: boolean;
}

export default function InitiativeRoll({ onRollComplete, isEnemy = false }: InitiativeRollProps) {
  const [playerResult, setPlayerResult] = useState<number | null>(null);
  const [enemyResult, setEnemyResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [diceAngle, setDiceAngle] = useState({ x: 0, y: 0, z: 0 });

  // Handle player roll
  const handleRoll = useCallback(() => {
    if (isRolling || playerResult !== null) return;

    setIsRolling(true);

    // Simulate dice roll animation
    const startTime = Date.now();
    const rollDuration = 1500;

    // Animate the dice roll
    const animateDice = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / rollDuration, 1);

      // Update dice angle for animation
      setDiceAngle({
        x: progress * 1080, // Multiple rotations for effect
        y: progress * 720,
        z: progress * 360
      });

      if (progress < 1) {
        requestAnimationFrame(animateDice);
      } else {
        // Roll is complete
        const roll = Math.floor(Math.random() * 20) + 1;
        setPlayerResult(roll);
        setIsRolling(false);
      }
    };

    requestAnimationFrame(animateDice);
  }, [isRolling, playerResult]);

  // Automatically roll for enemy after player rolls
  useEffect(() => {
    if (playerResult !== null && enemyResult === null) {
      // Add slight delay for enemy roll
      setTimeout(() => {
        const enemyRoll = Math.floor(Math.random() * 20) + 1;
        setEnemyResult(enemyRoll);
      }, 800);
    }
  }, [playerResult, enemyResult]);

  // Handle continuing to the battle
  const handleContinue = useCallback(() => {
    if (playerResult !== null && enemyResult !== null && onRollComplete) {
      onRollComplete({
        playerRoll: playerResult,
        enemyRoll: enemyResult
      });
    }
  }, [playerResult, enemyResult, onRollComplete]);

  // Determine message to display
  const getMessage = () => {
    if (playerResult === null) {
      return ""; // Remove redundant text when roll button is visible
    } else if (isRolling) {
      return "Rolling...";
    } else if (enemyResult === null) {
      return "Enemy rolling...";
    } else if (playerResult >= enemyResult) {
      return "You go first!";
    } else {
      return "Enemy goes first!";
    }
  };

  return (
    <div className={`${styles.modal} initiativeRollModal`}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>Initiative Roll</h2>

        <div className={styles.diceArea}>
          {isRolling ? (
            <div className={styles.rollingDice}>
              <div
                className={styles.d20}
                style={{
                  transform: `rotateX(${diceAngle.x}deg) rotateY(${diceAngle.y}deg) rotateZ(${diceAngle.z}deg)`
                }}
              >
                {/* Dice faces */}
                <div className={`${styles.diceFace} ${styles.f1}`}>1</div>
                <div className={`${styles.diceFace} ${styles.f2}`}>2</div>
                <div className={`${styles.diceFace} ${styles.f3}`}>3</div>
                <div className={`${styles.diceFace} ${styles.f4}`}>4</div>
                <div className={`${styles.diceFace} ${styles.f5}`}>5</div>
                <div className={`${styles.diceFace} ${styles.f6}`}>6</div>
                <div className={`${styles.diceFace} ${styles.f7}`}>7</div>
                <div className={`${styles.diceFace} ${styles.f8}`}>8</div>
                <div className={`${styles.diceFace} ${styles.f9}`}>9</div>
                <div className={`${styles.diceFace} ${styles.f10}`}>10</div>
                <div className={`${styles.diceFace} ${styles.f11}`}>11</div>
                <div className={`${styles.diceFace} ${styles.f12}`}>12</div>
                <div className={`${styles.diceFace} ${styles.f13}`}>13</div>
                <div className={`${styles.diceFace} ${styles.f14}`}>14</div>
                <div className={`${styles.diceFace} ${styles.f15}`}>15</div>
                <div className={`${styles.diceFace} ${styles.f16}`}>16</div>
                <div className={`${styles.diceFace} ${styles.f17}`}>17</div>
                <div className={`${styles.diceFace} ${styles.f18}`}>18</div>
                <div className={`${styles.diceFace} ${styles.f19}`}>19</div>
                <div className={`${styles.diceFace} ${styles.f20}`}>20</div>
              </div>
            </div>
          ) : (
            playerResult === null ? (
              <button
                className={styles.rollButton}
                onClick={handleRoll}
              >
                Roll Initiative
              </button>
            ) : (
              <div className={styles.diceResults}>
                <div className={styles.diceResult}>
                  <span className={styles.resultLabel}>Your Roll:</span>
                  <span className={styles.resultValue}>{playerResult}</span>
                </div>
                {enemyResult !== null && (
                  <div className={styles.diceResult}>
                    <span className={styles.resultLabel}>Enemy Roll:</span>
                    <span className={styles.resultValue}>{enemyResult}</span>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        <div className={styles.resultMessage}>
          {getMessage()}
        </div>

        {playerResult !== null && enemyResult !== null && (
          <button
            className={styles.continueButton}
            onClick={handleContinue}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}