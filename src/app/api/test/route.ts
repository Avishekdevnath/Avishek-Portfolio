import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Education } from '@/models/Experience';
import { sendSuccess, sendError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Check if education data exists
    const educationCount = await Education.countDocuments();
    const educationEntries = await Education.find().lean();
    
    // If no education data, create sample data
    if (educationCount === 0) {
      const sampleEducation = {
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
          'Peer Tutor for Programming Courses'
        ],
        honors: [
          'Summa Cum Laude',
          'Dean\'s List (6 semesters)',
          'Outstanding Student in Computer Science'
        ],
        coursework: [
          'Data Structures and Algorithms',
          'Web Development',
          'Database Systems',
          'Software Engineering'
        ],
        thesis: {
          title: 'Modern Web Development: A Comparative Study of Frontend Frameworks',
          description: 'An in-depth analysis comparing React, Vue.js, and Angular frameworks.',
          supervisor: 'Dr. Sarah Johnson'
        },
        order: 1,
        featured: true,
        status: 'published'
      };
      
      await Education.create(sampleEducation);
      
      return sendSuccess({
        message: 'Sample education data created',
        educationCount: 1,
        educationEntries: [sampleEducation]
      });
    }
    
    return sendSuccess({
      message: 'Education data found',
      educationCount,
      educationEntries
    });
    
  } catch (error) {
    return sendError(error instanceof Error ? error.message : 'Test failed', 500);
  }
} 