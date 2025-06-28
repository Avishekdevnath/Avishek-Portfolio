import { connectToDatabase } from '../lib/mongodb';
import { WorkExperience, Education } from '../models/Experience';

const workExperienceData = [
  {
    title: "Senior Full-Stack Developer",
    position: "Senior Full-Stack Developer",
    company: "Tech Solutions Inc.",
    organization: "Tech Solutions Inc.",
    location: "San Francisco, CA",
    startDate: new Date('2022-01-01'),
    endDate: new Date('2024-12-31'),
    isCurrent: false,
    description: "Led the development of multiple web applications using React, Node.js, and MongoDB. Collaborated with a team of 5 developers to deliver a high-traffic e-commerce platform that handles 10,000+ daily users. Implemented modern UI/UX designs and improved performance metrics by 40%.",
    employmentType: "full-time",
    technologies: ["React", "Node.js", "MongoDB", "TypeScript", "Next.js", "AWS"],
    achievements: [
      "Improved application performance by 40%",
      "Led a team of 5 developers",
      "Delivered e-commerce platform handling 10,000+ daily users",
      "Implemented CI/CD pipeline reducing deployment time by 60%"
    ],
    responsibilities: [
      "Lead frontend development team",
      "Architect scalable web applications",
      "Code review and mentoring",
      "Client communication and requirement analysis"
    ],
    website: "https://techsolutions.com",
    companySize: "50-100 employees",
    featured: true,
    order: 1,
    status: "published"
  },
  {
    title: "Web Developer",
    position: "Web Developer",
    company: "Digital Agency",
    organization: "Digital Agency",
    location: "New York, NY",
    startDate: new Date('2020-06-01'),
    endDate: new Date('2021-12-31'),
    isCurrent: false,
    description: "Developed and maintained client websites using modern web technologies. Collaborated with designers to implement pixel-perfect designs and ensured cross-browser compatibility. Worked on projects for various industries including healthcare, finance, and e-commerce.",
    employmentType: "contract",
    technologies: ["JavaScript", "Vue.js", "SCSS", "WordPress", "PHP", "MySQL"],
    achievements: [
      "Delivered 15+ client projects on time",
      "Achieved 99% cross-browser compatibility",
      "Improved website loading speed by 35%"
    ],
    responsibilities: [
      "Frontend development",
      "WordPress theme development",
      "Client communication",
      "Quality assurance testing"
    ],
    website: "https://digitalagency.com",
    companySize: "20-50 employees",
    featured: true,
    order: 2,
    status: "published"
  },
  {
    title: "Junior Developer",
    position: "Junior Developer",
    company: "StartupHub",
    organization: "StartupHub",
    location: "Remote",
    startDate: new Date('2019-01-01'),
    endDate: new Date('2020-05-31'),
    isCurrent: false,
    description: "Started my professional journey as a junior developer, working on various small to medium-scale projects. Gained hands-on experience with modern web development technologies and agile methodologies.",
    employmentType: "full-time",
    technologies: ["HTML5", "CSS3", "JavaScript", "Bootstrap", "jQuery", "Git"],
    achievements: [
      "Completed 8+ projects successfully",
      "Learned 5+ new technologies",
      "Received 'Best New Developer' award"
    ],
    responsibilities: [
      "Bug fixing and maintenance",
      "Frontend component development",
      "Learning and skill development",
      "Documentation writing"
    ],
    featured: false,
    order: 3,
    status: "published"
  }
];

const educationData = [
  {
    title: "Master of Science in Computer Science",
    degree: "Master of Science in Computer Science",
    institution: "University of Dhaka",
    organization: "University of Dhaka",
    location: "Dhaka, Bangladesh",
    startDate: new Date('2023-01-01'),
    isCurrent: true,
    description: "Currently pursuing Master's degree in Computer Science with specialization in Artificial Intelligence and Machine Learning. Conducting research on natural language processing and computer vision applications.",
    fieldOfStudy: "Computer Science",
    activities: ["Research Assistant", "AI/ML Study Group", "Programming Club"],
    honors: ["Research Scholarship", "Dean's List"],
    coursework: ["Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision", "Advanced Algorithms"],
    featured: true,
    order: 1,
    status: "published"
  },
  {
    title: "Bachelor of Science in Computer Science",
    degree: "Bachelor of Science in Computer Science",
    institution: "BGC Trust University",
    organization: "BGC Trust University",
    location: "Chittagong, Bangladesh",
    startDate: new Date('2020-01-01'),
    endDate: new Date('2024-05-31'),
    isCurrent: false,
    description: "Completed Bachelor's degree in Computer Science with focus on software engineering and web development. Graduated with excellent academic performance and received multiple awards for programming excellence.",
    fieldOfStudy: "Computer Science",
    gpa: 3.85,
    maxGpa: 4.0,
    activities: ["Programming Club President", "University Tech Fest Organizer", "Coding Competition Participant"],
    honors: ["Summa Cum Laude", "Best Final Year Project", "Outstanding Programming Award"],
    coursework: ["Data Structures", "Algorithms", "Database Systems", "Software Engineering", "Web Development", "Mobile App Development"],
    featured: true,
    order: 2,
    status: "published"
  },
  {
    title: "Higher Secondary Certificate",
    degree: "Higher Secondary Certificate",
    institution: "Chittagong College",
    organization: "Chittagong College",
    location: "Chittagong, Bangladesh",
    startDate: new Date('2018-06-01'),
    endDate: new Date('2020-05-31'),
    isCurrent: false,
    description: "Completed higher secondary education with concentration in Science group. Achieved excellent results in Mathematics, Physics, and Chemistry.",
    fieldOfStudy: "Science",
    gpa: 5.0,
    maxGpa: 5.0,
    activities: ["Science Club", "Mathematics Olympiad", "Debate Team"],
    honors: ["Golden GPA-5", "Merit Scholarship", "Best Student Award"],
    coursework: ["Higher Mathematics", "Physics", "Chemistry", "Biology", "English"],
    featured: false,
    order: 3,
    status: "published"
  }
];

async function seedExperience() {
  try {
    console.log('🔌 Connecting to database...');
    await connectToDatabase();
    
    console.log('🗑️ Clearing existing experience data...');
    await WorkExperience.deleteMany({});
    await Education.deleteMany({});
    
    console.log('💼 Seeding work experience data...');
    const workResults = await WorkExperience.insertMany(workExperienceData);
    console.log(`✅ Created ${workResults.length} work experience entries`);
    
    console.log('🎓 Seeding education data...');
    const educationResults = await Education.insertMany(educationData);
    console.log(`✅ Created ${educationResults.length} education entries`);
    
    console.log('🎉 Experience data seeded successfully!');
    
    // Display summary
    console.log('\n📊 Summary:');
    console.log(`Work Experience: ${workResults.length} entries`);
    console.log(`Education: ${educationResults.length} entries`);
    console.log(`Featured Work: ${workResults.filter(w => w.featured).length}`);
    console.log(`Featured Education: ${educationResults.filter(e => e.featured).length}`);
    
  } catch (error) {
    console.error('❌ Error seeding experience data:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedExperience()
    .then(() => {
      console.log('✨ Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export default seedExperience; 