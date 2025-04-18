"use client"

import { useState } from "react"
import AudiobooksList from "@/components/audiobooks-list"
import AudiobookPlayer from "@/components/audiobook-player"
import type { Audiobook } from "@/types/audiobook"

export default function AudiobooksPage() {
  const [selectedBook, setSelectedBook] = useState<Audiobook | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | undefined>(undefined)
  const [hideNavigation, setHideNavigation] = useState(false)

  const handleSelectAudiobook = (book: Audiobook) => {
    setSelectedBook(book)
    setSelectedChapterId(undefined)
  }

  const handleBackFromPlayer = () => {
    setSelectedBook(null)
    setSelectedChapterId(undefined)
  }

  return (
    <div className="min-h-screen">
      {selectedBook ? (
        <AudiobookPlayer
          bookId={selectedBook.id}
          chapterId={selectedChapterId}
          onBack={handleBackFromPlayer}
          setHideNavigation={setHideNavigation}
        />
      ) : (
        <div className="p-4">
          <AudiobooksList setHideNavigation={setHideNavigation} onSelectAudiobook={handleSelectAudiobook} />
        </div>
      )}
    </div>
  )
}
