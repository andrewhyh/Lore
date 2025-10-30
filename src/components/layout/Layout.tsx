export default function Layout(props: any) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-gray-900 dark:text-white">
      {props.children}
    </div>
  )
}
