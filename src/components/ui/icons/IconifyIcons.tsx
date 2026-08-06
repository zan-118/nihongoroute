"use client";

/**
 * @file IconifyIcons.tsx
 * @description Clean Full-Color HD Icon Library powered by @iconify/react using Fluent Emoji Flat (fluent-emoji-flat:*),
 * Flat Color Icons (flat-color-icons:*), Remix Icons (ri:*), and official brand logos (logos:*, skill-icons:*).
 * All unused icon exports and redundant alias mappings have been completely removed.
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
   1. OFFICIAL BRAND LOGOS
   ========================================================================= */
export const Facebook = createIcon("logos:facebook");
export const Github = createIcon("ri:github-fill");
export const Instagram = createIcon("skill-icons:instagram");
export const Threads = createIcon("ri:threads-fill");

/* =========================================================================
   2. UI CONTROLS & NAVIGATION
   ========================================================================= */
export const ArrowDown = createIcon("fluent-emoji-flat:down-arrow");
export const ArrowLeft = createIcon("fluent-emoji-flat:left-arrow");
export const ArrowRight = createIcon("fluent-emoji-flat:right-arrow");
export const ArrowUpRight = createIcon("fluent-emoji-flat:up-arrow");
export const ArrowRightLeft = createIcon("fluent-emoji-flat:clockwise-vertical-arrows");
export const ChevronDown = createIcon("fluent-emoji-flat:down-arrow");
export const ChevronLeft = createIcon("fluent-emoji-flat:left-arrow");
export const ChevronRight = createIcon("fluent-emoji-flat:right-arrow");
export const ChevronUp = createIcon("fluent-emoji-flat:up-arrow");
export const ChevronsLeft = createIcon("fluent-emoji-flat:left-arrow");
export const ChevronsRight = createIcon("fluent-emoji-flat:right-arrow");
export const CornerDownLeft = createIcon("fluent-emoji-flat:left-arrow");
export const ExternalLink = createIcon("fluent-emoji-flat:right-arrow");

export const Command = createIcon("fluent-emoji-flat:gear");
export const GitCompare = createIcon("fluent-emoji-flat:clockwise-vertical-arrows");
export const Loader2 = createIcon("line-md:loading-twotone-loop");
export const Maximize2 = createIcon("fluent-emoji-flat:up-arrow");
export const Menu = createIcon("flat-color-icons:menu");
export const Minimize2 = createIcon("fluent-emoji-flat:down-arrow");
export const RefreshCcw = createIcon("fluent-emoji-flat:counterclockwise-arrows-button");
export const RefreshCw = createIcon("fluent-emoji-flat:clockwise-vertical-arrows");
export const Search = createIcon("fluent-emoji-flat:magnifying-glass-tilted-left");
export const Settings = createIcon("fluent-emoji-flat:gear");
export const Share2 = createIcon("fluent-emoji-flat:right-arrow");
export const Sliders = createIcon("fluent-emoji-flat:gear");
export const X = createIcon("fluent-emoji-flat:cross-mark-button");

/* =========================================================================
   3. CONTENT & LEARNING FEATURES
   ========================================================================= */
export const Activity = createIcon("fluent-emoji-flat:chart-increasing");
export const AlertCircle = createIcon("fluent-emoji-flat:information");
export const AlertOctagon = createIcon("fluent-emoji-flat:stop-sign");
export const AlertTriangle = createIcon("fluent-emoji-flat:warning");
export const AudioLines = createIcon("fluent-emoji-flat:studio-microphone");
export const Award = createIcon("fluent-emoji-flat:sports-medal");
export const BadgeCheck = createIcon("fluent-emoji-flat:check-mark-button");
export const BarChart = createIcon("fluent-emoji-flat:bar-chart");
export const BatteryMedium = createIcon("fluent-emoji-flat:battery");
export const Bell = createIcon("fluent-emoji-flat:bell");
export const BellOff = createIcon("fluent-emoji-flat:bell-with-slash");
export const BellRing = createIcon("fluent-emoji-flat:bell");

