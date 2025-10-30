export default function Footer(): JSX.Element {
  return (
    <footer className="mt-12 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center justify-between">
          <span>© {new Date().getFullYear()} Lore</span>
          <nav className="space-x-4">
            <a href="/privacy" className="text-gray-600 dark:text-gray-300">Privacy</a>
            <a href="/terms" className="text-gray-600 dark:text-gray-300">Terms</a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
