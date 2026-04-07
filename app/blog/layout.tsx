import Link from 'next/link';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Public blog header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🧁</span>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              DGcost
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            <Link href="/blog" className="hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors">
              Blog
            </Link>
            <Link href="/" className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              Inicio
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} DGcost · Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
}
