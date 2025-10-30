export default function CommunityCard(props: any) {
  const { name = 'Community' } = props
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-gray-600">Community card placeholder</p>
    </div>
  )
}
