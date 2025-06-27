import { LoaderIcon } from "lucide-react"
import { useThemeStore } from "../store/useThemeStore"

function PageLoader() {
  const { theme } = useThemeStore()
  return (
    <div className="min-h-screen flex items-center justify-center" data-theme={theme}> 
      <LoaderIcon className="animate-spin text-primary" size={40} />
      <span className="text-primary font-semibold text-lg ml-2">Loading...</span>
    </div>
  )
}

export default PageLoader
