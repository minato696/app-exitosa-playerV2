export interface RadioStation {
  id: string;
  name: string;
  url: string;
  isMain?: boolean;
}

export interface Program {
  id: string;
  title: string;
  description: string;
  host: string;
  time: string;
  image: string;
}
