import { Shield, Eye, Cookie, Lock, UserCheck, Clock, FileEdit, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div>
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Política de Privacidad
            </h1>
            <p className="text-gray-600">
              Última actualización: Abril 2026
            </p>
          </div>

          {/* Privacy Content */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      1. Información que Recopilamos
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      En DGcost recopilamos únicamente la información necesaria para proporcionarte 
                      nuestros servicios de gestión de costos para repostería y pastelería. Esto incluye:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
                      <li><strong>Datos de cuenta:</strong> nombre, correo electrónico y contraseña (encriptada) para autenticación.</li>
                      <li><strong>Datos de negocio:</strong> productos, recetas, ingredientes, precios, clientes y órdenes que ingreses voluntariamente.</li>
                      <li><strong>Datos de uso:</strong> estadísticas anónimas de interacción con la plataforma para mejorar la experiencia.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FileEdit className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      2. Cómo Usamos tu Información
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Utilizamos tus datos exclusivamente para:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
                      <li>Operar y mantener la plataforma de gestión de costos.</li>
                      <li>Calcular precios de venta, márgenes de ganancia y cotizaciones.</li>
                      <li>Mejorar funcionalidades basándonos en el uso real de la aplicación.</li>
                      <li>Enviarte comunicaciones importantes sobre tu cuenta o cambios en el servicio.</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      <strong>No vendemos ni compartimos tu información personal con terceros</strong> con fines publicitarios.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      3. Cookies y Tecnologías Similares
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      DGcost utiliza cookies y tecnologías similares para:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
                      <li>Mantener tu sesión activa de forma segura.</li>
                      <li>Recordar tus preferencias de uso.</li>
                      <li>Analizar de forma anónima el tráfico y rendimiento de la plataforma.</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      Al utilizar nuestro sitio, aceptas el uso de cookies esenciales. Puedes gestionar 
                      las cookies no esenciales a través de la configuración de tu navegador.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      4. Seguridad de los Datos
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      La seguridad de tu información es nuestra prioridad. Implementamos las siguientes medidas:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
                      <li>Conexión encriptada mediante HTTPS en todo el sitio.</li>
                      <li>Autenticación segura gestionada por Supabase con tokens JWT.</li>
                      <li>Contraseñas encriptadas con algoritmos robustos (bcrypt).</li>
                      <li>Acceso restringido: solo tú puedes ver y modificar tus datos de negocio.</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      Utilizamos Supabase como infraestructura de base de datos, que cumple con estándares 
                      de seguridad de nivel empresarial.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      5. Tus Derechos
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Como usuario de DGcost, tienes derecho a:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
                      <li><strong>Acceder</strong> a todos los datos personales que tenemos sobre ti.</li>
                      <li><strong>Rectificar</strong> información incorrecta o desactualizada.</li>
                      <li><strong>Eliminar</strong> tu cuenta y todos los datos asociados en cualquier momento.</li>
                      <li><strong>Exportar</strong> tus datos de negocio (recetas, productos, clientes) cuando lo desees.</li>
                      <li><strong>Revocar</strong> el consentimiento de uso de datos no esenciales.</li>
                    </ul>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      Para ejercer cualquiera de estos derechos, contáctanos a través de los canales indicados 
                      en esta política.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      6. Retención de Datos
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Conservamos tus datos mientras mantengas una cuenta activa en DGcost. 
                      Si decides eliminar tu cuenta:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 leading-relaxed space-y-1">
                      <li>Todos tus datos de negocio serán eliminados de forma permanente.</li>
                      <li>Los registros de facturación (si aplican) se conservan el tiempo legalmente requerido.</li>
                      <li>Las copias de seguridad se purgan automáticamente en un plazo de 30 días.</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      7. Cambios a esta Política
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar cambios 
                      en nuestras prácticas o en la legislación aplicable. Te notificaremos sobre cambios 
                      significativos a través de tu correo electrónico o mediante un aviso visible en la plataforma. 
                      El uso continuado de DGcost después de la publicación de cambios constituye la aceptación de la política actualizada.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      ¿Tienes preguntas sobre tu privacidad?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Si tienes dudas, inquietudes o deseas ejercer tus derechos relacionados con 
                      la protección de datos, no dudes en contactarnos.
                    </p>
                    <Link href="/">
                      <span className="text-blue-600 hover:text-blue-700 font-semibold">
                        Volver al inicio →
                      </span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-gray-600">
          <p>© 2026 DGcost. Todos los derechos reservados.</p>
          <a href="https://gustavoherrera.dev" target="_blank" rel="noreferrer" className="hover:text-blue-700 transition-colors">Desarrollado por Gustavo Herrera</a>
        </div>
      </div>
    </div>
  );
}
