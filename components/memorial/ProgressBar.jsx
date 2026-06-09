// components/memorial/ProgressBar.jsx
import styles from './ProgressBar.module.css';

export default function ProgressBar({ progress = 0, blockName = '' }) {
  return (
    <div className={styles.progressWrapper} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100" aria-label={`Progresso: ${Math.round(progress)}%`}>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {blockName && (
        <span className={styles.progressLabel}>
          {blockName}
        </span>
      )}
    </div>
  );
}