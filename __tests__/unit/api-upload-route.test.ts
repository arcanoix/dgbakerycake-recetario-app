import { put } from '@vercel/blob';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { POST } from '@/app/api/upload/route';

jest.mock('@vercel/blob', () => ({
  put: jest.fn(),
}));

jest.mock('@/utils/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('next/server', () => ({
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

function mockAuthenticatedUser(user: { id: string } | null, role = 'admin') {
  mockCreateSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'No session' },
      }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { role },
            error: null,
          }),
        }),
      }),
    }),
  } as never);
}

describe('POST /api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza solicitudes sin usuario autenticado', async () => {
    mockAuthenticatedUser(null);

    const response = await POST(requestWithFile(new File(['imagen'], 'torta.png', { type: 'image/png' })));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'No autenticado' });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('rechaza usuarios autenticados que no son administradores', async () => {
    mockAuthenticatedUser({ id: 'usuario-1' }, 'cliente');
    mockPut.mockResolvedValue({
      url: 'https://blob.example/torta.png',
      pathname: 'blog/torta.png',
      contentType: 'image/png',
    } as never);

    const response = await POST(requestWithFile(new File(['imagen'], 'torta.png', { type: 'image/png' })));

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Acceso denegado' });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('rechaza de forma segura un campo file que no contiene un archivo', async () => {
    mockAuthenticatedUser({ id: 'usuario-1' });

    const response = await POST(requestWithFile('contenido-malformado'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Archivo inválido' });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('rechaza multipart malformado sin filtrar detalles internos', async () => {
    mockAuthenticatedUser({ id: 'usuario-1' });
    const request = {
      formData: jest.fn().mockRejectedValue(new Error('multipart boundary interno')),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Solicitud inválida' });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('rechaza tipos de imagen fuera de la allowlist', async () => {
    mockAuthenticatedUser({ id: 'usuario-1' });

    const response = await POST(requestWithFile(new File(['svg'], 'vector.svg', { type: 'image/svg+xml' })));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'Tipo de imagen no permitido' });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('rechaza imágenes mayores de 5MB', async () => {
    mockAuthenticatedUser({ id: 'usuario-1' });
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.png', { type: 'image/png' });

    const response = await POST(requestWithFile(file));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: 'La imagen no debe superar 5MB' });
    expect(mockPut).not.toHaveBeenCalled();
  });

  it('sube una imagen permitida para un administrador autenticado', async () => {
    mockAuthenticatedUser({ id: 'admin-1' });
    mockPut.mockResolvedValue({
      url: 'https://blob.example/torta.png',
      pathname: 'blog/torta.png',
      contentType: 'image/png',
    } as never);
    const file = new File(['imagen'], 'torta.png', { type: 'image/png' });

    const response = await POST(requestWithFile(file));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      url: 'https://blob.example/torta.png',
      pathname: 'blog/torta.png',
      contentType: 'image/png',
    });
    expect(mockPut).toHaveBeenCalledWith(
      expect.stringMatching(/^blog\/\d+-[a-z0-9]+\.png$/),
      file,
      { access: 'public', addRandomSuffix: false }
    );
  });
});
