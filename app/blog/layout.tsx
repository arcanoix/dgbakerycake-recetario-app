import Link from 'next/link';
import { ChefHat } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Public blog header */}
      <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground group-hover:rotate-12 transition-transform duration-300">
               <ChefHat className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase text-foreground">
              DGcost
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <Link href="/blog" className="hover:text-primary transition-colors">
              BLOG
            </Link>
            <Link href="/" className="hover:text-primary transition-colors">
              INICIO
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      <footer className="py-12 bg-background border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            <p>© {new Date().getFullYear()} DGCOST. DGBakeryCake Solutions.</p>
            <p>Pasión por la Repostería Digital</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
