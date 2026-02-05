import { Badge as BadgeType } from '../backend';
import { useEffect, useState } from 'react';

interface BadgeDisplayProps {
  badge?: BadgeType;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animate?: boolean;
}

const badgeConfig = {
  persistentRabbit: {
    name: 'Persistent Rabbit',
    image: '/assets/generated/persistent-rabbit-badge-transparent.dim_100x100.png',
    description: '7-day streak',
    gradient: 'from-purple-400 to-violet-400',
  },
  dsaMasterCat: {
    name: 'DSA Master Cat',
    image: '/assets/generated/dsa-master-cat-badge-transparent.dim_100x100.png',
    description: '14-day streak',
    gradient: 'from-violet-400 to-indigo-400',
  },
  legendaryScholar: {
    name: 'Legendary Scholar',
    image: '/assets/generated/legendary-scholar-badge-transparent.dim_100x100.png',
    description: '21+ day streak',
    gradient: 'from-yellow-400 via-orange-400 to-red-400',
  },
};

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-12 h-12',
  large: 'w-20 h-20',
};

export default function BadgeDisplay({ badge, size = 'medium', showLabel = false, animate = false }: BadgeDisplayProps) {
  const [showSparkles, setShowSparkles] = useState(false);
  
  useEffect(() => {
    if (animate && badge) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [animate, badge]);
  
  if (!badge) {
    // No badge - show placeholder for users under 7-day streak
    return (
      <div className="flex items-center gap-3">
        <div className={`relative ${animate ? 'animate-bounce' : ''}`}>
          <div className={`${sizeClasses[size]} relative z-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center opacity-50`}>
            <span className="text-xs text-white font-bold">?</span>
          </div>
        </div>
        
        {showLabel && (
          <div className="flex flex-col">
            <span className={`font-bold text-muted-foreground ${size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-lg' : 'text-sm'}`}>
              No Badge Yet
            </span>
            <span className="text-xs text-muted-foreground">Reach 7-day streak</span>
          </div>
        )}
      </div>
    );
  }

  const config = badgeConfig[badge];
  if (!config) return null;

  return (
    <div className="flex items-center gap-3">
      <div className={`relative ${animate ? 'animate-bounce' : ''}`}>
        {/* Glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-full blur-md opacity-50 transition-all duration-500 ${animate ? 'scale-125' : 'scale-100'}`} />
        
        {/* Badge image */}
        <img
          src={config.image}
          alt={config.name}
          className={`${sizeClasses[size]} relative z-10 drop-shadow-lg transition-all duration-300 hover:scale-110 ${animate ? 'animate-pulse' : ''}`}
        />
        
        {/* Sparkle particles */}
        {showSparkles && (
          <>
            <div className="absolute -top-2 -right-2 w-4 h-4 animate-ping">
              <img 
                src="/assets/generated/sparkle-particles-transparent.dim_100x100.png" 
                alt="sparkle" 
                className="w-full h-full opacity-80"
              />
            </div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 animate-ping animation-delay-150">
              <img 
                src="/assets/generated/sparkle-particles-transparent.dim_100x100.png" 
                alt="sparkle" 
                className="w-full h-full opacity-60"
              />
            </div>
            <div className="absolute top-0 left-1/2 w-3 h-3 animate-ping animation-delay-300">
              <img 
                src="/assets/generated/sparkle-particles-transparent.dim_100x100.png" 
                alt="sparkle" 
                className="w-full h-full opacity-70"
              />
            </div>
          </>
        )}
      </div>
      
      {showLabel && (
        <div className="flex flex-col">
          <span className={`font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent ${size === 'large' ? 'text-2xl' : size === 'medium' ? 'text-lg' : 'text-sm'}`}>
            {config.name}
          </span>
          <span className="text-xs text-muted-foreground">{config.description}</span>
        </div>
      )}
    </div>
  );
}
