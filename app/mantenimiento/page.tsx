import { Wrench, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = {
  title: 'Mantenimiento | DG Cost',
  description: 'El sistema está en mantenimiento. Volveremos pronto.',
};

export default function MantenimientoPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 bg-amber-100 dark:bg-amber-900/30 rounded-full animate-pulse" />
          <div className="relative w-24 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center border-2 border-amber-200 dark:border-amber-800">
            <Wrench className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            En Mantenimiento
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg font-medium leading-relaxed">
            Estamos realizando mejoras en el sistema para brindarte una mejor experiencia.
          </p>
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 font-semibold">
            <Clock className="w-5 h-5" />
            <span>Volveremos pronto</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/auth/login">
              <ArrowLeft className="w-4 h-4" />
              Volver al login
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-400 dark:text-slate-600">
          Si necesitas acceso urgente, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
}
