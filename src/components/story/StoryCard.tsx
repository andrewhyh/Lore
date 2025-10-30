export default function StoryCard(props: any) {
  const { title = 'Untitled Story', excerpt = 'No excerpt yet' } = props
  return (
    <article className="p-4 border rounded-lg shadow-sm bg-white dark:bg-gray-900">
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{excerpt}</p>
    </article>
  )
}
