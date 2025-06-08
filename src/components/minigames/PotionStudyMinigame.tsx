import React, { useEffect, useState } from 'react';
import styles from './PotionStudyMinigame.module.css';
import { RuneGrade } from '@/lib/types/minigame-types';

interface PotionStudyMinigameProps {
  sequenceLength: number;
  onComplete: (grade: RuneGrade) => void;
  onCancel: () => void;
}

const runes = ['\u16A0', '\u16A2', '\u16A6', '\u16B1', '\u16D2', '\u16C1'];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const PotionStudyMinigame: React.FC<PotionStudyMinigameProps> = ({
  sequenceLength,
  onComplete,
  onCancel,
}) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [showSequence, setShowSequence] = useState(true);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    const indices = shuffle(Array.from({ length: runes.length }, (_, i) => i));
    const seq = indices.slice(0, sequenceLength);
    setSequence(seq);
    setTimeout(() => {
      setShowSequence(false);
      setStartTime(Date.now());
    }, 3000);
  }, [sequenceLength]);

  const handleClick = (index: number) => {
    if (showSequence) return;
    const next = playerInput.length;
    if (sequence[next] !== index) setErrors((e) => e + 1);
    const newInput = [...playerInput, index];
    setPlayerInput(newInput);
    if (newInput.length === sequenceLength) {
      const duration = Date.now() - startTime;
      let grade: RuneGrade = 'average';
      if (errors === 0 && duration < sequenceLength * 1500) grade = 'excellent';
      else if (errors > 1 || duration > sequenceLength * 3000) grade = 'poor';
      onComplete(grade);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.window}>
        <p className={styles.instructions}>
          {showSequence ? 'Memorize the order' : 'Select the runes in order'}
        </p>
        <div className={styles.runes}>
          {runes.slice(0, sequenceLength).map((r, i) => (
            <button
              key={i}
              className={styles.runeButton}
              onClick={() => handleClick(i)}
            >
              {r}
              {showSequence && (
                <span className={styles.order}>{sequence.indexOf(i) + 1}</span>
              )}
            </button>
          ))}
        </div>
        <button className={styles.cancel} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PotionStudyMinigame;
