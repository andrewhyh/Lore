import Link from 'next/link'

export default function Header(): JSX.Element {
  return (
    <header className="bg-white/60 dark:bg-black/50 backdrop-blur sticky top-0 z-40 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold text-lg">Lore</Link>
          <span className="text-xs text-gray-500 hidden sm:inline">Family & community archiving</span>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/about" className="text-sm text-gray-700 dark:text-gray-300">About</Link>
          <Link href="/timeline" className="text-sm text-gray-700 dark:text-gray-300">Timeline</Link>
          <Link href="/login" className="text-sm text-gray-700 dark:text-gray-300">Sign in</Link>
        </nav>
      </div>
    </header>
  )
}
