# Avishek Portfolio Website

A modern, full-stack portfolio website built with Next.js, featuring a comprehensive dashboard for content management, blog system, and professional showcase capabilities.

![Portfolio Preview](https://img.shields.io/badge/Next.js-13.5.6-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3.2-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-6.3.0-green?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.3.5-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🚀 Features

### Public Portfolio
- **Responsive Design**: Mobile-first approach with seamless animations
- **Hero Section**: Dynamic introduction with call-to-action
- **About Section**: Professional background and skills showcase
- **Experience Timeline**: Work history and education with visual timeline
- **Projects Showcase**: Interactive project gallery with filtering
- **Statistics Counter**: Animated counters for achievements
- **Contact Form**: Integrated contact system with email notifications
- **Blog System**: Full-featured blog with rich text editing
- **SEO Optimized**: Meta tags, structured data, and performance optimization

### Admin Dashboard
- **Content Management**: CRUD operations for all portfolio content
- **Projects Management**: Add, edit, and organize projects with images
- **Skills Management**: Dynamic skills section with categorization
- **Experience Management**: Work history and education timeline
- **Blog Management**: Rich text editor with image/video upload
- **Messages Management**: Contact form submissions and responses
- **Hiring Inquiries**: Job opportunity management system
- **Analytics Dashboard**: Statistics and insights
- **Notifications System**: Real-time notifications
- **Settings Panel**: Site configuration and preferences

### Technical Features
- **Authentication**: Secure login system with JWT
- **File Upload**: Cloudinary integration for image/video management
- **Email System**: Nodemailer integration for notifications
- **Database**: MongoDB with Mongoose ODM
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error boundaries
- **Loading States**: Smooth loading animations
- **Toast Notifications**: User feedback system

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 13.5.6 (App Router)
- **Language**: TypeScript 5.3.2
- **Styling**: Tailwind CSS 3.3.5
- **UI Components**: Custom components with Lucide React icons
- **Animations**: Framer Motion 10.16.4
- **Rich Text**: TipTap editor with multiple extensions
- **Charts**: Recharts for analytics

### Backend
- **Runtime**: Node.js
- **Database**: MongoDB 6.3.0 with Mongoose 8.0.1
- **Authentication**: JWT-based authentication
- **File Storage**: Cloudinary integration
- **Email**: Nodemailer 7.0.3
- **PDF Generation**: jsPDF for document generation
- **Image Processing**: html2canvas for screenshot generation

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript
- **Build Tool**: Next.js built-in
- **Deployment**: Vercel-ready configuration

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Cloudinary account for file storage
- Gmail account for email notifications

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/avishek-portfolio.git
   cd avishek-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   # Gmail Configuration
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   
   # Site Configuration
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # MongoDB Configuration
   MONGODB_URI=your-mongodb-connection-string
   
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Generate JWT Secret**
   
   Run the following script to generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
   
   Add the generated secret to your `.env.local` file:
   ```env
   JWT_SECRET=your-generated-secret
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

### Email Testing
```bash
npm run test-email
```

## 📁 Project Structure

```
avishek-portfolio/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Admin dashboard pages
│   │   ├── blogs/             # Blog pages
│   │   ├── projects/          # Project detail pages
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── pages/             # Page-specific components
│   │   └── shared/            # Shared components
│   ├── lib/                   # Utility libraries
│   ├── models/                # MongoDB schemas
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # React context providers
│   ├── data/                  # Static data and configurations
│   ├── scripts/               # Utility scripts
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── vercel.json               # Vercel deployment config
└── package.json              # Dependencies and scripts
```

## 🎯 Key Components

### Dashboard Features
- **Projects Management**: Create, edit, and organize portfolio projects
- **Skills Management**: Dynamic skills showcase with categories
- **Experience Management**: Professional timeline management
- **Blog System**: Rich text editor with media support
- **Analytics**: Statistics and performance metrics
- **Messages**: Contact form and hiring inquiry management

### API Endpoints
- `/api/projects` - Project CRUD operations
- `/api/blogs` - Blog management
- `/api/skills` - Skills management
- `/api/experience` - Experience management
- `/api/messages` - Contact form handling
- `/api/auth` - Authentication endpoints
- `/api/upload` - File upload handling

## 🔐 Authentication

The application uses JWT-based authentication for the admin dashboard. Access the dashboard at `/dashboard` after logging in.

## 📱 Responsive Design

The portfolio is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Avishek Devnath**
- Senior CS Instructor at Phitron
- Full-Stack Developer (MERN Stack)
- 500+ LeetCode problems solved
- Email: avishekdevnath@gmail.com
- LinkedIn: [avishekdevnath](https://www.linkedin.com/in/avishekdevnath)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the database solution
- Cloudinary for file storage
- All open-source contributors

---

## 📞 Support

If you have any questions or need help with the project, feel free to:
- Open an issue on GitHub
- Contact me via email: avishekdevnath@gmail.com
- Connect with me on LinkedIn

**Happy Coding! 🚀**