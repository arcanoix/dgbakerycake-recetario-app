/**
 * Utilidad para obtener la versión actual de la aplicación.
 * Combina la versión de package.json con el hash del commit de Vercel.
 */
export const getAppVersion = (): string => {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";
  const commit = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  
  if (commit) {
    // Tomamos los primeros 7 caracteres del hash para que sea legible
    return `v${version}-${commit.substring(0, 7)}`;
  }
  
  return `v${version}-dev`;
};
