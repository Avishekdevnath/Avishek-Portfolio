import { Code2, Star, Layers, BarChart2, Eye, CheckCircle2, Clock, BookOpen, Mail, Briefcase, Bell } from 'lucide-react';

interface LoadingScreenProps {
  type?: 'skills' | 'projects' | 'blogs' | 'messages' | 'global';
  message?: string;
  className?: string;
}

export default function LoadingScreen({ 
  type = 'global', 
  message = 'Loading...', 
  className = '' 
}: LoadingScreenProps) {
  const configs = {
    skills: {
      title: 'Loading Skills Dashboard',
      subtitle: 'Preparing your skills management interface...',
      icon: Code2,
      stats: [
        { icon: Code2, color: 'blue' },
        { icon: Star, color: 'yellow' },
        { icon: Layers, color: 'purple' },
        { icon: BarChart2, color: 'green' }
      ]
    },
    projects: {
      title: 'Loading Projects',
      subtitle: 'Fetching your portfolio projects...',
      icon: Briefcase,
      stats: [
        { icon: Eye, color: 'blue' },
        { icon: Star, color: 'yellow' },
        { icon: Clock, color: 'purple' },
        { icon: CheckCircle2, color: 'green' }
      ]
    },
    blogs: {
      title: 'Loading Blog Posts',
      subtitle: 'Retrieving your articles and insights...',
      icon: BookOpen,
      stats: [
        { icon: Eye, color: 'blue' },
        { icon: Star, color: 'yellow' },
        { icon: Clock, color: 'purple' },
        { icon: CheckCircle2, color: 'green' }
      ]
    },
    messages: {
      title: 'Loading Messages',
      subtitle: 'Fetching your conversations...',
      icon: Mail,
      stats: [
        { icon: Eye, color: 'blue' },
        { icon: Star, color: 'yellow' },
        { icon: Clock, color: 'purple' },
        { icon: Bell, color: 'red' }
      ]
    },
    global: {
      title: message,
      subtitle: 'Please wait while we prepare your content...',
      icon: Eye,
      stats: [
        { icon: Eye, color: 'blue' },
        { icon: Star, color: 'yellow' },
        { icon: Clock, color: 'purple' },
        { icon: CheckCircle2, color: 'green' }
      ]
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Title and Subtitle */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {config.title}
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        {config.subtitle}
      </p>

      {/* Wireframe Skeleton Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="h-24 bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}