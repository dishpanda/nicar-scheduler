export type Workshop = {
  session_id: number;
  session_title: string;
  canceled: boolean | string;
  description: string;
  session_type: string;
  track: string;
  start_time: string | Date;
  end_time: string | Date;
  duration_mins: number;
  duration_formatted: string;
  skill_level: string;
  speakers: Speaker[];
  room: Room | null;
  day: string;
  session_type_display?: string;
  cost?: string;
  recorded?: boolean;
  multi_day?: Session[];
};

export type Session = {
  start_time: string | Date;
  end_time: string | Date;
  duration_mins: number;
};

export type Room = {
  level?: string | number;
  room_name: string;
  recorded?: boolean;
  os?: string;
};

export type Speaker = {
  first: string;
  last: string;
  affiliation: string;
  bio?: string;
  social?: Link[];
};

export type Link = {
  label: string;
  url: string;
};

export type Nicar2026ApiResponse = {
  name: string;
  slug: string;
  start_date: string;
  end_date: string;
  sessions: Nicar2026Session[];
  speakers: Nicar2026Speaker[];
  rooms: Record<string, { level?: number; os?: string }>;
};

export type Nicar2026Session = {
  session_id: number;
  session_title: string;
  canceled: boolean;
  description: string;
  session_type: string;
  start_time: string;
  end_time: string;
  recorded: boolean;
  skill_level: string;
  speakers: string[];
  room: string;
  tracks: string[];
  sponsored_by?: string;
  cost?: string;
};

export type Nicar2026Speaker = {
  id: string;
  first_name: string;
  last_name: string;
  affiliation: string;
  headshot?: string;
  bio?: string;
  social?: Link[];
};