export const Book = createIcon("fluent-emoji-flat:open-book");
export const BookOpen = createIcon("fluent-emoji-flat:open-book");
export const Bookmark = createIcon("fluent-emoji-flat:bookmark");
export const Brain = createIcon("fluent-emoji-flat:brain");

export const Briefcase = createIcon("fluent-emoji-flat:briefcase");
export const Calendar = createIcon("fluent-emoji-flat:tear-off-calendar");
export const Check = createIcon("fluent-emoji-flat:check-mark-button");
export const Circle = createIcon("fluent-emoji-flat:red-circle");
export const CircleHelp = createIcon("fluent-emoji-flat:question-mark");
export const Clipboard = createIcon("fluent-emoji-flat:clipboard");
export const ClipboardPenLine = createIcon("fluent-emoji-flat:memo");
export const Clock = createIcon("fluent-emoji-flat:three-o-clock");
export const Cloud = createIcon("fluent-emoji-flat:cloud");
export const Coffee = createIcon("fluent-emoji-flat:hot-beverage");
export const Compass = createIcon("fluent-emoji-flat:compass");
export const Crown = createIcon("fluent-emoji-flat:crown");
export const Database = createIcon("fluent-emoji-flat:file-cabinet");
export const Download = createIcon("fluent-emoji-flat:inbox-tray");
export const Edit = createIcon("fluent-emoji-flat:pencil");
export const Eye = createIcon("fluent-emoji-flat:eye");
export const EyeOff = createIcon("fluent-emoji-flat:eyes");
export const FileIcon = createIcon("fluent-emoji-flat:page-facing-up");
export const FileText = createIcon("fluent-emoji-flat:page-with-curl");
export const Filter = createIcon("fluent-emoji-flat:funnel");
export const Flag = createIcon("fluent-emoji-flat:triangular-flag");
export const Flame = createIcon("fluent-emoji-flat:fire");
export const Gamepad2 = createIcon("fluent-emoji-flat:video-game");
export const Gauge = createIcon("fluent-emoji-flat:speedometer");
export const Globe = createIcon("fluent-emoji-flat:globe-showing-asia-australia");
export const GraduationCap = createIcon("fluent-emoji-flat:graduation-cap");

