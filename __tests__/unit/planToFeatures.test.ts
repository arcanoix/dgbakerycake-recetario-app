import { planToFeatures, PLAN_FEATURES, Plan } from '@/types/subscription';

// Minimal Plan factory
function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: 'test-id',
    name: 'free',
    display_name: 'Plan Gratuito',
    description: 'Test plan',
    price_usd: 0,
    price_bs: 0,
    price_period: 'monthly',
    max_productos: 50,
    max_recetas: 20,
    features: {},
    is_active: true,
    sort_order: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('planToFeatures()', () => {
  describe('defaults when features JSON is empty', () => {
    it('should enable all menu items by default', () => {
      const plan = makePlan({ features: {} });
      const features = planToFeatures(plan);

      expect(features.menu_dashboard).toBe(true);
      expect(features.menu_productos).toBe(true);
      expect(features.menu_recetas).toBe(true);
      expect(features.menu_precios).toBe(true);
      expect(features.menu_facturacion).toBe(true);
      expect(features.menu_perfil).toBe(true);
      expect(features.menu_configuracion).toBe(true);
      expect(features.menu_unidades).toBe(true);
    });

    it('should disable menu_admin by default for non-empresarial plans', () => {
      const plan = makePlan({ name: 'free', features: {} });
      const features = planToFeatures(plan);
      expect(features.menu_admin).toBe(false);
    });

    it('should enable menu_admin by default for empresarial plan', () => {
      const plan = makePlan({ name: 'empresarial', features: {} });
      const features = planToFeatures(plan);
      expect(features.menu_admin).toBe(true);
    });

    it('should enable crear_productos and crear_recetas by default', () => {
      const plan = makePlan({ features: {} });
      const features = planToFeatures(plan);
      expect(features.crear_productos).toBe(true);
      expect(features.crear_recetas).toBe(true);
    });

    it('should disable premium features by default', () => {
      const plan = makePlan({ features: {} });
      const features = planToFeatures(plan);
      expect(features.exportar_pdf).toBe(false);
      expect(features.ver_analytics).toBe(false);
      expect(features.exportar_datos).toBe(false);
      expect(features.api_access).toBe(false);
      expect(features.soporte_prioritario).toBe(false);
    });

    it('should use plan max_productos and max_recetas as limits', () => {
      const plan = makePlan({ max_productos: 200, max_recetas: 100 });
      const features = planToFeatures(plan);
      expect(features.max_productos).toBe(200);
      expect(features.max_recetas).toBe(100);
    });
  });

  describe('reads menu visibility from features JSON', () => {
    it('should disable a menu item when explicitly set to false in features', () => {
      const plan = makePlan({
        features: {
          menu_productos: false,
          menu_recetas: false,
        },
      });
      const features = planToFeatures(plan);
      expect(features.menu_productos).toBe(false);
      expect(features.menu_recetas).toBe(false);
      // Other menus remain enabled
      expect(features.menu_dashboard).toBe(true);
    });

    it('should enable menu_admin when explicitly set in features JSON', () => {
      const plan = makePlan({ name: 'basico', features: { menu_admin: true } });
      const features = planToFeatures(plan);
      expect(features.menu_admin).toBe(true);
    });

    it('should disable menu_admin when explicitly set to false even for empresarial', () => {
      const plan = makePlan({ name: 'empresarial', features: { menu_admin: false } });
      const features = planToFeatures(plan);
      expect(features.menu_admin).toBe(false);
    });
  });

  describe('reads action features from features JSON', () => {
    it('should disable crear_productos when set to false', () => {
      const plan = makePlan({ features: { crear_productos: false } });
      const features = planToFeatures(plan);
      expect(features.crear_productos).toBe(false);
    });

    it('should enable exportar_pdf when set to true', () => {
      const plan = makePlan({ features: { exportar_pdf: true } });
      const features = planToFeatures(plan);
      expect(features.exportar_pdf).toBe(true);
    });

    it('should enable all premium features when set in features JSON', () => {
      const plan = makePlan({
        features: {
          exportar_pdf: true,
          ver_analytics: true,
          exportar_datos: true,
          api_access: true,
          soporte_prioritario: true,
        },
      });
      const features = planToFeatures(plan);
      expect(features.exportar_pdf).toBe(true);
      expect(features.ver_analytics).toBe(true);
      expect(features.exportar_datos).toBe(true);
      expect(features.api_access).toBe(true);
      expect(features.soporte_prioritario).toBe(true);
    });
  });

  describe('compatibility with PLAN_FEATURES constants', () => {
    it('free plan features from planToFeatures should match PLAN_FEATURES.free defaults', () => {
      const plan = makePlan({
        name: 'free',
        max_productos: 50,
        max_recetas: 20,
        features: {
          exportar_pdf: false,
          ver_analytics: false,
          exportar_datos: false,
          api_access: false,
          soporte_prioritario: false,
          menu_dashboard: true,
          menu_productos: true,
          menu_recetas: true,
          menu_precios: true,
          menu_facturacion: true,
          menu_perfil: true,
          menu_configuracion: true,
          menu_unidades: true,
          crear_productos: true,
          crear_recetas: true,
        },
      });
      const features = planToFeatures(plan);
      const expected = PLAN_FEATURES['free'];
      expect(features.menu_dashboard).toBe(expected.menu_dashboard);
      expect(features.menu_admin).toBe(expected.menu_admin);
      expect(features.exportar_pdf).toBe(expected.exportar_pdf);
      expect(features.max_productos).toBe(expected.max_productos);
      expect(features.max_recetas).toBe(expected.max_recetas);
    });
  });
});
