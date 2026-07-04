// utils/getAssetPath.js
// Resolve caminhos de assets com basePath dinâmico
// Uso: getAssetPath('/images/breath/breath-classico.jpg')
// Retorna: '/descomplicai/images/breath/breath-classico.jpg' (ou '' se basePath mudar)

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function getAssetPath(path) {
  if (!path) return '';
  // Se já tem o basePath, não duplica
  if (BASE_PATH && path.startsWith(BASE_PATH)) return path;
  // Garante que path começa com /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${BASE_PATH}${cleanPath}`;
}

export default getAssetPath;