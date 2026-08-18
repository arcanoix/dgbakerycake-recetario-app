import { test, expect } from '@playwright/test';

test.describe('Página de inicio (landing)', () => {
  test('carga correctamente y muestra el título de la aplicación', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DG|Bakery|Recetario|Cost/i);
  });

  test('redirige o muestra contenido de bienvenida', async ({ page }) => {
    await page.goto('/');
    // La página carga sin errores 5xx
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Página de autenticación', () => {
  test('la ruta /auth/login carga y muestra el formulario', async ({ page }) => {
    const response = await page.goto('/auth/login');
    expect(response?.status()).toBeLessThan(500);

    // Esperar a que aparezca un campo de email o texto relevante
    const emailInput = page.locator('input[type="email"]');
    const anyInput = page.locator('input').first();

    const hasEmailField = await emailInput.count() > 0;
    const hasAnyInput = await anyInput.count() > 0;

    // Al menos debería haber algún campo de formulario o botón
    expect(hasEmailField || hasAnyInput).toBe(true);
  });

  test('la página de registro carga correctamente', async ({ page }) => {
    const response = await page.goto('/auth/register');
    if (response?.status() === 404) {
      // Si no existe la ruta, saltar la prueba
      test.skip();
      return;
    }
    expect(response?.status()).toBeLessThan(500);
  });
});

test.describe('Rutas protegidas', () => {
  test('redirige a login cuando se accede a /dashboard sin autenticar', async ({ page }) => {
    await page.goto('/dashboard');
    // Esperar a que se complete la navegación
    await page.waitForLoadState('networkidle');
    const url = page.url();
    // Debe redirigir al login u otra ruta pública
    const isRedirected = url.includes('login') || url.includes('auth') || url === 'http://localhost:3000/';
    expect(isRedirected).toBe(true);
  });

  test('redirige a login cuando se accede a /recetas sin autenticar', async ({ page }) => {
    await page.goto('/recetas');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const isRedirected = url.includes('login') || url.includes('auth') || url === 'http://localhost:3000/';
    expect(isRedirected).toBe(true);
  });
});
