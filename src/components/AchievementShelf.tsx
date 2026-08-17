import type { Achievement } from "../lib/achievements";

export function AchievementShelf({ achievements, compact = false }: { achievements: Achievement[]; compact?: boolean }) {
  const visible = compact ? achievements.filter((item) => item.earned).slice(-4) : achievements;
  return (
    <div className={compact ? "achievement-shelf compact" : "achievement-shelf"}>
      {visible.length === 0 && compact ? <p>Aún no hay insignias. Completa la primera lección para obtener una.</p> : visible.map((achievement) => (
        <div key={achievement.id} className={achievement.earned ? "achievement earned" : "achievement locked"} title={achievement.description}>
          <span aria-hidden="true">{achievement.earned ? achievement.icon : "🔒"}</span>
          <strong>{achievement.title}</strong>
          {!compact && <small>{achievement.description}</small>}
        </div>
      ))}
    </div>
  );
}
