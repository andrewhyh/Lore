import { useRouter } from 'next/router'

export default function CommunityPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">Community {id}</h1>
      <p className="text-gray-600">Community page scaffolded from UI design.</p>
    </div>
  )
}
