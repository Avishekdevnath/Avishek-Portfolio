import { useState, useEffect } from 'react';
import * as Bs from 'react-icons/bs';  // Bootstrap Icons
import * as Si from 'react-icons/si';  // Simple Icons
import * as Di from 'react-icons/di';  // Devicons
import * as Tb from 'react-icons/tb';  // Tabler Icons
import * as Ri from 'react-icons/ri';  // Remix Icons

interface IconSelectorProps {
  value: { icon: string; iconSet: string };
  onChange: (value: { icon: string; iconSet: string }) => void;
  className?: string;
}

type IconSetType = {
  [key: string]: {
    icons: typeof Bs | typeof Si | typeof Di | typeof Tb | typeof Ri;
    label: string;
  };
};

const iconSets: IconSetType = {
  bs: { icons: Bs, label: 'Bootstrap Icons' },
  si: { icons: Si, label: 'Simple Icons' },
  di: { icons: Di, label: 'Devicons' },
  tb: { icons: Tb, label: 'Tabler Icons' },
  ri: { icons: Ri, label: 'Remix Icons' },
};

export default function IconSelector({ value, onChange, className = '' }: IconSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState(value.iconSet || 'bs');
  const [filteredIcons, setFilteredIcons] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const icons = Object.keys(iconSets[selectedSet].icons)
        .filter(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 50); // Limit to 50 results for performance
      setFilteredIcons(icons);
    } else {
      setFilteredIcons(Object.keys(iconSets[selectedSet].icons).slice(0, 50));
    }
  }, [searchTerm, selectedSet]);

  const handleSelectIcon = (iconName: string) => {
    onChange({ icon: iconName, iconSet: selectedSet });
    setIsOpen(false);
  };

  const getIconComponent = (iconSet: string, iconName: string) => {
    if (!iconSet || !iconName) return Bs.BsCode;
    const selectedIconSet = iconSets[iconSet]?.icons;
    return selectedIconSet?.[iconName as keyof typeof selectedIconSet] || Bs.BsCode;
  };

  const IconComponent = getIconComponent(value.iconSet, value.icon);

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Icon
      </label>
      
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          {IconComponent && <IconComponent size={20} />}
          <span>Change Icon</span>
        </button>

        {value.icon && (
          <button
            type="button"
            onClick={() => onChange({ icon: '', iconSet: 'bs' })}
            className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-gray-100"
          >
            <Bs.BsX size={20} />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-lg shadow-lg border w-80">
          <div className="space-y-4">
            {/* Icon Set Selector */}
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              {Object.entries(iconSets).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search icons..."
              className="w-full px-3 py-2 border rounded-lg"
            />

            {/* Icons Grid */}
            <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
              {filteredIcons.map((iconName) => {
                const Icon = getIconComponent(selectedSet, iconName);
                return Icon ? (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => handleSelectIcon(iconName)}
                    className={`p-2 rounded-lg hover:bg-gray-100 flex items-center justify-center ${
                      value.icon === iconName && value.iconSet === selectedSet
                        ? 'bg-blue-50 text-blue-600'
                        : ''
                    }`}
                    title={iconName}
                  >
                    <Icon size={20} />
                  </button>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 