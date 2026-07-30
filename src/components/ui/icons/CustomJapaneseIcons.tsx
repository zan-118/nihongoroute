/**
 * @file CustomJapaneseIcons.tsx
 * @description Pustaka komponen ikon SVG kustom berseni tradisional Jepang untuk NihongoRoute.
 */

import React from "react";

export interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export const CustomDashboardIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" strokeWidth="1" strokeDasharray="3 1" className="opacity-20" />
    <path d="M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17z" strokeWidth="1.2" className="opacity-40" />
    <path d="M7 17v-6.5h10V17" strokeWidth="1.8" className="text-primary" />
    <path d="M6 7.8h12" strokeWidth="2.5" className="text-primary" />
    <path d="M5 10.5h14" strokeWidth="1.5" className="text-primary" />
  </svg>
);

export const CustomHubIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" strokeWidth="1.8" className="opacity-40" />
    <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z" strokeWidth="1" strokeDasharray="2 2" className="opacity-20" />
    <path d="M12 8.5v7M8.5 12h7" strokeWidth="1.8" className="text-primary" />
    <polygon points="12,10.5 13.5,12 12,13.5 10.5,12" fill="currentColor" className="text-primary opacity-25" />
  </svg>
);

export const CustomCoursesIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="5" y="3" width="14" height="18" rx="1.5" strokeWidth="1.8" className="opacity-40" />
    <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1.5" className="opacity-40" />
    <circle cx="7" cy="5" r="1.2" fill="currentColor" stroke="none" className="text-primary" />
    <circle cx="7" cy="10" r="1.2" fill="currentColor" stroke="none" className="text-primary" />
    <circle cx="7" cy="14" r="1.2" fill="currentColor" stroke="none" className="text-primary" />
    <circle cx="7" cy="19" r="1.2" fill="currentColor" stroke="none" className="text-primary" />
    <line x1="12" y1="7.5" x2="16" y2="7.5" strokeWidth="1.5" className="opacity-80" />
    <line x1="12" y1="12" x2="16" y2="12" strokeWidth="1.5" className="opacity-80" />
    <line x1="12" y1="16.5" x2="15" y2="16.5" strokeWidth="1.5" className="opacity-80" />
  </svg>
);

export const CustomToolsIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="1.8" className="opacity-40" />
    <path d="M15.5 8.5l-7 7M8.5 8.5l2.2 2.2M15.5 15.5l-2.2-2.2" strokeWidth="1.8" className="text-primary" />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" className="text-primary opacity-25" />
  </svg>
);

export const CustomExamsIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="1.8" className="opacity-40" />
    <path d="M12 7.5a4.5 4.5 0 0 1 4.5 4.5 4.5 4.5 0 0 1-4.5 4.5 4.5 4.5 0 0 1-4.5-4.5 4.5 4.5 0 0 1 4.5-4.5z" strokeWidth="0.8" strokeDasharray="2 1.5" className="opacity-20" />
    <path d="M8.5 12l2.2 2.2 4.8-4.8" strokeWidth="2.2" className="text-primary" />
  </svg>
);

export const CustomSRSIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" strokeWidth="1" strokeDasharray="3 2" className="opacity-15" />
    <rect x="7" y="7" width="8" height="10" rx="1" transform="rotate(-12 7 7)" strokeWidth="1.8" className="opacity-40" />
    <rect x="10.5" y="6.5" width="8" height="10" rx="1" transform="rotate(12 10.5 6.5)" strokeWidth="1.8" className="text-primary" />
  </svg>
);

export const CustomLibraryIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M5.5 12.5h13a1.8 1.8 0 0 1 0 3.6h-13a1.8 1.8 0 0 1 0-3.6z" strokeWidth="1.8" className="opacity-40" />
    <circle cx="18.5" cy="14.3" r="0.8" fill="currentColor" stroke="none" className="opacity-40" />
    <path d="M5.5 6h13a1.8 1.8 0 0 1 0 3.6h-13a1.8 1.8 0 0 1 0-3.6z" strokeWidth="1.8" className="text-primary" />
    <circle cx="18.5" cy="7.8" r="0.8" fill="currentColor" stroke="none" className="text-primary" />
  </svg>
);

export const CustomCommunityIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="1.8" className="opacity-40" />
    <circle cx="14.5" cy="9.5" r="1.6" strokeWidth="1.5" className="opacity-40" />
    <path d="M11.5 15.5c0-1.5 1.2-2.7 2.7-2.7" strokeWidth="1.5" className="opacity-40" />
    <circle cx="9.5" cy="9.5" r="2" strokeWidth="1.8" className="text-primary" />
    <path d="M5.5 16.5c0-1.8 1.5-3.2 3.5-3.2" strokeWidth="1.8" className="text-primary" />
  </svg>
);

export const CustomSettingsIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="9" strokeWidth="1.8" className="opacity-40" />
    <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.3 4.3M14.1 14.1l4.3 4.3M5.6 18.4l4.3-4.3M14.1 9.9l4.3-4.3" strokeWidth="1" className="opacity-20" />
    <circle cx="12" cy="12" r="2.8" strokeWidth="1.5" className="text-primary" />
  </svg>
);

export const CustomShareIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="18" cy="6" r="2.5" strokeWidth="1.8" className="opacity-45" />
    <circle cx="18" cy="18" r="2.5" strokeWidth="1.8" className="opacity-45" />
    <path d="M8.5 11.2l6.8-3.4M8.5 12.8l6.8 3.4" strokeWidth="1.8" className="opacity-45" />
    <circle cx="6" cy="12" r="2.5" strokeWidth="1.8" className="text-primary" />
  </svg>
);

export const CustomHelpIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="1.8" className="opacity-40" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.8 0.8c0 1.6-2.3 2.5-2.3 2.5M12 16.5h.01" strokeWidth="2.2" className="text-primary" />
  </svg>
);

export const CustomUserIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" strokeWidth="1.8" className="opacity-40" />
    <circle cx="12" cy="8.8" r="2.2" strokeWidth="1.8" className="text-primary" />
    <path d="M6 17.5c0-2.2 2.7-4 6-4s6 1.8 6 4" strokeWidth="1.8" className="text-primary" />
  </svg>
);

export const CustomLoginIcon = ({ size = 18, className, ...props }: CustomIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect x="4" y="3" width="16" height="18" rx="1" strokeWidth="1.8" className="opacity-40" />
    <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.8" className="opacity-40" />
    <line x1="4" y1="9" x2="12" y2="9" strokeWidth="1.2" className="opacity-40" />
    <line x1="4" y1="15" x2="12" y2="15" strokeWidth="1.2" className="opacity-40" />
    <line x1="8" y1="3" x2="8" y2="21" strokeWidth="0.5" className="opacity-20" />
    <path d="M14 12h4.5M16.5 9.5l2.5 2.5-2.5 2.5" strokeWidth="1.5" className="text-primary" />
  </svg>
);
