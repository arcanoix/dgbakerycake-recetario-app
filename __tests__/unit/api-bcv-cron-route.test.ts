import { GET } from '@/app/api/cron/bcv-exchange-rate/route';

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

function cronRequest(authorization?: string) {
  return {
    headers: {
      get: (name: string) => name.toLowerCase() === 'authorization' ? authorization ?? null : null,
    },
  } as never;
}

describe('GET /api/cron/bcv-exchange-rate', () => {
  const originalCronSecret = process.env.CRON_SECRET;
  const originalApiKey = process.env.BCV_API_KEY;
  const mockFetch = jest.fn();

  beforeAll(() => {
    global.fetch = mockFetch as typeof fetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BCV_API_KEY = 'api-key-prueba';
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ tasa: 36.5 }),
    });
  });

  afterAll(() => {
    if (originalCronSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalCronSecret;

    if (originalApiKey === undefined) delete process.env.BCV_API_KEY;
    else process.env.BCV_API_KEY = originalApiKey;
  });

  it('falla cerrado cuando CRON_SECRET no está configurado', async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(cronRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'No autorizado' });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it.each([undefined, '', 'Basic secreto', 'Bearer incorrecto'])(
    'rechaza credenciales Bearer ausentes o inválidas: %s',
    async (authorization) => {
      process.env.CRON_SECRET = 'secreto-correcto';

      const response = await GET(cronRequest(authorization));

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'No autorizado' });
      expect(mockFetch).not.toHaveBeenCalled();
    }
  );

  it('sincroniza cuando la credencial Bearer es válida', async () => {
    process.env.CRON_SECRET = 'secreto-correcto';

    const response = await GET(cronRequest('Bearer secreto-correcto'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      exitoso: true,
      mensaje: 'Sincronización exitosa con API externa',
      tasa: 36.5,
    }));
    expect(mockFetch).toHaveBeenCalledWith(
      'https://python-scrapping-bcv.onrender.com/sync',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-API-Key': 'api-key-prueba' }),
      })
    );
  });
});
