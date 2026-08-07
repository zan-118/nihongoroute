"use client";

/**
 * @file IconifyIcons.tsx
 * @description Clean, Unified Icon Library powered by @iconify/react using 100% Remix Icons (ri:*).
 * All icon exports use Remix Icon naming conventions (no legacy lucide-react names).
 */

import React from "react";
import { Icon } from "@iconify/react";

export interface IconProps extends Omit<React.ComponentPropsWithoutRef<"svg">, "size"> {
  size?: number;
}

export type IconType = React.ComponentType<IconProps>;

function createIcon(iconName: string): IconType {
  const Component = React.forwardRef<SVGSVGElement, IconProps>(
    ({ size = 24, className, ...props }, ref) => {
      return (
        <Icon
          icon={iconName}
          width={size}
          height={size}
          className={className}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ref={ref as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...(props as any)}
        />
      );
    }
  );
  Component.displayName = iconName.split(":")[1] || iconName;
  return Component;
}

/* =========================================================================
   1. OFFICIAL BRAND LOGOS & SOCIAL
   ========================================================================= */
export const Facebook = createIcon("ri:facebook-fill");
export const Github = createIcon("ri:github-fill");
export const Instagram = createIcon("ri:instagram-line");
export const Threads = createIcon("ri:threads-fill");

/* =========================================================================
   2. UI CONTROLS & NAVIGATION
   ========================================================================= */
export const ArrowDown = createIcon("ri:arrow-down-line");
export const ArrowLeft = createIcon("ri:arrow-left-line");
export const ArrowRight = createIcon("ri:arrow-right-line");
export const ArrowUpRight = createIcon("ri:arrow-up-right-line");
export const ArrowLeftRight = createIcon("ri:arrow-left-right-line");
export const ChevronDown = createIcon("ri:chevron-down-line");
export const ChevronLeft = createIcon("ri:chevron-left-line");
export const ChevronRight = createIcon("ri:chevron-right-line");
export const ChevronUp = createIcon("ri:chevron-up-line");
export const DoubleLeft = createIcon("ri:double-left-line");
export const DoubleRight = createIcon("ri:double-right-line");
export const ExternalLink = createIcon("ri:external-link-line");

export const CommandLine = createIcon("ri:command-line");
export const GitCompare = createIcon("ri:git-compare-line");
export const Loader = createIcon("ri:loader-4-line");
export const Menu = createIcon("ri:menu-line");
export const FullscreenExit = createIcon("ri:fullscreen-exit-line");
export const Refresh = createIcon("ri:refresh-line");
export const Restart = createIcon("ri:restart-line");
export const Search = createIcon("ri:search-line");
export const Settings = createIcon("ri:settings-4-line");
export const Share = createIcon("ri:share-line");
export const Sliders = createIcon("ri:sliders-line");
export const Close = createIcon("ri:close-line");
export const X = createIcon("ri:close-line");

/* =========================================================================
   3. CONTENT & LEARNING FEATURES
   ========================================================================= */
export const Pulse = createIcon("ri:pulse-line");
export const ErrorWarning = createIcon("ri:error-warning-line");
export const AlarmWarning = createIcon("ri:alarm-warning-line");
export const Alert = createIcon("ri:alert-line");
export const SoundModule = createIcon("ri:sound-module-line");
export const Award = createIcon("ri:award-line");
export const CheckboxCircle = createIcon("ri:checkbox-circle-line");
export const BarChart = createIcon("ri:bar-chart-fill");
export const BatteryLow = createIcon("ri:battery-low-line");
export const Notification = createIcon("ri:notification-3-line");
export const NotificationOff = createIcon("ri:notification-off-line");
export const NotificationRing = createIcon("ri:notification-4-line");

export const Book = createIcon("ri:book-2-line");
export const BookOpen = createIcon("ri:book-open-line");
export const Bookmark = createIcon("ri:bookmark-line");
export const Brain = createIcon("ri:brain-line");

