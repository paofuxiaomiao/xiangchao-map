const rawBase = import.meta.env.BASE_URL || "/";
const trimmedBase = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

export function routePath(path: string = "/") {
  const normalizedPath = path === "/" ? "/" : `/${path.replace(/^\/+/, "")}`;

  if (!trimmedBase) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return `${trimmedBase}/`;
  }

  return `${trimmedBase}${normalizedPath}`;
}

export function assetPath(path: string) {
  return `${rawBase}${path.replace(/^\/+/, "")}`;
}
