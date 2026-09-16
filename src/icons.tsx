import Svg, { Line, Circle, Path, Polyline, Polygon, Rect } from "react-native-svg";

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const base = (size: number, color: string, strokeWidth = 2) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function MenuIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="3" y1="6" x2="21" y2="6" />
      <Line x1="3" y1="12" x2="21" y2="12" />
      <Line x1="3" y1="18" x2="21" y2="18" />
    </Svg>
  );
}

export function QueueIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="3" y1="6" x2="15" y2="6" />
      <Line x1="3" y1="12" x2="15" y2="12" />
      <Line x1="3" y1="18" x2="10" y2="18" />
      <Polyline points="18,14 22,17.5 18,21" />
      <Line x1="22" y1="17.5" x2="22" y2="8" />
    </Svg>
  );
}

export function DragHandleIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="4" y1="8" x2="20" y2="8" />
      <Line x1="4" y1="16" x2="20" y2="16" />
    </Svg>
  );
}

export function TrashIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="3,6 5,6 21,6" />
      <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </Svg>
  );
}

export function ScanIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Path d="M3 7V4a1 1 0 011-1h3" />
      <Path d="M17 3h3a1 1 0 011 1v3" />
      <Path d="M21 17v3a1 1 0 01-1 1h-3" />
      <Path d="M7 21H4a1 1 0 01-1-1v-3" />
      <Circle cx="12" cy="12" r="4" />
    </Svg>
  );
}

export function FolderIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function HomeIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

export function LibraryIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Path d="M9 18V5l12-2v13" />
      <Circle cx="6" cy="18" r="3" />
      <Circle cx="18" cy="16" r="3" />
    </Svg>
  );
}

export function PluginsIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z" />
      <Line x1="16" y1="8" x2="2" y2="22" />
      <Line x1="17.5" y1="15" x2="9" y2="15" />
    </Svg>
  );
}

export function ArrowUpRightIcon({ size = 16, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="7" y1="17" x2="17" y2="7" />
      <Polyline points="7 7 17 7 17 17" />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 16, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="5" y1="12" x2="19" y2="12" />
      <Polyline points="12 5 19 12 12 19" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 16, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

export function ChevronDownIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

export function ChevronUpIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="18 15 12 9 6 15" />
    </Svg>
  );
}

export function BackIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="19" y1="12" x2="5" y2="12" />
      <Polyline points="12 19 5 12 12 5" />
    </Svg>
  );
}

export function PlayIcon({ size = 24, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)} fill={color} stroke="none">
      <Polygon points="5 3 19 12 5 21 5 3" />
    </Svg>
  );
}

export function PauseIcon({ size = 24, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)} fill={color} stroke="none">
      <Rect x="6" y="4" width="4" height="16" />
      <Rect x="14" y="4" width="4" height="16" />
    </Svg>
  );
}

export function SkipBackIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)} fill={color} stroke="none">
      <Polygon points="19 20 9 12 19 4 19 20" />
      <Line x1="5" y1="19" x2="5" y2="5" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export function SkipForwardIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)} fill={color} stroke="none">
      <Polygon points="5 4 15 12 5 20 5 4" />
      <Line x1="19" y1="5" x2="19" y2="19" stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

export function ShuffleIcon({ size = 18, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="16 3 21 3 21 8" />
      <Line x1="4" y1="20" x2="21" y2="3" />
      <Polyline points="21 16 21 21 16 21" />
      <Line x1="15" y1="15" x2="21" y2="21" />
      <Line x1="4" y1="4" x2="9" y2="9" />
    </Svg>
  );
}

export function RepeatIcon({ size = 18, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="17 1 21 5 17 9" />
      <Path d="M3 11V9a4 4 0 014-4h14" />
      <Polyline points="7 23 3 19 7 15" />
      <Path d="M21 13v2a4 4 0 01-4 4H3" />
    </Svg>
  );
}

export function ArtistsIcon({ size = 22, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <Circle cx="9" cy="7" r="4" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87" />
      <Path d="M16 3.13a4 4 0 010 7.75" />
    </Svg>
  );
}

export function AlbumsIcon({ size = 22, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Circle cx="12" cy="12" r="10" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function PlaylistIcon({ size = 22, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="8" y1="6" x2="21" y2="6" />
      <Line x1="8" y1="12" x2="21" y2="12" />
      <Line x1="8" y1="18" x2="21" y2="18" />
      <Line x1="3" y1="6" x2="3.01" y2="6" />
      <Line x1="3" y1="12" x2="3.01" y2="12" />
      <Line x1="3" y1="18" x2="3.01" y2="18" />
    </Svg>
  );
}

export function PreferencesIcon({ size = 22, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
    </Svg>
  );
}

export function WhatsNewIcon({ size = 22, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  );
}

export function LogsIcon({ size = 22, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="4 17 10 11 4 5" />
      <Line x1="12" y1="19" x2="20" y2="19" />
    </Svg>
  );
}

export function GearIcon({ size = 18, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </Svg>
  );
}

export function HeartIcon({
  size = 20,
  color = "#111111",
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg {...base(size, color)} fill={filled ? color : "none"}>
      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
  );
}

export function MoreVertIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)} fill={color} stroke="none">
      <Circle cx="12" cy="5" r="1.5" />
      <Circle cx="12" cy="12" r="1.5" />
      <Circle cx="12" cy="19" r="1.5" />
    </Svg>
  );
}

export function CloseIcon({ size = 20, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Line x1="18" y1="6" x2="6" y2="18" />
      <Line x1="6" y1="6" x2="18" y2="18" />
    </Svg>
  );
}

export function CheckIcon({ size = 18, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

export function ShareIcon({ size = 18, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Circle cx="18" cy="5" r="3" />
      <Circle cx="6" cy="12" r="3" />
      <Circle cx="18" cy="19" r="3" />
      <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </Svg>
  );
}

export function PlusCircleIcon({ size = 18, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)}>
      <Circle cx="12" cy="12" r="10" />
      <Line x1="12" y1="8" x2="12" y2="16" />
      <Line x1="8" y1="12" x2="16" y2="12" />
    </Svg>
  );
}

export function EqualizerIcon({ size = 16, color = "#111111" }: IconProps) {
  return (
    <Svg {...base(size, color)} fill={color} stroke="none">
      <Rect x="4" y="10" width="3" height="8" />
      <Rect x="10.5" y="5" width="3" height="13" />
      <Rect x="17" y="13" width="3" height="5" />
    </Svg>
  );
}
