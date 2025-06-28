import { connectToDatabase } from '../lib/mongodb';
import { Education } from '../models/Experience';

const sampleEducationData = [
  {
    type: 'education',
    title: 'Bachelor of Computer Science',
    degree: 'Bachelor of Computer Science',
    institution: 'University of Technology',
    organization: 'University of Technology',
    location: 'Boston, MA',
    startDate: new Date('2019-08-01'),
    endDate: new Date('2023-05-15'),
    isCurrent: false,
    description: 'Comprehensive four-year program covering computer science fundamentals, software engineering, algorithms, data structures, and web development. Graduated with honors and actively participated in various computer science clubs and hackathons.',
    fieldOfStudy: 'Computer Science',
    gpa: 3.8,
    maxGpa: 4.0,
    activities: [
      'Computer Science Club President',
      'Hackathon Team Leader',
      'Peer Tutor for Programming Courses',
      'Student Council Technology Committee'
    ],
    honors: [
      'Summa Cum Laude',
      'Dean\'s List (6 semesters)',
      'Outstanding Student in Computer Science',
      'Academic Excellence Award'
    ],
    coursework: [
      'Data Structures and Algorithms',
      'Web Development',
      'Database Systems',
      'Software Engineering',
      'Computer Networks',
      'Machine Learning',
      'Mobile App Development',
      'Cybersecurity Fundamentals'
    ],
    thesis: {
      title: 'Modern Web Development: A Comparative Study of Frontend Frameworks',
      description: 'An in-depth analysis comparing React, Vue.js, and Angular frameworks, examining performance, developer experience, and scalability for modern web applications.',
      supervisor: 'Dr. Sarah Johnson'
    },
    order: 1,
    featured: true,
    status: 'published'
  },
  {
    type: 'education',
    title: 'Master of Science in Software Engineering',
    degree: 'Master of Science in Software Engineering',
    institution: 'Tech Institute',
    organization: 'Tech Institute',
    location: 'San Francisco, CA',
    startDate: new Date('2023-08-01'),
    endDate: null,
    isCurrent: true,
    description: 'Advanced graduate program focusing on enterprise software development, system architecture, and emerging technologies. Specializing in full-stack development and cloud computing solutions.',
    fieldOfStudy: 'Software Engineering',
    gpa: 3.9,
    maxGpa: 4.0,
    activities: [
      'Graduate Research Assistant',
      'Software Engineering Society Member',
      'Industry Mentorship Program Participant'
    ],
    honors: [
      'Graduate Excellence Award',
      'Research Publication Award'
    ],
    coursework: [
      'Advanced Software Architecture',
      'Cloud Computing and DevOps',
      'Enterprise Application Development',
      'Software Testing and Quality Assurance',
      'Agile Project Management',
      'Microservices Design Patterns'
    ],
    thesis: {
      title: 'Scalable Microservices Architecture for Enterprise Applications',
      description: 'Research on designing and implementing scalable microservices architectures using modern cloud technologies and containerization.',
      supervisor: 'Prof. Michael Chen'
    },
    order: 2,
    featured: true,
    status: 'published'
  },
  {
    type: 'education',
    title: 'Full Stack Web Development Bootcamp',
    degree: 'Certificate in Full Stack Web Development',
    institution: 'CodeCamp Institute',
    organization: 'CodeCamp Institute',
    location: 'Online',
    startDate: new Date('2019-01-01'),
    endDate: new Date('2019-06-01'),
    isCurrent: false,
    description: 'Intensive 6-month bootcamp focusing on modern web development technologies including MERN stack, responsive design, and deployment strategies.',
    fieldOfStudy: 'Web Development',
    activities: [
      'Lead Team Developer for Final Project',
      'Peer Code Review Coordinator'
    ],
    honors: [
      'Top Graduate',
      'Best Final Project Award'
    ],
    coursework: [
      'HTML5 and CSS3',
      'JavaScript ES6+',
      'React.js',
      'Node.js and Express',
      'MongoDB and Database Design',
      'RESTful API Development',
      'Git and Version Control',
      'Deployment and DevOps'
    ],
    order: 3,
    featured: false,
    status: 'published'
  }
];

async function seedEducation() {
  try {
    await connectToDatabase();
    
    // Clear existing education data
    await Education.deleteMany({});
    console.log('Cleared existing education data');
    
    // Insert sample data
    const result = await Education.insertMany(sampleEducationData);
    console.log(`Successfully seeded ${result.length} education entries`);
    
    // Display inserted data
    result.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.degree} - ${edu.institution}`);
    });
    
  } catch (error) {
    console.error('Error seeding education data:', error);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  seedEducation();
}

export default seedEducation; 