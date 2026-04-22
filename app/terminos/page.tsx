import { FileText, Scale, Shield, RefreshCw, Lock, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <Link href="/" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            ← Volver al inicio
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div>
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Términos y Condiciones
            </h1>
            <p className="text-gray-600">
              Última actualización: Abril 2026
            </p>
          </div>

          {/* Terms Content */}
          <div className="space-y-8">
            {/* Section 1 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Scale className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      1. Alcance y Aceptación
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Estos Términos y Condiciones rigen el uso de DGcost y la información proporcionada a través del mismo. 
                      Al utilizar este sistema, aceptas cumplir con estos términos. DGcost es una plataforma de gestión de 
                      costos para recetas de repostería y pastelería que te permite calcular precios, gestionar productos, 
                      crear cotizaciones y administrar tu negocio de manera eficiente.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      2. Información de Tipos de Cambio
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      La información sobre los tipos de cambio entre el bolívar (Bs.) y el dólar (USD) se obtiene de fuentes 
                      públicas oficiales, como el Banco Central de Venezuela (BCV). Los tipos de cambio se muestran con fines 
                      informativos únicamente y pueden estar sujetos a cambios.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      El sistema sincroniza automáticamente la tasa de cambio al iniciar sesión, pero es responsabilidad del 
                      usuario verificar que la tasa sea la correcta antes de realizar cálculos importantes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      3. Cálculos y Actualizaciones
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Puedes realizar cálculos de costos, precios de venta y márgenes de ganancia utilizando las herramientas 
                      proporcionadas en el sistema. Sin embargo, debes verificar la exactitud de los cálculos, ya que el sistema 
                      no garantiza que estén libres de errores.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Las tasas de cambio se actualizan periódicamente de manera automática, pero es posible que no reflejen 
                      los valores más recientes en todo momento. Es responsabilidad del usuario validar la información antes 
                      de tomar decisiones comerciales.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      4. Limitación de Responsabilidad
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      DGcost y su contenido se proporcionan "tal cual", sin garantías de ningún tipo, ya sean expresas o 
                      implícitas. No nos hacemos responsables de los daños o pérdidas que puedan resultar del uso de la 
                      información o los cálculos presentados.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      El usuario es el único responsable de las decisiones comerciales que tome basándose en la información 
                      proporcionada por el sistema. Se recomienda siempre verificar los cálculos y consultar con profesionales 
                      cuando sea necesario.
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
                    <Lock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      5. Privacidad y Protección de Datos
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Respetamos la privacidad de los usuarios y nos comprometemos a proteger la información personal. 
                      Todos los datos ingresados en el sistema (productos, recetas, clientes, órdenes) son privados y 
                      pertenecen exclusivamente al usuario.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Utilizamos Supabase como proveedor de base de datos y autenticación, garantizando que tu información 
                      esté almacenada de forma segura. No compartimos, vendemos ni distribuimos tu información personal a 
                      terceros sin tu consentimiento.
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
                    <RefreshCw className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      6. Modificaciones a los Términos
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Nos reservamos el derecho de actualizar o modificar estos Términos y Condiciones en cualquier momento. 
                      Se recomienda a los usuarios revisar periódicamente esta página para estar al tanto de cualquier cambio.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      El uso continuado del sistema después de la publicación de cambios constituye la aceptación de dichos 
                      cambios. Si no estás de acuerdo con los términos modificados, debes dejar de usar el sistema.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 7 - Subscriptions */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      7. Planes y Suscripciones
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      DGcost ofrece diferentes planes de suscripción (Gratuito, Básico, Profesional, Empresarial) con 
                      características y límites específicos. Al suscribirte a un plan de pago, aceptas los términos de 
                      facturación y las características incluidas en dicho plan.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Los pagos se procesan de forma manual mediante solicitudes de pago. Una vez aprobada tu solicitud, 
                      tendrás acceso a las funcionalidades del plan contratado durante el período acordado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border-violet-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      ¿Tienes preguntas?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Si tienes alguna pregunta o necesitas más información sobre estos términos y condiciones, 
                      no dudes en ponerte en contacto con nosotros.
                    </p>
                    <Link href="/">
                      <span className="text-violet-600 hover:text-violet-700 font-semibold">
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
        </div>
      </div>
    </div>
  );
}
