export default function ProfileCard(props: any) {
  const { name = 'Person' } = props
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-600">Short bio</div>
        </div>
      </div>
    </div>
  )
}
