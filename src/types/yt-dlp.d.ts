/* eslint-disable @typescript-eslint/ban-types */
export type YtDLPInfo = {
  id: string
  title: string
  formats: Format[]
  thumbnails: Thumbnail[]
  thumbnail: string
  description: string
  uploader: string
  uploader_id: string
  uploader_url: string
  channel_id: string
  channel_url: string
  duration: number
  view_count: number
  age_limit: number
  webpage_url: string
  categories: string[]
  tags: string[]
  playable_in_embed: boolean
  live_status: string
  automatic_captions: AutomaticCaptions
  subtitles: AutomaticCaptions
  like_count: number
  channel: string
  channel_follower_count: number
  upload_date: string
  availability: string
  webpage_url_basename: string
  webpage_url_domain: string
  extractor: string
  extractor_key: string
  display_id: string
  fulltitle: string
  duration_string: string
  is_live: boolean
  was_live: boolean
  format: string
  format_id: string
  ext: EXT
  protocol: string
  format_note: string
  filesize_approx: number
  tbr: number
  width: number
  height: number
  resolution: string
  fps: number
  dynamic_range: DynamicRange
  vcodec: string
  vbr: number
  aspect_ratio: number
  acodec: Acodec
  abr: number
  asr: number
  audio_channels: number
  epoch: number
  _type: string
  _version: Version
}

export type Version = {
  version: string
  release_git_head: string
  repository: string
}

export type Acodec = "none" | "mp4a.40.5" | "opus" | "mp4a.40.2"

export type AutomaticCaptions = {}

export type DynamicRange = "SDR"

export type EXT = "mhtml" | "m4a" | "webm" | "3gp" | "mp4" | "none"

export type Format = {
  format_id: string
  format_note: string
  ext: EXT
  protocol: Protocol
  acodec: Acodec
  vcodec: string
  url: string
  width?: number
  height?: number
  fps?: number
  rows?: number
  columns?: number
  fragments?: Fragment[]
  resolution: string
  aspect_ratio?: number
  http_headers: HTTPHeaders
  audio_ext: EXT
  video_ext: EXT
  format: string
  asr?: number
  filesize?: number
  source_preference?: number
  audio_channels?: number
  quality?: number
  has_drm?: boolean
  tbr?: number
  language_preference?: number
  abr?: number
  container?: Container
  preference?: number
  dynamic_range?: DynamicRange
  vbr?: number
  filesize_approx?: number
}

export type Container = "m4a_dash" | "webm_dash" | "mp4_dash"

export type Fragment = {
  url: string
  duration?: number
}

export type HTTPHeaders = {
  "User-Agent": string
  Accept: Accept
  "Accept-Language": AcceptLanguage
  "Sec-Fetch-Mode": SECFetchMode
}

export type Accept = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"

export type AcceptLanguage = "en-us,en;q=0.5"

export type SECFetchMode = "navigate"

export type Protocol = "mhtml" | "http_dash_segments" | "https"

export type Thumbnail = {
  url: string
  preference: number
  id: string
  height?: number
  width?: number
  resolution?: string
}

export type DownloadProgress = {
  filename: string
  status: string
  total_bytes: number
  speed: number | null
  _speed_str: string
  _total_bytes_str: string
  _elapsed_str: string
  _percent_str: string
  _default_template: string
  downloaded_bytes?: number
  tmpfilename?: string
  eta?: number
  elapsed?: number
  ctx_id?: null
  _eta_str?: string
  _total_bytes_estimate_str?: string
  _downloaded_bytes_str?: string
}
