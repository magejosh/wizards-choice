import React, { useEffect, useState } from 'react';
import styles from './RuneSequenceMinigame.module.css';
import { RuneGrade } from '@/lib/types/minigame-types';

interface RuneSequenceMinigameProps {
  sequenceLength: number;
  onComplete: (grade: RuneGrade) => void;
  onCancel: () => void;
}

const runes = ['\u16A0', '\u16A2', '\u16A6', '\u16B1'];

const RuneSequenceMinigame: React.FC<RuneSequenceMinigameProps> = ({
  sequenceLength,
  onComplete,
  onCancel
}) => {
  const [sequence, setSequence] = useState<number[]>([]);
  const [showSequence, setShowSequence] = useState(true);
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);

  // Generate sequence on mount
  useEffect(() => {
    const seq = Array.from({ length: sequenceLength }, () =>
      Math.floor(Math.random() * runes.length)
    );
    setSequence(seq);

    // show sequence with interval
    seq.forEach((val, i) => {
      setTimeout(() => setHighlightIndex(val), i * 800);
      setTimeout(() => setHighlightIndex(null), i * 800 + 500);
    });
    // after sequence show
    const totalTime = sequenceLength * 800;
    setTimeout(() => {
      setShowSequence(false);
      setStartTime(Date.now());
    }, totalTime + 200);
  }, [sequenceLength]);

  // handle rune click
  const handleClick = (index: number) => {
    if (showSequence) return;
    setActiveIndex(index);
    setTimeout(() => setActiveIndex(null), 200);
    const nextStep = playerInput.length;
    if (sequence[nextStep] !== index) {
      setErrors(e => e + 1);
    }
    const newInput = [...playerInput, index];
    setPlayerInput(newInput);

    if (newInput.length === sequenceLength) {
      const duration = Date.now() - startTime;
      let grade: RuneGrade = 'average';
      if (errors === 0 && duration < sequenceLength * 1500) {
        grade = 'excellent';
      } else if (errors > 1 || duration > sequenceLength * 3000) {
        grade = 'poor';
      }
      onComplete(grade);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.window}>
        <p className={styles.instructions}>
          {showSequence ? 'Watch the sequence' : 'Repeat the sequence'}
        </p>
        <div className={styles.runes}>
          {runes.map((r, i) => (
            <button
              key={i}
              className={`${styles.runeButton} ${
                highlightIndex === i
                  ? styles.highlight
                  : activeIndex === i
                  ? styles.clicked
                  : ''
              }`}
              onClick={() => handleClick(i)}
            >
              {r}
            </button>
          ))}
        </div>
        <button className={styles.cancel} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default RuneSequenceMinigame;
