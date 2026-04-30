"use client";

import { useState } from "react";
import { useAI } from "@/hooks/useAI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Lightbulb,
  Shuffle,
  ChefHat,
  FileText,
  Loader2,
} from "lucide-react";

interface Material {
  nombre: string;
  cantidad: number;
  unidad: string;
  costo?: number;
}

interface InventarioItem {
  nombre: string;
  cantidad: number;
  unidad: string;
}

// ---------------------------------------------------------------------------
// Sub-component: Result display
// ---------------------------------------------------------------------------
const AIResultCard = ({
  result,
  onCopy,
  copied,
  onReset,
}: {
  result: string;
  onCopy: () => void;
  copied: boolean;
  onReset: () => void;
}) => (
  <div className="mt-4 rounded-xl border border-purple-200 bg-purple-50/60 p-4 space-y-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Resultado de IA
      </span>
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onCopy} className="h-7 px-2 text-purple-700">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span className="ml-1 text-xs">{copied ? "Copiado" : "Copiar"}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-purple-700">
          <RotateCcw className="w-3 h-3" />
          <span className="ml-1 text-xs">Nueva consulta</span>
        </Button>
      </div>
    </div>
    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{result}</p>
  </div>
);

// ---------------------------------------------------------------------------
// Tab: Generar descripción
// ---------------------------------------------------------------------------
const GenerarDescripcionTab = () => {
  const { loading, error, result, call, reset } = useAI();
  const [copied, setCopied] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ingredientes, setIngredientes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const materiales: Material[] = ingredientes
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ nombre: line, cantidad: 1, unidad: "unidad" }));

    await call({
      action: "generar_descripcion",
      recetaNombre: nombre,
      recetaDescripcion: descripcion,
      materiales,
    });
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Genera una descripción atractiva para vender tu receta. Ideal para
        menus, redes sociales o catálogos de productos.
      </p>
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="desc-nombre">Nombre de la receta *</Label>
            <Input
              id="desc-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Torta de Chocolate con Frambuesas"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc-actual">Descripción actual (opcional)</Label>
            <Textarea
              id="desc-actual"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Si tienes una descripción, la IA la puede mejorar..."
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc-ingredientes">
              Ingredientes principales (uno por línea, opcional)
            </Label>
            <Textarea
              id="desc-ingredientes"
              value={ingredientes}
              onChange={(e) => setIngredientes(e.target.value)}
              placeholder={"Harina de trigo\nCacao en polvo\nFrambuesas frescas"}
              rows={3}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading || !nombre}
            className="gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 border-0 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generar descripción
              </>
            )}
          </Button>
        </form>
      ) : (
        <AIResultCard result={result} onCopy={handleCopy} copied={copied} onReset={reset} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab: Consejos de reducción de costos
// ---------------------------------------------------------------------------
const ReduccionCostosTab = () => {
  const { loading, error, result, call, reset } = useAI();
  const [copied, setCopied] = useState(false);
  const [nombre, setNombre] = useState("");
  const [materialesTexto, setMaterialesTexto] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const materiales: Material[] = materialesTexto
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(",");
        return {
          nombre: parts[0]?.trim() || line,
          cantidad: parseFloat(parts[1]?.trim() || "1") || 1,
          unidad: parts[2]?.trim() || "unidad",
          costo: parts[3] ? parseFloat(parts[3].trim()) : undefined,
        };
      });

    await call({
      action: "consejos_reduccion_costos",
      recetaNombre: nombre,
      materiales,
    });
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Analiza los ingredientes de tu receta y obtén consejos prácticos para
        reducir costos sin sacrificar calidad.
      </p>
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="costo-nombre">Nombre de la receta *</Label>
            <Input
              id="costo-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Torta de Vainilla"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costo-materiales">
              Ingredientes (formato: nombre, cantidad, unidad, costo — uno por línea) *
            </Label>
            <Textarea
              id="costo-materiales"
              value={materialesTexto}
              onChange={(e) => setMaterialesTexto(e.target.value)}
              placeholder={
                "Harina de trigo, 500, gramos, 2.50\nMantequilla, 200, gramos, 3.00\nHuevos, 4, unidades, 0.50"
              }
              rows={5}
              required
            />
            <p className="text-xs text-gray-500">
              El costo es opcional. Formato: nombre, cantidad, unidad, costo_USD
            </p>
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading || !nombre || !materialesTexto}
            className="gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 border-0 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analizando...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                Obtener consejos
              </>
            )}
          </Button>
        </form>
      ) : (
        <AIResultCard result={result} onCopy={handleCopy} copied={copied} onReset={reset} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab: Sugerir sustitutos
// ---------------------------------------------------------------------------
const SustitutosTab = () => {
  const { loading, error, result, call, reset } = useAI();
  const [copied, setCopied] = useState(false);
  const [nombre, setNombre] = useState("");
  const [ingredienteFaltante, setIngredienteFaltante] = useState("");
  const [otrosIngredientes, setOtrosIngredientes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const materiales: Material[] = otrosIngredientes
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => ({ nombre: line, cantidad: 1, unidad: "unidad" }));

    await call({
      action: "sugerir_sustitutos",
      recetaNombre: nombre,
      ingredienteFaltante,
      materiales,
    });
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        ¿Te falta un ingrediente? La IA te sugiere sustitutos prácticos que
        puedes usar sin arruinar la receta.
      </p>
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sust-nombre">Nombre de la receta *</Label>
            <Input
              id="sust-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Brownies de Chocolate"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sust-faltante">Ingrediente faltante *</Label>
            <Input
              id="sust-faltante"
              value={ingredienteFaltante}
              onChange={(e) => setIngredienteFaltante(e.target.value)}
              placeholder="Ej: Bicarbonato de sodio"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sust-otros">
              Otros ingredientes disponibles (uno por línea, opcional)
            </Label>
            <Textarea
              id="sust-otros"
              value={otrosIngredientes}
              onChange={(e) => setOtrosIngredientes(e.target.value)}
              placeholder={"Harina\nCacao\nMantequilla\nHuevos"}
              rows={3}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading || !nombre || !ingredienteFaltante}
            className="gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 border-0 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando sustitutos...
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4" />
                Sugerir sustitutos
              </>
            )}
          </Button>
        </form>
      ) : (
        <AIResultCard result={result} onCopy={handleCopy} copied={copied} onReset={reset} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Tab: Proponer recetas del inventario
// ---------------------------------------------------------------------------
const RecetasInventarioTab = ({
  inventarioDisponible,
}: {
  inventarioDisponible?: InventarioItem[];
}) => {
  const { loading, error, result, call, reset } = useAI();
  const [copied, setCopied] = useState(false);
  const [inventarioTexto, setInventarioTexto] = useState(
    inventarioDisponible
      ? inventarioDisponible
          .map((i) => `${i.nombre}, ${i.cantidad}, ${i.unidad}`)
          .join("\n")
      : ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inventario: InventarioItem[] = inventarioTexto
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(",");
        return {
          nombre: parts[0]?.trim() || line,
          cantidad: parseFloat(parts[1]?.trim() || "1") || 1,
          unidad: parts[2]?.trim() || "unidad",
        };
      });

    await call({
      action: "proponer_recetas_inventario",
      inventario,
    });
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Ingresa los ingredientes que tienes disponibles y la IA te propondrá
        recetas que puedes preparar con ellos.
      </p>
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inv-items">
              Ingredientes disponibles (formato: nombre, cantidad, unidad — uno por línea) *
            </Label>
            <Textarea
              id="inv-items"
              value={inventarioTexto}
              onChange={(e) => setInventarioTexto(e.target.value)}
              placeholder={
                "Harina de trigo, 2, kg\nAzúcar, 1, kg\nHuevos, 12, unidades\nMantequilla, 500, gramos"
              }
              rows={6}
              required
            />
          </div>
          {inventarioDisponible && inventarioDisponible.length > 0 && (
            <p className="text-xs text-purple-600 bg-purple-50 rounded px-3 py-1.5">
              ✨ Se precargaron {inventarioDisponible.length} productos de tu inventario.
              Puedes editarlos antes de consultar.
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={loading || !inventarioTexto}
            className="gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 border-0 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Proponiendo recetas...
              </>
            ) : (
              <>
                <ChefHat className="w-4 h-4" />
                Proponer recetas
              </>
            )}
          </Button>
        </form>
      ) : (
        <AIResultCard result={result} onCopy={handleCopy} copied={copied} onReset={reset} />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main: AIAssistant
// ---------------------------------------------------------------------------

type TabId =
  | "descripcion"
  | "costos"
  | "sustitutos"
  | "inventario";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "descripcion",
    label: "Descripción de venta",
    icon: <FileText className="w-4 h-4" />,
  },
  {
    id: "costos",
    label: "Reducir costos",
    icon: <Lightbulb className="w-4 h-4" />,
  },
  {
    id: "sustitutos",
    label: "Sustitutos",
    icon: <Shuffle className="w-4 h-4" />,
  },
  {
    id: "inventario",
    label: "Recetas del inventario",
    icon: <ChefHat className="w-4 h-4" />,
  },
];

interface AIAssistantProps {
  /** Pre-loaded inventory items to suggest in the inventory tab */
  inventarioDisponible?: InventarioItem[];
  /** Initial tab to show */
  defaultTab?: TabId;
}

export const AIAssistant = ({
  inventarioDisponible,
  defaultTab = "descripcion",
}: AIAssistantProps) => {
  const [tabActiva, setTabActiva] = useState<TabId>(defaultTab);

  return (
    <Card className="border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Asistente de IA
          <span className="ml-auto text-xs font-normal bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
            Premium
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab selector */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTabActiva(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                tabActiva === tab.id
                  ? "bg-white shadow text-purple-700"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {tabActiva === "descripcion" && <GenerarDescripcionTab />}
          {tabActiva === "costos" && <ReduccionCostosTab />}
          {tabActiva === "sustitutos" && <SustitutosTab />}
          {tabActiva === "inventario" && (
            <RecetasInventarioTab inventarioDisponible={inventarioDisponible} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
