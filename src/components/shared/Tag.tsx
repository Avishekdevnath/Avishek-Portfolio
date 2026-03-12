interface TagProps {
  children: string;
  variant?: "default" | "orange" | "teal" | "blue";
}

export default function Tag({ children, variant = "default" }: TagProps) {
  const variants = {
    default: "bg-cream-deeper text-warm-brown",
    orange: "bg-accent-orange/[.12] text-accent-orange",
    teal: "bg-accent-teal/[.12] text-accent-teal",
    blue: "bg-accent-blue/[.12] text-accent-blue",
  };

  return (
    <span
      className={`font-mono text-[0.6rem] tracking-wide px-2.5 py-1 rounded-full uppercase whitespace-nowrap ${variants[variant]}`}
    >
      {children}
    </span>
  );
}
