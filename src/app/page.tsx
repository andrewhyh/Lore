import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        <section className="bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">Welcome to Lore</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Family and community archiving made effortless — collect stories, preserve memories, and share across generations.</p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <a href="#" className="rounded-md bg-blue-600 text-white px-5 py-2 text-sm font-medium hover:bg-blue-700">Get started</a>
              <a href="#" className="rounded-md border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-5 py-2 text-sm">Learn more</a>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-semibold mb-4">Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Stories</h3>
              <p className="text-sm text-gray-600">Capture oral histories and written memories with easy tools.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Collections</h3>
              <p className="text-sm text-gray-600">Organize photos and documents into searchable collections.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Sharing</h3>
              <p className="text-sm text-gray-600">Share memories with family and control access easily.</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
