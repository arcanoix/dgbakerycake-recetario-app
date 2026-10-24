import { put } from "@vercel/blob";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { POST } from "@/app/api/configuracion/logo/route";
import { agregarLogoPDF } from "@/lib/pdfLogo";
import { exportarRecetaPDF } from "@/lib/pdfExport";
import { exportarCotizacionPDF } from "@/lib/pdfCotizacion";
import { ConfiguracionGlobal, Receta, Orden } from "@/types";

const mockAddImage = jest.fn();
const mockGetImageProperties = jest.fn();
const mockSave = jest.fn();

jest.mock("jspdf", () => {
  return jest.fn().mockImplementation(() => ({
    setFont: jest.fn(),
    setFontSize: jest.fn(),
    setTextColor: jest.fn(),
    text: jest.fn(),
    splitTextToSize: jest.fn().mockReturnValue(["Descripción"]),
    setDrawColor: jest.fn(),
    setLineWidth: jest.fn(),
    line: jest.fn(),
    setFillColor: jest.fn(),
    roundedRect: jest.fn(),
    addImage: mockAddImage,
    getImageProperties: mockGetImageProperties,
    save: mockSave,
    lastAutoTable: { finalY: 100 },
  }));
});

jest.mock("jspdf-autotable", () => jest.fn());

jest.mock("@vercel/blob", () => ({
  put: jest.fn(),
}));

jest.mock("@/utils/supabase/server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

const mockPut = jest.mocked(put);
const mockCreateSupabaseServerClient = jest.mocked(createSupabaseServerClient);

function requestWithFile(file: FormDataEntryValue | null): Request {
  return {
    formData: jest.fn().mockResolvedValue({
      get: jest.fn().mockReturnValue(file),
    }),
  } as unknown as Request;
}

function mockAuthenticatedUser(user: { id: string } | null) {
  mockCreateSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: "No session" },
      }),
    },
  } as never);
}

describe("POST /api/configuracion/logo", () => {
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_test_token";
  });

  afterAll(() => {
    process.env.BLOB_READ_WRITE_TOKEN = originalToken;
  });

  it("rechaza solicitudes sin usuario autenticado", async () => {
    mockAuthenticatedUser(null);
    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([pngBytes], "logo.png", { type: "image/png" });

    const response = await POST(requestWithFile(file));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "No autenticado" });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it("permite a cualquier usuario autenticado subir su logo PNG válido", async () => {
    mockAuthenticatedUser({ id: "user-123" });
    mockPut.mockResolvedValue({
      url: "https://example.public.blob.vercel-storage.com/logos/user-123/logo.png",
    } as never);

    const pngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const file = new File([pngBytes], "logo.png", { type: "image/png" });

    const response = await POST(requestWithFile(file));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({
        url: "https://example.public.blob.vercel-storage.com/logos/user-123/logo.png",
        dataUrl: expect.stringMatching(/^data:image\/png;base64,/),
      })
    );
    expect(mockPut).toHaveBeenCalledWith(
      "logos/user-123/logo.png",
      file,
      expect.objectContaining({
        access: "public",
        addRandomSuffix: true,
        contentType: "image/png",
      })
    );
  });

  it("rechaza archivos con firma binaria inválida", async () => {
    mockAuthenticatedUser({ id: "user-123" });
    const fakePng = new File(["texto-plano"], "falso.png", { type: "image/png" });

    const response = await POST(requestWithFile(fakePng));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "El archivo no contiene una imagen válida",
    });
    expect(mockPut).not.toHaveBeenCalled();
  });
});

describe("agregarLogoPDF y exportación de reportes PDF con logo", () => {
  const sampleDataUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  const baseConfig: ConfiguracionGlobal = {
    id: "cfg-1",
    costoPorHoraDefecto: 5,
    moneda: "USD",
    margenGananciaDefecto: 30,
    tasaCambioUSD: 40,
    porcentajeGastosFijos: 10,
    logoUrl: sampleDataUrl,
    ultimaActualizacion: new Date("2026-01-01T00:00:00Z"),
  };

  const sampleReceta: Receta = {
    id: "rec-1",
    nombre: "Torta Tres Leches",
    descripcion: "Receta clásica",
    materiales: [
      {
        id: "mat-1",
        productoId: "prod-1",
        nombreProducto: "Harina",
        cantidadUtilizada: 500,
        unidadMedida: "u-1",
        unidadMedidaSimbolo: "g",
        costoUnitario: 0.002,
        costoMaterial: 1,
      },
    ],
    cantidadHoras: 2,
    costoPorHora: 5,
    costoManoObra: 10,
    costoGastosFijos: 1,
    costoMateriales: 1,
    costoTotal: 12,
    margenGanancia: 30,
    precioVentaSugerido: 15.6,
    fechaCreacion: new Date("2026-01-01T00:00:00Z"),
    fechaActualizacion: new Date("2026-01-01T00:00:00Z"),
  };

  const sampleOrden: Orden = {
    id: "ord-1",
    userId: "user-123",
    clienteId: "cli-1",
    clienteNombre: "María Pérez",
    numeroOrden: "ORD-0001",
    estado: "cotizacion",
    items: [
      {
        id: "item-1",
        ordenId: "ord-1",
        recetaId: "rec-1",
        nombreItem: "Torta Tres Leches",
        cantidad: 1,
        precioUnitario: 15.6,
        subtotal: 15.6,
      },
    ],
    subtotal: 15.6,
    descuentoPorcentaje: 0,
    descuentoMonto: 0,
    total: 15.6,
    pagoAdelantado: 0,
    saldoPendiente: 15.6,
    fechaCreacion: new Date("2026-01-01T00:00:00Z"),
    fechaActualizacion: new Date("2026-01-01T00:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetImageProperties.mockReturnValue({ width: 200, height: 100 });
  });

  it("estampa el logo en el PDF de receta cuando configuracion.logoUrl está presente", async () => {
    await exportarRecetaPDF(sampleReceta, baseConfig);

    expect(mockAddImage).toHaveBeenCalledTimes(1);
    expect(mockAddImage).toHaveBeenCalledWith(
      sampleDataUrl,
      "PNG",
      expect.any(Number),
      expect.any(Number),
      expect.any(Number),
      expect.any(Number)
    );
    expect(mockSave).toHaveBeenCalledWith("Receta-torta_tres_leches.pdf");
  });

  it("estampa el logo en el PDF de cotización cuando configuracion.logoUrl está presente", async () => {
    await exportarCotizacionPDF(sampleOrden, baseConfig);

    expect(mockAddImage).toHaveBeenCalledTimes(1);
    expect(mockSave).toHaveBeenCalledWith("Cotizacion-ORD-0001.pdf");
  });

  it("estampa el logo en el PDF de cotización usando el fallback local aunque configuracion sea null", async () => {
    window.localStorage.setItem("dgcost_config_logo_url", sampleDataUrl);
    try {
      await exportarCotizacionPDF(sampleOrden, null);

      expect(mockAddImage).toHaveBeenCalledTimes(1);
      expect(mockSave).toHaveBeenCalledWith("Cotizacion-ORD-0001.pdf");
    } finally {
      window.localStorage.removeItem("dgcost_config_logo_url");
    }
  });

  it("continúa generando el PDF sin fallar si la carga remota del logo falla", async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    try {
      await exportarRecetaPDF(sampleReceta, {
        ...baseConfig,
        logoUrl: "https://example.com/broken-logo.png",
      });

      expect(mockAddImage).not.toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalledWith("Receta-torta_tres_leches.pdf");
    } finally {
      global.fetch = originalFetch;
    }
  });
});
