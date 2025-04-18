export interface Author {
  id: string
  name: string
  avatar?: string
  description?: string
}

export interface Category {
  id: string
  name: string
}

export interface Chapter {
  id: string
  title: string
  duration: number
  url: string
  order: number
  isLocked?: boolean
}

export interface Audiobook {
  id: string
  title: string
  cover: string
  description: string
  author: Author
  narrator: string
  duration: number
  totalChapters: number
  completedChapters?: number
  rating: number
  ratingCount: number
  categories: Category[]
  isFree: boolean
  isVIP: boolean
  isNew?: boolean
  isHot?: boolean
  isRecommended?: boolean
  publishDate: string
  progress?: number
  lastListenedChapter?: number
  chapters?: Chapter[]
}

export interface AudiobookListResponse {
  books: Audiobook[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface AudiobookDetailResponse {
  book: Audiobook
  relatedBooks: Audiobook[]
}

export interface AudiobookPlayProgress {
  bookId: string
  chapterId: string
  progress: number
  timestamp: number
}
