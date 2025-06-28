import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Education } from '@/models/Experience';
import { sendSuccess, sendError } from '@/lib/api-utils';

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
  }
];

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting education seeding...');
    await connectToDatabase();
    console.log('📡 Database connected');
    
    // Check existing education count
    const existingCount = await Education.countDocuments();
    console.log('📊 Existing education entries:', existingCount);
    
    // Clear existing education data
    if (existingCount > 0) {
      await Education.deleteMany({});
      console.log('🗑️ Cleared existing education data');
    }
    
    // Insert sample data
    const result = await Education.insertMany(sampleEducationData);
    console.log(`✅ Successfully seeded ${result.length} education entries`);
    
    // Verify insertion
    const newCount = await Education.countDocuments();
    console.log('📈 New education count:', newCount);
    
    return sendSuccess({
      message: `Successfully seeded ${result.length} education entries`,
      count: result.length,
      entries: result.map(edu => ({
        id: edu._id,
        title: edu.title,
        institution: edu.institution
      }))
    });
    
  } catch (error) {
    console.error('💥 Error seeding education data:', error);
    return sendError(error instanceof Error ? error.message : 'Seeding failed', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const count = await Education.countDocuments();
    const entries = await Education.find().select('title institution degree').lean();
    
    return sendSuccess({
      message: `Found ${count} education entries`,
      count,
      entries
    });
    
  } catch (error) {
    console.error('Error checking education data:', error);
    return sendError(error instanceof Error ? error.message : 'Check failed', 500);
  }
} 