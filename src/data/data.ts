// ── Skill types ──
export type SkillLevel = "Expert" | "Advanced" | "Proficient" | "Learning";
export type BarColor = "orange" | "teal" | "blue" | "warm";
export type IconBg = "orange" | "teal" | "blue" | "amber" | "warm";

export interface SkillItem {
  name: string;
  emoji: string;
  level: SkillLevel;
  percentage: number;
  barColor: BarColor;
  wide?: boolean;
}

export interface PillItem {
  name: string;
  variant?: "default" | "featured" | "teal" | "blue";
}

export interface PillGroup {
  title: string;
  pills: PillItem[];
}

export interface SkillCategory {
  label: string;
  icon: string;
  iconBg: IconBg;
  skills?: SkillItem[];
  pillGroups?: PillGroup[];
}

export interface LanguageItem {
  name: string;
  flag: string;
  levelLabel: string;
  description: string;
  badgeVariant: "native" | "professional" | "conversational";
  dots: number;
}

export interface DsaStat {
  value: string;
  label: string;
}

export interface DsaTopic {
  name: string;
  count: string;
  percentage: number;
  barColor: BarColor;
}

// ── Programming Skills ──
export const programmingCategories: SkillCategory[] = [
  {
    label: "Core Languages",
    icon: "🖥️",
    iconBg: "orange",
    skills: [
      { name: "TypeScript", emoji: "🟦", level: "Expert", percentage: 95, barColor: "orange", wide: true },
      { name: "JavaScript", emoji: "🟨", level: "Expert", percentage: 90, barColor: "orange" },
      { name: "Python", emoji: "🐍", level: "Advanced", percentage: 85, barColor: "teal" },
      { name: "C++", emoji: "⚡", level: "Advanced", percentage: 80, barColor: "teal" },
      { name: "C", emoji: "☕", level: "Proficient", percentage: 72, barColor: "blue" },
    ],
  },
  {
    label: "Front End",
    icon: "🎨",
    iconBg: "blue",
    skills: [
      { name: "React.js", emoji: "⚛️", level: "Advanced", percentage: 80, barColor: "blue" },
      { name: "Next.js", emoji: "▲", level: "Proficient", percentage: 75, barColor: "blue" },
      { name: "HTML / CSS", emoji: "🎭", level: "Advanced", percentage: 85, barColor: "orange" },
      { name: "Tailwind CSS", emoji: "💨", level: "Advanced", percentage: 82, barColor: "teal" },
      { name: "Redux", emoji: "🔄", level: "Proficient", percentage: 70, barColor: "blue" },
    ],
  },
  {
    label: "Back End",
    icon: "⚙️",
    iconBg: "teal",
    skills: [
      { name: "NestJS", emoji: "🐱", level: "Expert", percentage: 95, barColor: "orange", wide: true },
      { name: "Node.js", emoji: "🟢", level: "Expert", percentage: 90, barColor: "teal" },
      { name: "Express.js", emoji: "🌐", level: "Advanced", percentage: 85, barColor: "teal" },
      { name: "PostgreSQL", emoji: "🐘", level: "Expert", percentage: 90, barColor: "blue" },
      { name: "MongoDB", emoji: "🍃", level: "Advanced", percentage: 82, barColor: "teal" },
    ],
  },
  {
    label: "Frameworks & Libraries",
    icon: "📦",
    iconBg: "amber",
    pillGroups: [
      {
        title: "ORM / Data Layer",
        pills: [
          { name: "TypeORM", variant: "featured" },
          { name: "Prisma", variant: "featured" },
          { name: "Mongoose" },
          { name: "Sequelize" },
          { name: "Knex.js" },
          { name: "node-postgres" },
        ],
      },
      {
        title: "AI / ML",
        pills: [
          { name: "PyTorch", variant: "teal" },
          { name: "TensorFlow", variant: "teal" },
          { name: "NumPy", variant: "teal" },
          { name: "Pandas", variant: "teal" },
          { name: "scikit-learn", variant: "teal" },
          { name: "MTCNN", variant: "teal" },
          { name: "OpenCV", variant: "teal" },
        ],
      },
    ],
  },
  {
    label: "Tools & DevOps",
    icon: "🔧",
    iconBg: "warm",
    skills: [
      { name: "Git / GitHub", emoji: "🔧", level: "Expert", percentage: 95, barColor: "orange" },
      { name: "Docker", emoji: "🐳", level: "Proficient", percentage: 72, barColor: "blue" },
      { name: "VS Code", emoji: "📘", level: "Expert", percentage: 98, barColor: "warm" },
      { name: "Postman", emoji: "🚀", level: "Expert", percentage: 90, barColor: "orange" },
      { name: "Vercel", emoji: "▲", level: "Advanced", percentage: 78, barColor: "teal" },
      { name: "AWS", emoji: "☁️", level: "Learning", percentage: 55, barColor: "blue" },
    ],
  },
];

