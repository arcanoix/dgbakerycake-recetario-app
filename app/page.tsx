import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">
          🍰 DG Bakery Cake
        </h1>
        <p className="text-center text-lg text-muted-foreground mb-12">
          Sistema de Gestión de Costos de Recetas
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>📦 Productos</CardTitle>
              <CardDescription>
                Gestiona tus insumos y materiales con diferentes unidades de medida
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/productos">
                <Button className="w-full">Ver Productos</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>📝 Recetas</CardTitle>
              <CardDescription>
                Crea recetas y calcula costos automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/recetas">
                <Button className="w-full">Ver Recetas</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>⚙️ Configuración</CardTitle>
              <CardDescription>
                Configura costos de mano de obra y preferencias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/configuracion">
                <Button className="w-full" variant="outline">Configurar</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
