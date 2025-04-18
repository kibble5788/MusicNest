export interface Song {
  id: string
  title: string
  artist: string
  album?: string
  cover?: string
  url: string
  duration: number
  source?: "qq" | "netease" | "audiobook"
}
