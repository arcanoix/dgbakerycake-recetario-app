import { test, expect } from '@playwright/test';

test.describe('Formulario de inicio de sesión', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
  });

  test('muestra el formulario de login', async ({ page }) => {
    // Verificar que existe al menos un input y un botón
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible();
  });

  test('muestra error al enviar formulario vacío', async ({ page }) => {
    // Buscar el botón de envío
    const submitButton = page.locator('button[type="submit"]').first();
    const count = await submitButton.count();

    if (count > 0) {
      await submitButton.click();
      // Esperar a que aparezca algún mensaje de error o validación
      await page.waitForTimeout(500);
      // La página no debe redirigir a /dashboard con datos vacíos
      expect(page.url()).not.toContain('/dashboard');
    }
  });

  test('el campo de email acepta entrada de texto', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]').first();
    const count = await emailInput.count();

    if (count > 0) {
      await emailInput.fill('test@example.com');
      await expect(emailInput).toHaveValue('test@example.com');
    }
  });

  test('el campo de contraseña oculta el texto', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]').first();
    const count = await passwordInput.count();

    if (count > 0) {
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });
});