// ── Software Skills ──
export const softwareCategories: SkillCategory[] = [
  {
    label: "Development Software",
    icon: "🛠️",
    iconBg: "teal",
    skills: [
      { name: "VS Code", emoji: "📘", level: "Expert", percentage: 98, barColor: "orange" },
      { name: "Postman", emoji: "🚀", level: "Expert", percentage: 90, barColor: "orange" },
      { name: "TablePlus", emoji: "🍀", level: "Expert", percentage: 88, barColor: "teal" },
      { name: "Jupyter", emoji: "📓", level: "Advanced", percentage: 82, barColor: "blue" },
      { name: "Git / GitHub", emoji: "🔧", level: "Expert", percentage: 95, barColor: "warm" },
      { name: "Swagger", emoji: "📋", level: "Advanced", percentage: 88, barColor: "teal" },
    ],
    pillGroups: [
      {
        title: "Also use",
        pills: [
          { name: "Notion" },
          { name: "Figma (light)" },
          { name: "GitHub Actions" },
          { name: "Railway", variant: "blue" },
          { name: "Render", variant: "blue" },
          { name: "Cloudflare", variant: "blue" },
          { name: "Nginx" },
          { name: "PM2" },
          { name: "Resend Email" },
        ],
      },
    ],
  },
];

// ── Languages ──
export const languageItems: LanguageItem[] = [
  { name: "Bengali", flag: "🇧🇩", levelLabel: "Native", description: "Mother tongue", badgeVariant: "native", dots: 5 },
  { name: "English", flag: "EN", levelLabel: "Professional", description: "Technical writing & communication", badgeVariant: "professional", dots: 4 },
  { name: "Hindi", flag: "🇮🇳", levelLabel: "Conversational", description: "Day-to-day conversation", badgeVariant: "conversational", dots: 3 },
];

export const languagePills: PillItem[] = [
  { name: "Bengali Technical Writing", variant: "featured" },
  { name: "English Documentation", variant: "featured" },
  { name: "Code Review Feedback" },
  { name: "Curriculum Design" },
  { name: "Live Instruction" },
  { name: "Written Explanations" },
];

// ── DSA ──
export const dsaStats: DsaStat[] = [
  { value: "500+", label: "Problems Solved" },
  { value: "C++", label: "Primary Language" },
  { value: "CF", label: "Codeforces" },
  { value: "▲", label: "Active Practice" },
];

export const dsaTopics: DsaTopic[] = [
  { name: "Arrays & Strings", count: "80+", percentage: 90, barColor: "orange" },
  { name: "Dynamic Programming", count: "70+", percentage: 82, barColor: "orange" },
  { name: "Graph Algorithms", count: "60+", percentage: 75, barColor: "teal" },
  { name: "Trees & BST", count: "50+", percentage: 68, barColor: "teal" },
  { name: "Binary Search", count: "40+", percentage: 60, barColor: "blue" },
  { name: "Sorting & Searching", count: "45+", percentage: 62, barColor: "blue" },
  { name: "Stack & Queue", count: "35+", percentage: 55, barColor: "warm" },
  { name: "Greedy Algorithms", count: "30+", percentage: 50, barColor: "warm" },
  { name: "Number Theory", count: "25+", percentage: 45, barColor: "warm" },
];

// Dynamic data for projects
export const projectsData = [
    {
        title: "Food Mart Website (Full Stack)",
        preview:
            "A large-scale, multi-vendor website for an online food shop. Users can buy food, review items, write blogs, and create campaigns.",
        features: [
            "Users can order food and give reviews.",
            "Users can manage their orders.",
            "Dynamic admin panel with specific accessibilities.",
            "Dynamic dashboards for vendors and users.",
        ],
        technology: [
            "Next.js",
            "Redux Toolkit",
            "Node.js",
            "Express.js",
            "MongoDB",
            "Firebase Authentication",
            "Tailwind CSS",
        ],
        timeline: "February 2022 – present",
        image: "https://res.cloudinary.com/dzulk05zg/image/upload/v1742968861/samples/breakfast.jpg",
        github: "https://github.com/avishekdevnath/food-mart",
        liveDemo: "https://food-mart-demo.com",
    },
    {
        title: "Mobile Point Website (Full Stack)",
        preview:
            "A demo website for an online mobile shop where users can buy their favorite mobile devices.",
        features: [
            "Users can order mobiles and give reviews.",
            "Users can manage their orders.",
            "Dynamic admin panel with specific accessibilities.",
        ],
        technology: [
            "React",
            "Node.js",
            "Express.js",
            "MongoDB",
            "Firebase Authentication",
            "Material UI",
            "Redux",
            "Context API",
        ],
        timeline: "25 December 2021 – 6 January 2022",
        image: "https://res.cloudinary.com/dzulk05zg/image/upload/v1742968861/samples/breakfast.jpg",
        github: "https://github.com/avishekdevnath/mobile-point",
        liveDemo: "https://mobile-point-demo.com",
    },
    {
        title: "Tourist Website (Full Stack)",
        preview:
            "A website to connect travelers and travel agents globally.",
        features: [
            "Users can book tour packages.",
            "Users can manage their orders using CRUD operations.",
            "Dynamic admin panel with specific accessibility.",
        ],
        technology: [
            "React",
            "Node.js",
            "Express.js",
            "MongoDB",
            "Firebase Authentication",
            "React Bootstrap",
        ],
        timeline: "27 January 2022 – 28 January 2022",
        image: "https://res.cloudinary.com/dzulk05zg/image/upload/v1742968861/samples/breakfast.jpg",
        github: "https://github.com/avishekdevnath/tourist-website",
        liveDemo: "https://tourist-website-demo.com",
    },
];