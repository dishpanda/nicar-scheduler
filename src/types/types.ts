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
  evergreen: boolean | string;
  cost: number | string;
  prereg_link: string;
  sponsor: string;
  recorded: boolean;
  audio_recording_link: string;
  skill_level: string;
  speakers: Speaker[];
  tipsheets: Link[];
  room: Room;
  day: string;
};

type Room = {
  level: string;
  recorded: boolean;
  room_name: string;
};

type Speaker = {
  first: string;
  last: string;
  affiliation: string;
  bio: string;
  social: Link[];
};

type Link = {
  label: string;
  url: string;
};
