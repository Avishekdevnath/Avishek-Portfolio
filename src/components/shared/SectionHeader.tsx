interface SectionHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
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
        className={`font-mono text-[0.68rem] tracking-[0.25em] uppercase mb-3 flex items-center gap-3 ${
          center ? "justify-center" : ""
        } ${light ? "text-sand" : "text-accent-orange"}`}
      >
        <span
          className={`block w-8 h-px opacity-50 ${
            light ? "bg-sand" : "bg-accent-orange"
          } ${center ? "" : "hidden"}`}
        />
        {eyebrow}
        {center && (
          <span
            className={`block w-8 h-px opacity-50 ${
              light ? "bg-sand" : "bg-accent-orange"
            }`}
          />
        )}
        {!center && (
          <span
            className={`block w-6 h-px ${
              light ? "bg-sand" : "bg-accent-orange"
            }`}
          />
        )}
      </p>
      <h2
        className={`font-heading font-light leading-[1.05] mb-4 ${
          light ? "text-cream" : "text-ink"
        }`}
        style={{ fontSize: "clamp(2.2rem,5vw,3.6rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`text-[0.9rem] max-w-[54ch] leading-[1.75] font-light ${
            center ? "mx-auto" : ""
          } ${light ? "text-sand opacity-80" : "text-text-muted"}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
