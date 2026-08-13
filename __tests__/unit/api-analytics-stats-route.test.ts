import { createSupabaseServerClient } from '@/utils/supabase/server';
import { GET } from '@/app/api/analytics/stats/route';

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

const mockCreateSupabaseServerClient = jest.mocked(createSupabaseServerClient);

function statsRequest(): Request {
  return { url: 'http://localhost/api/analytics/stats' } as Request;
}

function mockSupabase(user: { id: string } | null, role: string | null = null) {
  const from = jest.fn((table: string) => {
    if (table === 'user_roles') {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: role ? { role } : null,
              error: role ? null : { message: 'Role not found' },
            }),
          }),
        }),
      };
    }

    if (table === 'blog_stats') {
      return {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({
            data: [{ id: 'post-1', total_views: 12 }],
            error: null,
          }),
        }),
      };
    }

    throw new Error(`Tabla inesperada: ${table}`);
  });

  mockCreateSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'No session' },
      }),
    },
    from,
  } as never);

  return { from };
}

describe('GET /api/analytics/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rechaza usuarios no autenticados', async () => {
    const { from } = mockSupabase(null);

    const response = await GET(statsRequest());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: 'No autenticado' });
    expect(from).not.toHaveBeenCalled();
  });

  it('rechaza usuarios autenticados que no son administradores', async () => {
    const { from } = mockSupabase({ id: 'usuario-1' }, 'cliente');

    const response = await GET(statsRequest());

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Acceso denegado' });
    expect(from).toHaveBeenCalledWith('user_roles');
    expect(from).not.toHaveBeenCalledWith('blog_stats');
  });

  it('devuelve estadísticas a un administrador autenticado', async () => {
    const { from } = mockSupabase({ id: 'admin-1' }, 'admin');

    const response = await GET(statsRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      posts: [{ id: 'post-1', total_views: 12 }],
    });
    expect(from).toHaveBeenCalledWith('user_roles');
    expect(from).toHaveBeenCalledWith('blog_stats');
  });
});
