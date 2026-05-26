"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Save, Users, Wrench, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SystemSettingsData {
  max_users: number;
  maintenance_mode: boolean;
  maintenance_message: string;
}

export function SystemSettingsPanel() {
  const [settings, setSettings] = useState<SystemSettingsData>({
    max_users: -1,
    maintenance_mode: false,
    maintenance_message: 'El sistema está en mantenimiento. Volveremos pronto.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/system-settings');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al cargar configuración');
      }
      const data = await res.json();
      setSettings({
        max_users: data.max_users ?? -1,
        maintenance_mode: data.maintenance_mode ?? false,
        maintenance_message: data.maintenance_message || 'El sistema está en mantenimiento. Volveremos pronto.',
      });

      // Cargar total de usuarios
      const usersRes = await fetch('/api/admin/system-settings?count=true');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setTotalUsers(usersData.total || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          max_users: settings.max_users,
          maintenance_mode: settings.maintenance_mode,
          maintenance_message: settings.maintenance_message,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Error al guardar configuración');
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Límite de Usuarios */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Límite de Usuarios</CardTitle>
                <CardDescription>Controla cuántos usuarios pueden registrarse</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="max_users">Máximo de usuarios permitidos</Label>
              <Input
                id="max_users"
                type="number"
                value={settings.max_users}
                onChange={(e) => setSettings({ ...settings, max_users: parseInt(e.target.value) || 0 })}
                min={-1}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Usa <strong>-1</strong> para ilimitado, <strong>0</strong> para bloquear registros, o cualquier número positivo como límite.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Usuarios actuales</span>
                <span className="text-lg font-bold">{totalUsers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Límite configurado</span>
                <span className="text-lg font-bold">
                  {settings.max_users === -1 ? 'Ilimitado' : settings.max_users === 0 ? 'Bloqueado' : settings.max_users}
                </span>
              </div>
              {settings.max_users > 0 && (
                <div className="mt-2">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        totalUsers >= settings.max_users ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min((totalUsers / settings.max_users) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {totalUsers >= settings.max_users ? (
                      <span className="text-red-500 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Se ha alcanzado el límite. No se permiten más registros.
                      </span>
                    ) : (
                      `${settings.max_users - totalUsers} cupos disponibles`
                    )}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modo Mantenimiento */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Modo Mantenimiento</CardTitle>
                <CardDescription>Bloquea el acceso a usuarios durante actualizaciones</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance_mode">Activar modo mantenimiento</Label>
                <p className="text-xs text-muted-foreground">
                  Solo los administradores podrán acceder al sistema
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
              />
            </div>

            {settings.maintenance_mode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label htmlFor="maintenance_message">Mensaje de mantenimiento</Label>
                <Textarea
                  id="maintenance_message"
                  value={settings.maintenance_message}
                  onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                  rows={3}
                  placeholder="Mensaje que verán los usuarios..."
                />
                <p className="text-xs text-muted-foreground">
                  Este mensaje se mostrará a los usuarios que intenten acceder al sistema.
                </p>
              </motion.div>
            )}

            {settings.maintenance_mode && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Precaución
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    El modo mantenimiento bloqueará el acceso a todos los usuarios excepto administradores.
                    Asegúrate de tener una copia de seguridad antes de realizar cambios importantes.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3 text-destructive">
          <AlertTriangle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 flex items-center gap-3 text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle className="w-5 h-5" />
          <p className="text-sm font-medium">Configuración guardada correctamente</p>
        </motion.div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Configuración
        </Button>
        <Button
          onClick={loadSettings}
          variant="outline"
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar
        </Button>
      </div>
    </motion.div>
  );
}
