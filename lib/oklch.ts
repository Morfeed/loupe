/* OKLCH color math: hex parsing, sRGB gamut fitting and palette ramp building */

export type Oklch = { l: number; c: number; h: number }

export type RampStep = { l: number; c: number }

const HEX_PATTERN = /^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

/* Below this chroma the hue carries no visible information */
const ACHROMATIC = 0.0005

function srgbToLinear(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function oklabToLinearSrgb(lightness: number, a: number, b: number) {
  const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3

  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ]
}

export function parseHex(input: string): Oklch | null {
  const trimmed = input.trim()
  if (!HEX_PATTERN.test(trimmed)) {
    return null
  }

  const digits = trimmed.replace("#", "")
  const full =
    digits.length === 3
      ? digits.replace(/[0-9a-f]/gi, (digit) => digit + digit)
      : digits
  const [red, green, blue] = [0, 2, 4].map((offset) =>
    srgbToLinear(parseInt(full.slice(offset, offset + 2), 16) / 255)
  )

  const long = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue
  )
  const medium = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue
  )
  const short = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue
  )

  const lightness =
    0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short
  const a = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short
  const b = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short
  const chroma = Math.hypot(a, b)

  return {
    l: lightness,
    c: chroma,
    h:
      chroma < ACHROMATIC
        ? 0
        : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360,
  }
}

function linearToSrgb(value: number) {
  return value <= 0.0031308 ? value * 12.92 : 1.055 * value ** (1 / 2.4) - 0.055
}

export function toHex({ l, c, h }: Oklch) {
  const radians = (h * Math.PI) / 180
  const channels = oklabToLinearSrgb(
    l,
    c * Math.cos(radians),
    c * Math.sin(radians)
  )
  return `#${channels
    .map((channel) => {
      const byte = Math.round(
        Math.min(1, Math.max(0, linearToSrgb(channel))) * 255
      )
      return byte.toString(16).padStart(2, "0")
    })
    .join("")}`
}

function inSrgb(lightness: number, chroma: number, hue: number) {
  const radians = (hue * Math.PI) / 180
  const channels = oklabToLinearSrgb(
    lightness,
    chroma * Math.cos(radians),
    chroma * Math.sin(radians)
  )
  return channels.every((channel) => channel >= -1e-4 && channel <= 1 + 1e-4)
}

/* Browsers gamut-map out-of-range oklch() themselves, but they clip per channel
   and shift the hue. Binary search keeps hue and lightness exact instead. */
export function fitChroma(lightness: number, chroma: number, hue: number) {
  if (inSrgb(lightness, chroma, hue)) {
    return chroma
  }

  let low = 0
  let high = chroma
  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2
    if (inSrgb(lightness, middle, hue)) {
      low = middle
    } else {
      high = middle
    }
  }
  return low
}

export function formatOklch({ l, c, h }: Oklch) {
  const round = (value: number, places: number) =>
    Number(value.toFixed(places)).toString()
  return `oklch(${round(l, 3)} ${round(c, 3)} ${round(h, 1)})`
}

/* Rebuild a ramp on its own lightness ladder using the pasted hue. Chroma keeps
   the ladder's shape, scaled so the step nearest the pasted lightness matches
   it. Pasting a color already on the ladder returns that ladder unchanged. */
export function buildRamp(ramp: RampStep[], source: Oklch): Oklch[] {
  const anchor = ramp.reduce((closest, step) =>
    Math.abs(step.l - source.l) < Math.abs(closest.l - source.l)
      ? step
      : closest
  )
  const scale = anchor.c > 0 ? source.c / anchor.c : 0

  return ramp.map(({ l, c }) => ({
    l,
    c: fitChroma(l, c * scale, source.h),
    h: source.h,
  }))
}
