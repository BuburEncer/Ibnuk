import { platformKey, platformLabel } from "../../lib/platform";
import { skillIcon } from "../../lib/skill-icons";

// GitHub/Kaggle links show only the logo; unknown hosts fall back to the text label.
export default function PlatformLink({ href }: { href: string }) {
  const label = platformLabel(href);
  const key = platformKey(href);
  const icon = key ? skillIcon(key) : undefined;
  return (
    <a
      className={icon ? "link link-icon" : "link"}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={icon ? label : undefined}
      title={icon ? label : undefined}
    >
      {icon ? (
        // Kaggle's icon is a thin wordmark mid-box; crop to it so it reads at icon size.
        <svg viewBox={key === "kaggle" ? "0 7 24 10" : "0 0 24 24"} aria-hidden="true">
          <path d={icon.path} />
        </svg>
      ) : (
        label
      )}
    </a>
  );
}