export const Briefcase = createIcon("ri:briefcase-line");
export const CalendarEvent = createIcon("ri:calendar-event-line");
export const Check = createIcon("ri:check-line");
export const Circle = createIcon("ri:checkbox-blank-circle-line");
export const Question = createIcon("ri:question-line");
export const Clipboard = createIcon("ri:clipboard-line");
export const Draft = createIcon("ri:draft-line");
export const Time = createIcon("ri:time-line");
export const Cloud = createIcon("ri:cloud-line");
export const Cup = createIcon("ri:cup-line");
export const Compass = createIcon("ri:compass-3-line");
export const VipCrown = createIcon("ri:vip-crown-fill");
export const Database = createIcon("ri:database-2-line");
export const Download = createIcon("ri:download-2-line");
export const Edit = createIcon("ri:edit-line");
export const Eye = createIcon("ri:eye-line");
export const EyeOff = createIcon("ri:eye-off-line");
export const File = createIcon("ri:file-line");
export const FileText = createIcon("ri:file-text-line");
export const Filter = createIcon("ri:filter-3-line");
export const Flag = createIcon("ri:flag-line");
export const Fire = createIcon("ri:fire-line");
export const Gamepad = createIcon("ri:gamepad-line");
export const DashboardSpeed = createIcon("ri:dashboard-3-line");
export const Global = createIcon("ri:global-line");
export const GraduationCap = createIcon("ri:graduation-cap-line");

export const LayoutGrid = createIcon("ri:layout-grid-line");
export const Hashtag = createIcon("ri:hashtag");
export const NumberList = createIcon("ri:list-ordered-2");
export const Headphone = createIcon("ri:headphone-line");
export const Heart = createIcon("ri:heart-line");
export const Home = createIcon("ri:home-4-line");
export const Hourglass = createIcon("ri:hourglass-line");
export const Information = createIcon("ri:information-line");
export const Key = createIcon("ri:key-2-line");
export const Keyboard = createIcon("ri:keyboard-line");
export const Stack = createIcon("ri:stack-line");
export const Dashboard = createIcon("ri:dashboard-line");
export const Lightbulb = createIcon("ri:lightbulb-line");
export const Link = createIcon("ri:link");
export const ListCheck = createIcon("ri:list-check");
export const Lock = createIcon("ri:lock-line");
export const LoginBox = createIcon("ri:login-box-line");
export const Mail = createIcon("ri:mail-line");
export const MapPin = createIcon("ri:map-pin-line");
export const Medal = createIcon("ri:medal-line");
export const Message = createIcon("ri:message-3-line");
export const Mic = createIcon("ri:mic-line");
export const Computer = createIcon("ri:computer-line");
export const Moon = createIcon("ri:moon-line");
export const Cursor = createIcon("ri:cursor-line");
export const PauseCircle = createIcon("ri:pause-circle-line");
export const Pencil = createIcon("ri:pencil-line");
export const Plane = createIcon("ri:plane-line");
export const PlayCircle = createIcon("ri:play-circle-line");
export const Add = createIcon("ri:add-line");
export const Puzzle = createIcon("ri:puzzle-line");
export const Radio = createIcon("ri:radio-line");
export const Repeat = createIcon("ri:repeat-line");
export const Save = createIcon("ri:save-line");
export const Scan = createIcon("ri:scan-2-line");
export const SendPlane = createIcon("ri:send-plane-line");
export const Server = createIcon("ri:server-line");
export const Shield = createIcon("ri:shield-line");
export const Shuffle = createIcon("ri:shuffle-line");
export const Plant = createIcon("ri:plant-line");
export const CheckboxBlank = createIcon("ri:checkbox-blank-line");
export const Star = createIcon("ri:star-line");
export const Sun = createIcon("ri:sun-line");
export const Sword = createIcon("ri:sword-line");
export const Target = createIcon("ri:target-line");
export const Timer = createIcon("ri:timer-line");
export const History = createIcon("ri:history-line");
export const DeleteBin = createIcon("ri:delete-bin-line");
export const Trophy = createIcon("ri:trophy-line");
export const Tv = createIcon("ri:tv-2-line");
export const Upload = createIcon("ri:upload-2-line");
export const User = createIcon("ri:user-line");
export const Team = createIcon("ri:team-line");
export const VolumeUp = createIcon("ri:volume-up-line");
export const VolumeMute = createIcon("ri:volume-mute-line");
export const WifiOff = createIcon("ri:wifi-off-line");
export const Wrench = createIcon("ri:wrench-line");
export const Zap = createIcon("ri:zap-line");


