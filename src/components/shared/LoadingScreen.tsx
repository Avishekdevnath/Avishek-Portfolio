import { Code2, Star, Layers, BarChart2, Eye, CheckCircle2, Clock, Loader2, BookOpen, Mail, Briefcase, Bell } from 'lucide-react';

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
      icon: Loader2,
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
      {/* Main Icon */}
      <div className="relative mb-8">
        <Icon className="w-16 h-16 text-blue-500 animate-spin" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent animate-pulse" />
      </div>

      {/* Title and Subtitle */}
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
        {config.title}
      </h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        {config.subtitle}
      </p>

      {/* Loading Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
        {config.stats.map(({ icon: StatIcon, color }, index) => (
          <div 
            key={index}
            className={`bg-${color}-50 p-4 rounded-lg flex items-center justify-center
              animate-pulse`}
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <StatIcon className={`w-6 h-6 text-${color}-500`} />
          </div>
        ))}
      </div>

      {/* Loading Bar */}
      <div className="w-full max-w-md mt-8 bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-blue-500 rounded-full animate-loading" />
      </div>
    </div>
  );
}