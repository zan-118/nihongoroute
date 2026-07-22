"use client";

/**
 * @file icons.tsx
 * @description Curated, premium, anti-slop icon library powered by @iconify/react.
 * Features a clean mix of Google Flat Color Icons and Solar premium outline/filled vectors.
 * Strictly free of emoji icon sets to maintain a professional, sleek visual identity.
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
          ref={ref as any}
          {...(props as any)}
        />
      );
    }
  );
  Component.displayName = iconName.split(":")[1] || iconName;
  return Component;
}

export const Activity = createIcon("flat-color-icons:sales-performance");
export const AlertCircle = createIcon("flat-color-icons:about");
export const AlertOctagon = createIcon("flat-color-icons:rules");
export const AlertTriangle = createIcon("flat-color-icons:warning");
export const ArrowDown = createIcon("flat-color-icons:down");
export const ArrowLeft = createIcon("flat-color-icons:left");
export const ArrowRight = createIcon("flat-color-icons:right");
export const ArrowRightLeft = createIcon("flat-color-icons:neutral-trading");
export const AudioLines = createIcon("flat-color-icons:audio-file");
export const Award = createIcon("flat-color-icons:vip");
export const BadgeCheck = createIcon("flat-color-icons:approval");
export const BarChart = createIcon("flat-color-icons:bar-chart");
export const BarChart2 = createIcon("flat-color-icons:combo-chart");
export const BatteryMedium = createIcon("flat-color-icons:charge-battery");
export const Bell = createIcon("flat-color-icons:alarm-clock");
export const BellOff = createIcon("flat-color-icons:close-up-mode");
export const BellRing = createIcon("flat-color-icons:alarm-clock");
export const Book = createIcon("flat-color-icons:reading-ebook");
export const BookMarked = createIcon("flat-color-icons:bookmark");
export const BookOpen = createIcon("flat-color-icons:reading");
export const BookOpenCheck = createIcon("flat-color-icons:survey");
export const BookText = createIcon("flat-color-icons:document");
export const Bookmark = createIcon("flat-color-icons:bookmark");
export const BookmarkCheck = createIcon("flat-color-icons:rules");
export const BookmarkPlus = createIcon("flat-color-icons:plus");
export const Brain = createIcon("flat-color-icons:mind-map");
export const BrainCircuit = createIcon("flat-color-icons:workflow");
export const Briefcase = createIcon("flat-color-icons:briefcase");
export const Calendar = createIcon("flat-color-icons:calendar");
export const Check = createIcon("flat-color-icons:checkmark");
export const CheckCircle = createIcon("flat-color-icons:ok");
export const CheckCircle2 = createIcon("flat-color-icons:ok");
export const ChevronDown = createIcon("flat-color-icons:down-left");
export const ChevronLeft = createIcon("flat-color-icons:left");
export const ChevronRight = createIcon("flat-color-icons:right");
export const ChevronUp = createIcon("flat-color-icons:up-right");
export const ChevronsLeft = createIcon("flat-color-icons:previous");
export const ChevronsRight = createIcon("flat-color-icons:next");
export const Circle = createIcon("flat-color-icons:answers");
export const CircleHelp = createIcon("flat-color-icons:faq");
export const Clipboard = createIcon("flat-color-icons:filing-cabinet");
export const ClipboardCheck = createIcon("flat-color-icons:survey");
export const ClipboardList = createIcon("flat-color-icons:todo-list");
export const ClipboardPenLine = createIcon("flat-color-icons:feedback");
export const Clock = createIcon("flat-color-icons:clock");
export const Cloud = createIcon("flat-color-icons:folder");
export const CloudLightning = createIcon("flat-color-icons:flash-on");
export const CloudOff = createIcon("flat-color-icons:dislike");
export const CloudUpload = createIcon("flat-color-icons:upload");
export const Coffee = createIcon("solar:cup-bold");
export const Command = createIcon("flat-color-icons:template");
export const Compass = createIcon("solar:compass-bold");
export const CornerDownLeft = createIcon("flat-color-icons:undo");
export const Crown = createIcon("solar:crown-bold");
export const Database = createIcon("flat-color-icons:database");
export const Download = createIcon("flat-color-icons:download");
export const Edit = createIcon("flat-color-icons:document");
export const Edit2 = createIcon("flat-color-icons:signature");
export const ExternalLink = createIcon("flat-color-icons:opened-folder");
export const Eye = createIcon("flat-color-icons:view-details");
export const EyeOff = createIcon("line-md:watch-off-loop");
export const FileIcon = createIcon("flat-color-icons:file");
export const FileText = createIcon("flat-color-icons:document");
export const Filter = createIcon("flat-color-icons:fine-print");
export const Flag = createIcon("flat-color-icons:fine-print");
export const Flame = createIcon("solar:fire-bold");
export const Gamepad2 = createIcon("flat-color-icons:sports-mode");
export const Gauge = createIcon("flat-color-icons:sales-performance");
export const GitCompare = createIcon("flat-color-icons:serial-tasks");
export const Github = createIcon("logos:github-icon");
export const Globe = createIcon("flat-color-icons:globe");
export const GraduationCap = createIcon("flat-color-icons:diploma-1");
export const Grid3X3 = createIcon("flat-color-icons:grid");
export const Hash = createIcon("flat-color-icons:genealogy");
export const Headphones = createIcon("solar:headphones-round-sound-bold");
export const Heart = createIcon("flat-color-icons:like");
export const HelpCircle = createIcon("flat-color-icons:support");
export const Home = createIcon("flat-color-icons:home");
export const Hourglass = createIcon("flat-color-icons:clock");
export const Info = createIcon("flat-color-icons:info");
export const Instagram = createIcon("logos:instagram-icon");
export const Kanban = createIcon("flat-color-icons:template");
export const KeyRound = createIcon("flat-color-icons:key");
export const Keyboard = createIcon("flat-color-icons:answers");
export const Languages = createIcon("flat-color-icons:alphabetical-sorting-az");
export const Layers = createIcon("flat-color-icons:stack-of-photos");
export const LayoutDashboard = createIcon("flat-color-icons:template");
export const LayoutGrid = createIcon("flat-color-icons:grid");
export const LayoutList = createIcon("flat-color-icons:list");
export const Library = createIcon("flat-color-icons:library");
export const Lightbulb = createIcon("flat-color-icons:idea");
export const LineChart = createIcon("flat-color-icons:line-chart");
export const Link = createIcon("flat-color-icons:link");
export const List = createIcon("flat-color-icons:list");
export const ListChecks = createIcon("flat-color-icons:todo-list");
export const Loader2 = createIcon("line-md:loading-twotone-loop");
export const Lock = createIcon("flat-color-icons:lock");
export const LogIn = createIcon("flat-color-icons:internal");
export const LogOut = createIcon("flat-color-icons:external");
export const Mail = createIcon("flat-color-icons:sms");
export const MapPin = createIcon("solar:map-point-bold");
export const MapPinOff = createIcon("flat-color-icons:like");
export const Maximize2 = createIcon("flat-color-icons:expand");
export const Medal = createIcon("solar:medal-star-bold");
export const Menu = createIcon("flat-color-icons:list");
export const MessageCircle = createIcon("flat-color-icons:comments");
export const MessageSquare = createIcon("flat-color-icons:sms");
export const MessageSquarePlus = createIcon("flat-color-icons:comments");
export const MessageSquareText = createIcon("flat-color-icons:feedback");
export const Mic = createIcon("flat-color-icons:voice-presentation");
export const MicOff = createIcon("flat-color-icons:voice-presentation");
export const Minimize2 = createIcon("flat-color-icons:collapse");
export const Monitor = createIcon("solar:monitor-bold");
export const Moon = createIcon("flat-color-icons:night-portrait");
export const MousePointer2 = createIcon("flat-color-icons:cursor");
export const Pause = createIcon("solar:pause-bold");
export const PenLine = createIcon("flat-color-icons:signature");
export const PenTool = createIcon("flat-color-icons:signature");
export const Plane = createIcon("flat-color-icons:shipped");
export const Play = createIcon("solar:play-bold");
export const PlayCircle = createIcon("solar:play-circle-bold");
export const Plus = createIcon("flat-color-icons:plus");
export const Puzzle = createIcon("flat-color-icons:positive-dynamic");
export const Radio = createIcon("flat-color-icons:voice-presentation");
export const RefreshCcw = createIcon("flat-color-icons:synchronize");
export const RefreshCw = createIcon("flat-color-icons:synchronize");
export const Repeat2 = createIcon("flat-color-icons:synchronize");
export const RotateCcw = createIcon("flat-color-icons:rotate-to-landscape");
export const RotateCw = createIcon("flat-color-icons:rotate-to-portrait");
export const Save = createIcon("flat-color-icons:filing-cabinet");
export const ScanText = createIcon("flat-color-icons:fine-print");
export const Search = createIcon("flat-color-icons:search");
export const Send = createIcon("solar:plain-bold");
export const Server = createIcon("flat-color-icons:database");
export const Settings = createIcon("flat-color-icons:settings");
export const Settings2 = createIcon("flat-color-icons:services");
export const Share2 = createIcon("flat-color-icons:share");
export const Shield = createIcon("flat-color-icons:privacy");
export const ShieldAlert = createIcon("flat-color-icons:privacy");
export const ShieldCheck = createIcon("flat-color-icons:safe");
export const Shuffle = createIcon("flat-color-icons:neutral-trading");
export const Skull = createIcon("flat-color-icons:bad-decision");
export const Sliders = createIcon("flat-color-icons:services");
export const SlidersHorizontal = createIcon("flat-color-icons:services");
export const Sparkles = createIcon("flat-color-icons:flash-on");
export const Sprout = createIcon("flat-color-icons:leave");
export const Square = createIcon("flat-color-icons:answers");
export const Star = createIcon("flat-color-icons:rating");
export const Sun = createIcon("solar:sun-bold");
export const Swords = createIcon("solar:swords-bold");
export const Target = createIcon("flat-color-icons:bullish");
export const Timer = createIcon("flat-color-icons:alarm-clock");
export const TimerReset = createIcon("flat-color-icons:alarm-clock");
export const Trash2 = createIcon("flat-color-icons:delete-database");
export const TrendingUp = createIcon("flat-color-icons:bullish");
export const Trophy = createIcon("solar:cup-first-bold");
export const Tv = createIcon("flat-color-icons:display");
export const Type = createIcon("flat-color-icons:alphabetical-sorting-az");
export const Upload = createIcon("flat-color-icons:upload");
export const User = createIcon("flat-color-icons:businessman");
export const UserCircle = createIcon("flat-color-icons:portrait-mode");
export const Users = createIcon("flat-color-icons:conference-call");
export const Volume2 = createIcon("flat-color-icons:speaker");
export const VolumeX = createIcon("solar:volume-cross-bold");
export const Wand2 = createIcon("flat-color-icons:flash-on");
export const Waves = createIcon("flat-color-icons:neutral-trading");
export const WifiOff = createIcon("flat-color-icons:flash-off");
export const Wrench = createIcon("flat-color-icons:settings");
export const X = createIcon("flat-color-icons:cancel");
export const XCircle = createIcon("flat-color-icons:cancel");
export const Zap = createIcon("flat-color-icons:flash-on");
export const ZoomIn = createIcon("flat-color-icons:zoom-in");
