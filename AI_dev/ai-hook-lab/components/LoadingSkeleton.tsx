export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="w-16 h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="w-12 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
          </div>
          <div className="h-3 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}
