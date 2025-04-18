import { User } from "lucide-react"

export function MessageCenterFooter() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 safe-area-bottom">
      <div className="mx-auto max-w-md px-4 pb-2">
        <div className="flex items-center justify-around bg-black/80 backdrop-blur-md rounded-full p-3 shadow-lg">
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img src="/cosmic-jewel.png" alt="Planet" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500">
              <img src="/profile-avatar.png" alt="User" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
                2
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
