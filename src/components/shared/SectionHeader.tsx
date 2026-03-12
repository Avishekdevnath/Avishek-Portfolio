interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
  center?: boolean;
  className?: string;
}

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  light = false,
  center = false,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      <p
        className={`font-ui text-caption tracking-wider uppercase mb-3 flex items-center gap-3 ${
          center ? "justify-center" : ""
        } ${light ? "text-sand" : "text-accent-orange"}`}
      >
        <span
          className={`block w-6 h-px ${
            light ? "bg-sand" : "bg-accent-orange"
          } ${center ? "hidden" : ""}`}
        />
        {eyebrow}
      </p>
      <h2
        className={`font-ui text-h4 md:text-h3 weight-bold leading-tight mb-4 ${
          light ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`font-ui text-body-sm max-w-[60ch] leading-relaxed ${
            center ? "mx-auto" : ""
          } ${light ? "text-sand opacity-80" : "text-text-muted"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
