import type { NextConfig } from "next"
import { PHASE_DEVELOPMENT_SERVER } from "next/constants"

const routeExtensions = ["tsx", "ts", "jsx", "js"]

/* Files named *.dev.tsx resolve as routes only under `next dev`. The design
   system page never enters the production build, so the path returns a real
   404. Keep the sibling layout as a plain layout.tsx. A layout.dev.tsx makes
   the dev type generator emit a validator that the production route types
   reject, and a layout alone creates no route. */
const devOnlyRouteExtensions = ["dev.tsx", "dev.ts"]

export default function nextConfig(phase: string): NextConfig {
  return {
    allowedDevOrigins: ["192.168.*.*"],
    pageExtensions:
      phase === PHASE_DEVELOPMENT_SERVER
        ? [...devOnlyRouteExtensions, ...routeExtensions]
        : routeExtensions,
  }
}
