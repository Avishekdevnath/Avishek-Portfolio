import connectDB from '../lib/mongodb';
import Skill from '../models/Skill';

const skillsData = [
  // Frontend Development
  {
    name: "React",
    category: "Frontend Development",
    proficiency: 95,
    description: "Expertise in building modern web applications with React",
    featured: true
  },
  {
    name: "Next.js",
    category: "Frontend Development",
    proficiency: 90,
    description: "Advanced knowledge of Next.js framework for React applications",
    featured: true
  },
  {
    name: "TypeScript",
    category: "Frontend Development",
    proficiency: 88,
    description: "Strong TypeScript skills for type-safe development",
    featured: true
  },
  {
    name: "JavaScript",
    category: "Frontend Development",
    proficiency: 95,
    description: "Expert-level JavaScript programming",
    featured: true
  },
  {
    name: "Tailwind CSS",
    category: "Frontend Development",
    proficiency: 92,
    description: "Proficient in utility-first CSS with Tailwind",
    featured: true
  },
  {
    name: "HTML/CSS",
    category: "Frontend Development",
    proficiency: 98,
    description: "Expert in HTML5 and CSS3 for modern web development",
    featured: true
  },

  // Backend Development
  {
    name: "Node.js",
    category: "Backend Development",
    proficiency: 85,
    description: "Strong backend development skills with Node.js",
    featured: true
  },
  {
    name: "Express.js",
    category: "Backend Development",
    proficiency: 80,
    description: "Experience in building RESTful APIs with Express.js",
    featured: true
  },
  {
    name: "Python",
    category: "Backend Development",
    proficiency: 75,
    description: "Backend development with Python",
    featured: false
  },
  {
    name: "MongoDB",
    category: "Backend Development",
    proficiency: 82,
    description: "NoSQL database management with MongoDB",
    featured: true
  },
  {
    name: "PostgreSQL",
    category: "Backend Development",
    proficiency: 78,
    description: "Relational database management with PostgreSQL",
    featured: true
  },
  {
    name: "REST APIs",
    category: "Backend Development",
    proficiency: 88,
    description: "Design and implementation of RESTful APIs",
    featured: true
  },

  // Programming Languages
  {
    name: "JavaScript",
    category: "Programming Languages",
    proficiency: 95,
    description: "Expert-level JavaScript programming across platforms",
    featured: true
  },
  {
    name: "TypeScript",
    category: "Programming Languages",
    proficiency: 88,
    description: "Advanced TypeScript development",
    featured: true
  },
  {
    name: "Python",
    category: "Programming Languages",
    proficiency: 75,
    description: "Python programming for various applications",
    featured: false
  },
  {
    name: "Java",
    category: "Programming Languages",
    proficiency: 70,
    description: "Java programming experience",
    featured: false
  },
  {
    name: "C++",
    category: "Programming Languages",
    proficiency: 65,
    description: "C++ programming knowledge",
    featured: false
  },
  {
    name: "SQL",
    category: "Programming Languages",
    proficiency: 80,
    description: "SQL for database management and queries",
    featured: true
  },

  // Tools & Technologies
  {
    name: "Git & GitHub",
    category: "Tools & Technologies",
    proficiency: 90,
    description: "Version control and collaboration with Git and GitHub",
    featured: true
  },
  {
    name: "VS Code",
    category: "Tools & Technologies",
    proficiency: 95,
    description: "Expert in VS Code development environment",
    featured: true
  },
  {
    name: "Docker",
    category: "Tools & Technologies",
    proficiency: 70,
    description: "Container management with Docker",
    featured: false
  },
  {
    name: "AWS",
    category: "Tools & Technologies",
    proficiency: 65,
    description: "Cloud computing with Amazon Web Services",
    featured: false
  },
  {
    name: "Figma",
    category: "Tools & Technologies",
    proficiency: 75,
    description: "UI/UX design with Figma",
    featured: false
  },
  {
    name: "Postman",
    category: "Tools & Technologies",
    proficiency: 85,
    description: "API testing and documentation with Postman",
    featured: true
  }
];

async function seedSkills() {
  try {
    await connectDB();
    
    // Clear existing skills
    await Skill.deleteMany({});
    console.log('Cleared existing skills');

    // Add order to each skill within its category
    const skillsByCategory = skillsData.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, typeof skillsData>);

    // Add order based on proficiency within each category
    const orderedSkills = Object.values(skillsByCategory).flatMap(categorySkills => 
      categorySkills
        .sort((a, b) => b.proficiency - a.proficiency)
        .map((skill, index) => ({
          ...skill,
          order: index
        }))
    );

    // Insert skills
    await Skill.insertMany(orderedSkills);
    console.log('Successfully seeded skills data');

    // Verify
    const count = await Skill.countDocuments();
    console.log(`Total skills in database: ${count}`);

  } catch (error) {
    console.error('Error seeding skills:', error);
  } finally {
    process.exit();
  }
}

seedSkills(); 