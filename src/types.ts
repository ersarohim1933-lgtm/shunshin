export interface ServerInfo {
  ip: string;
  portJava: number;
  portBedrock: number;
  version: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'online' | 'offline' | 'maintenance';
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface JoinStep {
  step: number;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface ServerRule {
  id: string;
  title: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}
