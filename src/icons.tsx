import React from "react";
import Svg, { Line, Circle, Path, Polyline, Polygon, Rect } from "react-native-svg";

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const DEFAULT_COLOR = "#111111";

function stroked(defaultSize: number, render: (color: string) => React.ReactNode) {
  return function Icon({ size = defaultSize, color = DEFAULT_COLOR, strokeWidth = 2 }: IconProps) {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {render(color)}
      </Svg>
    );
  };
}

/** Solid icons keep a same-coloured stroke so their corners come out softly rounded. */
function solid(defaultSize: number, render: (color: string) => React.ReactNode) {
  return function Icon({ size = defaultSize, color = DEFAULT_COLOR }: IconProps) {
    return (
      <Svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={color}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {render(color)}
      </Svg>
    );
  };
}

export const MenuIcon = stroked(20, () => (
  <>
    <Line x1="3" y1="6" x2="21" y2="6" />
    <Line x1="3" y1="12" x2="21" y2="12" />
    <Line x1="3" y1="18" x2="21" y2="18" />
  </>
));

export const QueueIcon = stroked(20, () => (
  <>
    <Line x1="3" y1="6" x2="15" y2="6" />
    <Line x1="3" y1="12" x2="15" y2="12" />
    <Line x1="3" y1="18" x2="10" y2="18" />
    <Polyline points="18,14 22,17.5 18,21" />
    <Line x1="22" y1="17.5" x2="22" y2="8" />
  </>
));

export const TrashIcon = stroked(20, () => (
  <>
    <Polyline points="3,6 5,6 21,6" />
    <Path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <Line x1="10" y1="11" x2="10" y2="17" />
    <Line x1="14" y1="11" x2="14" y2="17" />
    <Path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </>
));

export const ScanIcon = stroked(20, () => (
  <>
    <Path d="M3 7V4a1 1 0 011-1h3" />
    <Path d="M17 3h3a1 1 0 011 1v3" />
    <Path d="M21 17v3a1 1 0 01-1 1h-3" />
    <Path d="M7 21H4a1 1 0 01-1-1v-3" />
    <Circle cx="12" cy="12" r="4" />
  </>
));

export const FolderIcon = stroked(20, () => (
  <Path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
));

export const SearchIcon = stroked(20, () => (
  <>
    <Circle cx="11" cy="11" r="8" />
    <Line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>
));

export const HomeIcon = stroked(22, () => (
  <>
    <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <Polyline points="9 22 9 12 15 12 15 22" />
  </>
));

export const LibraryIcon = stroked(22, () => (
  <>
    <Path d="M9 18V5l12-2v13" />
    <Circle cx="6" cy="18" r="3" />
    <Circle cx="18" cy="16" r="3" />
  </>
));

export const PluginsIcon = stroked(22, () => (
  <>
    <Path d="M16.5 9.4L7.5 4.21" />
    <Path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <Polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <Line x1="12" y1="22.08" x2="12" y2="12" />
  </>
));

export const ArrowUpRightIcon = stroked(16, () => (
  <>
    <Line x1="7" y1="17" x2="17" y2="7" />
    <Polyline points="7 7 17 7 17 17" />
  </>
));

export const ArrowRightIcon = stroked(16, () => (
  <>
    <Line x1="5" y1="12" x2="19" y2="12" />
    <Polyline points="12 5 19 12 12 19" />
  </>
));

export const ChevronRightIcon = stroked(16, () => <Polyline points="9 18 15 12 9 6" />);
export const ChevronLeftIcon = stroked(20, () => <Polyline points="15 18 9 12 15 6" />);
export const ChevronDownIcon = stroked(20, () => <Polyline points="6 9 12 15 18 9" />);
export const ChevronUpIcon = stroked(20, () => <Polyline points="18 15 12 9 6 15" />);

export const BackIcon = stroked(20, () => (
  <>
    <Line x1="19" y1="12" x2="5" y2="12" />
    <Polyline points="12 19 5 12 12 5" />
  </>
));

export const PlayIcon = solid(24, () => <Polygon points="6 4 19 12 6 20 6 4" />);

export const PauseIcon = solid(24, () => (
  <>
    <Rect x="6" y="4.5" width="4" height="15" rx="1" />
    <Rect x="14" y="4.5" width="4" height="15" rx="1" />
  </>
));

export const SkipBackIcon = solid(20, () => (
  <>
    <Polygon points="19 19 8 12 19 5 19 19" />
    <Line x1="5" y1="19" x2="5" y2="5" />
  </>
));

export const SkipForwardIcon = solid(20, () => (
  <>
    <Polygon points="5 5 16 12 5 19 5 5" />
    <Line x1="19" y1="5" x2="19" y2="19" />
  </>
));

export const ShuffleIcon = stroked(18, () => (
  <>
    <Polyline points="16 3 21 3 21 8" />
    <Line x1="4" y1="20" x2="21" y2="3" />
    <Polyline points="21 16 21 21 16 21" />
    <Line x1="15" y1="15" x2="21" y2="21" />
    <Line x1="4" y1="4" x2="9" y2="9" />
  </>
));