export const LayoutGrid = createIcon("flat-color-icons:alphabetical-sorting-az");
export const Hash = createIcon("flat-color-icons:numerical-sorting-12");
export const Headphones = createIcon("fluent-emoji-flat:headphone");
export const Heart = createIcon("fluent-emoji-flat:red-heart");
export const HelpCircle = createIcon("fluent-emoji-flat:question-mark");
export const Home = createIcon("fluent-emoji-flat:house");
export const Hourglass = createIcon("fluent-emoji-flat:hourglass-done");
export const Info = createIcon("fluent-emoji-flat:information");
export const KeyRound = createIcon("fluent-emoji-flat:key");
export const Keyboard = createIcon("fluent-emoji-flat:keyboard");
export const Layers = createIcon("fluent-emoji-flat:books");
export const LayoutDashboard = createIcon("fluent-emoji-flat:shinto-shrine");
export const Lightbulb = createIcon("fluent-emoji-flat:light-bulb");
export const Link = createIcon("fluent-emoji-flat:link");
export const ListChecks = createIcon("flat-color-icons:todo-list");
export const Lock = createIcon("fluent-emoji-flat:locked");
export const LogIn = createIcon("fluent-emoji-flat:door");
export const Mail = createIcon("fluent-emoji-flat:envelope");
export const MapPin = createIcon("fluent-emoji-flat:round-pushpin");
export const Medal = createIcon("fluent-emoji-flat:sports-medal");
export const MessageSquare = createIcon("fluent-emoji-flat:speech-balloon");
export const Mic = createIcon("fluent-emoji-flat:microphone");
export const Monitor = createIcon("fluent-emoji-flat:desktop-computer");
export const Moon = createIcon("fluent-emoji-flat:crescent-moon");
export const MousePointer2 = createIcon("fluent-emoji-flat:backhand-index-pointing-up");
export const Pause = createIcon("fluent-emoji-flat:pause-button");
export const PenTool = createIcon("fluent-emoji-flat:pencil");
export const Plane = createIcon("fluent-emoji-flat:airplane");
export const Play = createIcon("fluent-emoji-flat:play-button");
export const Plus = createIcon("fluent-emoji-flat:plus");
export const Puzzle = createIcon("fluent-emoji-flat:puzzle-piece");
export const Radio = createIcon("fluent-emoji-flat:radio");
export const Repeat2 = createIcon("fluent-emoji-flat:repeat-single-button");
export const Save = createIcon("fluent-emoji-flat:floppy-disk");
export const ScanText = createIcon("fluent-emoji-flat:magnifying-glass-tilted-right");
export const Send = createIcon("fluent-emoji-flat:paper-airplane");
export const Server = createIcon("fluent-emoji-flat:computer-disk");
export const Shield = createIcon("fluent-emoji-flat:shield");
export const Shuffle = createIcon("fluent-emoji-flat:shuffle-tracks-button");
export const Skull = createIcon("fluent-emoji-flat:skull");
export const Sparkles = createIcon("fluent-emoji-flat:sparkles");
export const Sprout = createIcon("fluent-emoji-flat:seedling");
export const Square = createIcon("fluent-emoji-flat:white-square-button");
export const Star = createIcon("fluent-emoji-flat:star");
export const Sun = createIcon("fluent-emoji-flat:sun");
export const Swords = createIcon("fluent-emoji-flat:crossed-swords");
export const Target = createIcon("fluent-emoji-flat:bullseye");
export const Timer = createIcon("fluent-emoji-flat:stopwatch");
export const TimerReset = createIcon("fluent-emoji-flat:hourglass-not-done");
export const Trash2 = createIcon("fluent-emoji-flat:wastebasket");
export const Trophy = createIcon("fluent-emoji-flat:trophy");
export const Tv = createIcon("fluent-emoji-flat:television");
export const Upload = createIcon("fluent-emoji-flat:outbox-tray");
export const User = createIcon("fluent-emoji-flat:bust-in-silhouette");
export const Users = createIcon("fluent-emoji-flat:busts-in-silhouette");
export const Volume2 = createIcon("fluent-emoji-flat:speaker-high-volume");
export const VolumeX = createIcon("fluent-emoji-flat:muted-speaker");
export const Wand2 = createIcon("fluent-emoji-flat:magic-wand");
export const Waves = createIcon("fluent-emoji-flat:water-wave");
export const WifiOff = createIcon("fluent-emoji-flat:no-signal");
export const Wrench = createIcon("fluent-emoji-flat:wrench");
export const Zap = createIcon("fluent-emoji-flat:high-voltage");

/* =========================================================================
   4. JAPANESE SIGNATURE ALIAS & NAVIGATION BRAND ICONS
   ========================================================================= */
export const CustomDashboardIcon = createIcon("fluent-emoji-flat:shinto-shrine");
export const CustomCoursesIcon = createIcon("fluent-emoji-flat:graduation-cap");
export const CustomSRSIcon = createIcon("fluent-emoji-flat:brain");
export const CustomLibraryIcon = createIcon("fluent-emoji-flat:books");
export const CustomUserIcon = createIcon("fluent-emoji-flat:bust-in-silhouette");
export const CustomLoginIcon = createIcon("fluent-emoji-flat:door");
export const CustomToolsIcon = createIcon("fluent-emoji-flat:wrench");
export const CustomExamsIcon = createIcon("fluent-emoji-flat:memo");
export const CustomCommunityIcon = createIcon("fluent-emoji-flat:busts-in-silhouette");
export const CustomSettingsIcon = createIcon("fluent-emoji-flat:gear");
export const CustomShareIcon = createIcon("fluent-emoji-flat:handshake");
export const CustomHelpIcon = createIcon("fluent-emoji-flat:red-question-mark");
