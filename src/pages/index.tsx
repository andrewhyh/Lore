import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-4">Lore — Home (Pages Router)</h1>
      <p className="mb-6 text-gray-600">Quick links to scaffolded pages:</p>

      <ul className="space-y-2">
        <li>
          <Link href="/timeline" className="text-blue-600">Timeline</Link>
        </li>
        <li>
          <Link href="/story/1" className="text-blue-600">Story (id=1)</Link>
        </li>
        <li>
          <Link href="/profile/1" className="text-blue-600">Profile (id=1)</Link>
        </li>
        <li>
          <Link href="/community/1" className="text-blue-600">Community (id=1)</Link>
        </li>
      </ul>
    </div>
  )
}
