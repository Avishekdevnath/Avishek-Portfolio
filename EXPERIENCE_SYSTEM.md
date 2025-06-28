# Dynamic Experience System

A complete system for managing work experience and education data dynamically across your portfolio website.

## 🚀 Features

### ✨ Core Features
- **Dynamic Data Management**: Add, edit, delete work experience and education entries
- **API-Driven**: RESTful APIs for all CRUD operations
- **Admin Dashboard**: Full management interface in `/dashboard/experience`
- **Flexible Display**: Reusable components for displaying experiences anywhere
- **Featured Content**: Mark experiences as featured for highlighting
- **Status Management**: Draft and published status for each entry
- **Ordering System**: Custom ordering for display control

### 💼 Work Experience Features
- Position, company, and employment type tracking
- Technology stack management
- Key achievements and responsibilities
- Company website links
- Date ranges with "current position" support
- Salary information (optional)

### 🎓 Education Features
- Degree, institution, and field of study tracking
- GPA and academic performance
- Honors and awards management
- Academic activities and coursework
- Thesis information support

## 📁 File Structure

```
src/
├── models/
│   └── Experience.ts              # MongoDB schemas for work & education
├── app/api/experience/
│   ├── route.ts                   # Combined endpoint (work + education)
│   ├── work/
│   │   ├── route.ts              # Work experience CRUD
│   │   └── [id]/route.ts         # Individual work experience
│   └── education/
│       ├── route.ts              # Education CRUD
│       └── [id]/route.ts         # Individual education
├── components/
│   ├── ExperienceCard.tsx        # Reusable experience display card
│   ├── ExperienceSection.tsx     # Complete experience section
│   └── dashboard/
│       └── ExperienceForm.tsx    # Admin form for add/edit
├── app/dashboard/experience/
│   └── page.tsx                  # Admin management interface
└── scripts/
    └── seed-experience.ts        # Sample data seeder
```

## 🛠️ Setup Instructions

### 1. Database Setup
The MongoDB models are already created in `src/models/Experience.ts`. No additional setup required.

### 2. API Endpoints
The following endpoints are available:

#### Combined Endpoint
- `GET /api/experience` - Get all experiences (work + education)

#### Work Experience
- `GET /api/experience/work` - List work experiences
- `POST /api/experience/work` - Create work experience
- `GET /api/experience/work/[id]` - Get specific work experience
- `PUT /api/experience/work/[id]` - Update work experience
- `DELETE /api/experience/work/[id]` - Delete work experience

#### Education
- `GET /api/experience/education` - List education entries
- `POST /api/experience/education` - Create education entry
- `GET /api/experience/education/[id]` - Get specific education entry
- `PUT /api/experience/education/[id]` - Update education entry
- `DELETE /api/experience/education/[id]` - Delete education entry

### 3. Seed Sample Data
```bash
# Run the seed script to add sample data
npx ts-node src/scripts/seed-experience.ts
```

## 📖 Usage Guide

### Admin Management
1. Navigate to `/dashboard/experience`
2. Use "Add Work Experience" or "Add Education" buttons
3. Fill out the comprehensive forms
4. Set featured status and ordering as needed
5. Publish when ready

### Display Components

#### ExperienceSection Component
Use this component anywhere to display experiences:

```tsx
import ExperienceSection from '@/components/ExperienceSection';

// Display both work and education
<ExperienceSection 
  type="both"
  variant="default"
  showFeaturedOnly={false}
  limit={10}
  title="Experience & Education"
  subtitle="Professional and academic background"
/>

// Display only work experience
<ExperienceSection 
  type="work"
  variant="detailed"
  showFeaturedOnly={true}
  limit={5}
  title="Work Experience"
/>

// Display only education
<ExperienceSection 
  type="education"
  variant="compact"
  showFeaturedOnly={false}
/>
```

#### Component Props
- `type`: `'work' | 'education' | 'both'` - What to display
- `variant`: `'default' | 'compact' | 'detailed'` - Display style
- `showFeaturedOnly`: `boolean` - Show only featured items
- `limit`: `number` - Maximum items to display
- `title`: `string` - Section title
- `subtitle`: `string` - Section subtitle
- `className`: `string` - Additional CSS classes

#### Individual ExperienceCard
```tsx
import ExperienceCard from '@/components/ExperienceCard';

<ExperienceCard 
  experience={experienceData}
  variant="detailed"
  showActions={false}
/>
```

## 🎨 Styling & Variants

### Card Variants
- **Default**: Standard card with full information
- **Compact**: Smaller cards, ideal for grids
- **Detailed**: Expanded view with all technologies/achievements

### Visual Features
- **Featured Badge**: Star icon for featured experiences
- **Status Indicators**: Published/Draft status badges
- **Technology Tags**: Colored badges for technologies
- **Date Formatting**: Automatic "Present" for current positions
- **Responsive Design**: Mobile-friendly layouts

## 🔧 Customization

### Adding Custom Fields
1. Update the models in `src/models/Experience.ts`
2. Update the form in `src/components/dashboard/ExperienceForm.tsx`
3. Update the display cards in `src/components/ExperienceCard.tsx`

### Styling Customization
All components use Tailwind CSS classes and can be easily customized by modifying the className props or component styles.

## 📊 API Query Parameters

### Work Experience & Education Endpoints
- `status=published|draft|all` - Filter by status
- `featured=true|false` - Filter featured items
- `limit=number` - Limit results
- `page=number` - Pagination

### Example API Calls
```javascript
// Get all published work experiences
fetch('/api/experience/work?status=published')

// Get featured education entries
fetch('/api/experience/education?featured=true&limit=3')

// Get all experiences (work + education)
fetch('/api/experience?status=published&limit=10')
```

## 🚀 Integration Examples

### Home Page Integration
```tsx
// Show featured experiences on homepage
<ExperienceSection 
  type="both"
  variant="compact"
  showFeaturedOnly={true}
  limit={6}
  title="Experience Highlights"
  className="bg-gray-50"
/>
```

### About Page Integration
```tsx
// Detailed view for about page
<ExperienceSection 
  type="both"
  variant="detailed"
  showFeaturedOnly={false}
  title="Professional Journey"
  subtitle="Complete work and education history"
/>
```

### Hire Me Page Integration
```tsx
// Work experience for hiring managers
<ExperienceSection 
  type="work"
  variant="detailed"
  showFeaturedOnly={false}
  limit={5}
  title="Work Experience"
  subtitle="Professional career highlights"
/>
```

## 🔍 Troubleshooting

### Common Issues
1. **Data not showing**: Check API endpoints are working and database is connected
2. **Form errors**: Ensure all required fields are filled
3. **Styling issues**: Verify Tailwind CSS classes are properly applied

### Debug Mode
Add console logging to API endpoints to debug data flow:
```javascript
console.log('Experience data:', experiences);
```

## 🎯 Best Practices

1. **Keep descriptions concise** but informative
2. **Use featured status** to highlight most important experiences
3. **Order experiences** logically (most recent first)
4. **Update regularly** to keep information current
5. **Use consistent technology naming** (e.g., "React" not "ReactJS")

## 🔮 Future Enhancements

Potential additions to the system:
- File upload for certificates/documents
- Rich text editor for descriptions
- Image support for company/institution logos
- Skills integration with experience entries
- Timeline view for experiences
- Export functionality (PDF resume generation)

---

This dynamic experience system provides a complete solution for managing and displaying professional and educational background across your portfolio website. The modular design allows for easy customization and integration wherever needed. 