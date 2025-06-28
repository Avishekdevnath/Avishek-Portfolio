import { User, Mail, Globe, Github, Linkedin, Twitter } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and website settings</p>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={40} className="text-gray-400" />
              </div>
              <div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Change Photo
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Recommended: Square JPG, PNG, or GIF, at least 500px
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Write a short bio about yourself..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Social Links</h2>
          <div className="space-y-4">
            {[
              { icon: Globe, label: 'Website', placeholder: 'https://yourwebsite.com' },
              { icon: Github, label: 'GitHub', placeholder: 'https://github.com/username' },
              { icon: Linkedin, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
              { icon: Twitter, label: 'Twitter', placeholder: 'https://twitter.com/username' },
            ].map((social) => {
              const Icon = social.icon;
              return (
                <div key={social.label} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {social.label}
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={social.placeholder}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Website Settings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Website Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Title
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your Portfolio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Description
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="A brief description of your portfolio for search engines..."
              />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                <span className="text-sm text-gray-700">Enable dark mode</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
} 