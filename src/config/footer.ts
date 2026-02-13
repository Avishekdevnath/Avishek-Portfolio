import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

export const footerConfig = {
  about: {
    description: "Full-stack developer specializing in modern web technologies. Building digital solutions that make a difference."
  },
  navigationLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Projects', href: '/projects' },
    { label: 'Contact', href: '/contact' },
  ],
  quickLinks: [
    { label: 'Hire Me', href: '/hire-me' },
    { label: 'Resume', href: '/resume' },
    { label: 'Skills', href: '/#skills' },
    { label: 'Experience', href: '/#experience' },
  ],
  socialLinks: [
    {
      icon: FiGithub,
      href: 'https://github.com/avishekdevnath',
      label: 'GitHub'
    },
    {
      icon: FiLinkedin,
      href: 'https://linkedin.com/in/avishekdevnath',
      label: 'LinkedIn'
    },
    {
      icon: FiTwitter,
      href: 'https://twitter.com/avishekdevnath',
      label: 'Twitter'
    },
  ],
  contactInfo: {
    email: 'avishekdevnath@gmail.com',
    phone: '+880 1234567890',
    location: 'Dhaka, Bangladesh'
  },
  legal: {
    name: 'Avishek Devnath',
    links: [
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
    ]
  }
}; 
