import { skillIcon } from "../../lib/skill-icons";

export default function SkillIcon({ skill }: { skill: string }) {
  const icon = skillIcon(skill);
  if (!icon) return null;
  return (
    <svg className="skill-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}