export const RepeatIcon = stroked(18, () => (
  <>
    <Polyline points="17 1 21 5 17 9" />
    <Path d="M3 11V9a4 4 0 014-4h14" />
    <Polyline points="7 23 3 19 7 15" />
    <Path d="M21 13v2a4 4 0 01-4 4H3" />
  </>
));

export const RepeatOneIcon = stroked(18, () => (
  <>
    <Polyline points="17 1 21 5 17 9" />
    <Path d="M3 11V9a4 4 0 014-4h14" />
    <Polyline points="7 23 3 19 7 15" />
    <Path d="M21 13v2a4 4 0 01-4 4H3" />
    <Path d="M11 10h1.5v4.5" />
  </>
));

export const ArtistsIcon = stroked(22, () => (
  <>
    <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <Circle cx="9" cy="7" r="4" />
    <Path d="M23 21v-2a4 4 0 00-3-3.87" />
    <Path d="M16 3.13a4 4 0 010 7.75" />
  </>
));

export const UserIcon = stroked(20, () => (
  <>
    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <Circle cx="12" cy="7" r="4" />
  </>
));

export const AlbumsIcon = stroked(22, () => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Circle cx="12" cy="12" r="3" />
  </>
));

export const PlaylistIcon = stroked(22, () => (
  <>
    <Line x1="8" y1="6" x2="21" y2="6" />
    <Line x1="8" y1="12" x2="21" y2="12" />
    <Line x1="8" y1="18" x2="21" y2="18" />
    <Line x1="3" y1="6" x2="3.01" y2="6" />
    <Line x1="3" y1="12" x2="3.01" y2="12" />
    <Line x1="3" y1="18" x2="3.01" y2="18" />
  </>
));

export const GearIcon = stroked(20, () => (
  <>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </>
));

export const PreferencesIcon = GearIcon;

export const WhatsNewIcon = stroked(20, () => (
  <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
));

export const LogsIcon = stroked(20, () => (
  <>
    <Polyline points="4 17 10 11 4 5" />
    <Line x1="12" y1="19" x2="20" y2="19" />
  </>
));

export function HeartIcon({
  size = 20,
  color = DEFAULT_COLOR,
  strokeWidth = 2,
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
  );
}

export function MoreVertIcon({ size = 20, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Circle cx="12" cy="5" r="1.7" />
      <Circle cx="12" cy="12" r="1.7" />
      <Circle cx="12" cy="19" r="1.7" />
    </Svg>
  );
}

export function MoreHorizontalIcon({ size = 20, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Circle cx="5" cy="12" r="1.7" />
      <Circle cx="12" cy="12" r="1.7" />
      <Circle cx="19" cy="12" r="1.7" />
    </Svg>
  );
}

export const CloseIcon = stroked(20, () => (
  <>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </>
));

export const CheckIcon = stroked(18, () => <Polyline points="20 6 9 17 4 12" />);

export const ShareIcon = stroked(18, () => (
  <>
    <Circle cx="18" cy="5" r="3" />
    <Circle cx="6" cy="12" r="3" />
    <Circle cx="18" cy="19" r="3" />
    <Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
));

export const PlusIcon = stroked(20, () => (
  <>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </>
));

export const PlusCircleIcon = stroked(18, () => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="8" x2="12" y2="16" />
    <Line x1="8" y1="12" x2="16" y2="12" />
  </>
));

export const ListPlusIcon = stroked(18, () => (
  <>
    <Path d="M11 12H3" />
    <Path d="M16 6H3" />
    <Path d="M16 18H3" />
    <Path d="M18 9v6" />
    <Path d="M21 12h-6" />
  </>
));

export const MusicNoteIcon = stroked(24, () => (
  <>
    <Circle cx="8" cy="18" r="4" />
    <Path d="M12 18V2l7 4" />
  </>
));

export const PencilIcon = stroked(18, () => <Path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />);

export const MoonIcon = stroked(20, () => <Path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />);

export const GaugeIcon = stroked(20, () => (
  <>
    <Path d="M12 14l4-4" />
    <Path d="M3.34 19a10 10 0 1117.32 0" />
  </>
));

export const LyricsIcon = stroked(20, () => (
  <>
    <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    <Line x1="8" y1="8" x2="16" y2="8" />
    <Line x1="8" y1="12" x2="13" y2="12" />
  </>
));

export const ClockIcon = stroked(18, () => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Polyline points="12 6 12 12 16 14" />
  </>
));

export const RefreshIcon = stroked(18, () => (
  <>
    <Polyline points="23 4 23 10 17 10" />
    <Polyline points="1 20 1 14 7 14" />
    <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </>
));

export const YouTubeIcon = stroked(20, (color) => (
  <>
    <Rect x="2.5" y="5" width="19" height="14" rx="0" />
    <Polygon points="10 8.5 16 12 10 15.5" fill={color} stroke="none" />
  </>
));

export const InfoIcon = stroked(18, () => (
  <>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="12" y1="16" x2="12" y2="12" />
    <Line x1="12" y1="8" x2="12.01" y2="8" />
  </>
));

export const EqualizerIcon = solid(16, () => (
  <>
    <Rect x="4" y="10" width="3.5" height="9" rx="1" />
    <Rect x="10.25" y="4" width="3.5" height="15" rx="1" />
    <Rect x="16.5" y="13" width="3.5" height="6" rx="1" />
  </>
));
