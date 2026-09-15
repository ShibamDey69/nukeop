export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  artwork?: string;
}

export interface Playlist {
  id: string;
  title: string;
  creator: string;
  trackCount: number;
  color: string;
}

export const MOCK_TRACKS: Track[] = [
  { id: 't1', title: 'Neon Velocity', artist: 'Synthwave Rider', album: 'Night Drive', duration: '3:45' },
  { id: 't2', title: 'Cybernetic Heart', artist: 'Glitch Mob', album: 'Future Past', duration: '4:12' },
  { id: 't3', title: 'Acid Rain', artist: 'Lorn', album: 'Vessel', duration: '2:59' },
  { id: 't4', title: 'Digital Mirage', artist: 'Chrome Sparks', album: 'Sparks EP', duration: '5:01' },
  { id: 't5', title: 'Concrete Jungle', artist: 'Urban Outlaw', album: 'City Limits', duration: '3:22' },
  { id: 't6', title: 'Holographic', artist: 'Vapor Wave', album: 'Aesthetics', duration: '4:40' },
];

export const MOCK_PLAYLISTS: Playlist[] = [
  { id: 'p1', title: 'Heavy Focus', creator: 'System', trackCount: 24, color: '#FF5C8A' },
  { id: 'p2', title: 'Brutal Workouts', creator: 'User123', trackCount: 45, color: '#FFE600' },
  { id: 'p3', title: 'Late Night Coding', creator: 'Dev', trackCount: 12, color: '#38E54D' },
  { id: 'p4', title: 'Daily Mix 1', creator: 'System', trackCount: 30, color: '#2192FF' },
];

export const MOCK_RECENT_SEARCHES = [
  'Synthwave',
  'Cyberpunk OST',
  'Lofi Hip Hop',
  'Industrial Techno'
];
