import { computePasswordScore } from '../../utils/format.ts';
import styles from './PasswordStrengthMeter.module.css';

const LABEL_BY_SCORE: Record<number, { text: string; className: string; barClass: string } | undefined> = {
  1: { text: 'Básica', className: styles.labelBasica, barClass: styles.basica },
  2: { text: 'Media', className: styles.labelMedia, barClass: styles.media },
  3: { text: 'Fuerte', className: styles.labelFuerte, barClass: styles.fuerte },
  4: { text: 'Muy fuerte', className: styles.labelFuerte, barClass: styles.fuerte },
};

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const score = computePasswordScore(password);
  const info = LABEL_BY_SCORE[score];

  return (
    <div className={styles.wrap}>
      <div className={styles.bars}>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={`${styles.bar} ${index < score ? info?.barClass : ''}`} />
        ))}
      </div>
      <div className={styles.footer}>
        <span className={styles.hint}>Usá mayúsculas, números y símbolos</span>
        {info && <span className={`${styles.label} ${info.className}`}>{info.text}</span>}
      </div>
    </div>
  );
}
