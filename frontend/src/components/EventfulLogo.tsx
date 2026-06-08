import React from 'react';

interface EventfulLogoProps {
  className?: string;
  showWordmark?: boolean;
}

export const EventfulLogo: React.FC<EventfulLogoProps> = ({
  className = 'h-9 w-9',
  showWordmark = false,
}) => {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="11" className="fill-indigo-600 dark:fill-indigo-500" />
        <rect
          width="40"
          height="40"
          rx="11"
          fill="url(#eventful-logo-shine)"
          opacity="0.35"
        />
        <path
          d="M12 13.5c0-.83.67-1.5 1.5-1.5h13c.83 0 1.5.67 1.5 1.5v13c0 .83-.67 1.5-1.5 1.5h-13a1.5 1.5 0 0 1-1.5-1.5v-13Z"
          fill="white"
          fillOpacity="0.95"
        />
        <circle cx="11" cy="20" r="1.75" className="fill-indigo-600 dark:fill-indigo-500" />
        <circle cx="29" cy="20" r="1.75" className="fill-indigo-600 dark:fill-indigo-500" />
        <path
          d="M18 16.5h4M18 20h4M18 23.5h2.5"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M27.5 11.5 29 13l-2.5 2.5"
          stroke="#c4b5fd"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="29.5" cy="12" r="1" fill="#ddd6fe" />
        <defs>
          <linearGradient id="eventful-logo-shine" x1="8" y1="4" x2="34" y2="36">
            <stop stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      {showWordmark && (
        <span className="text-xl font-bold tracking-tight text-foreground">
          Event<span className="text-indigo-500">ful</span>
        </span>
      )}
    </span>
  );
};
