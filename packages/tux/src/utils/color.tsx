// Color utility library by callemall/material-ui
// https://github.com/callemall/material-ui/blob/master/src/utils/colorManipulator.js

export type Color = {
  type: string
  values: number[]
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * @param {number} value The value to be clamped
 * @param {number} min The lower boundary of the output range
 * @param {number} max The upper boundary of the output range
 * @returns {number} A number in the range [min, max]
 */
function clamp(value: number, min: number, max: number) {
  if (value < min) {
    return min
  }
  if (value > max) {
    return max
  }
  return value
}

/**
 * Converts a color object with type and values to a string.
 *
 * @param {object} color - Decomposed color
 * @param {string} color.type - One of, 'rgb', 'rgba', 'hsl', 'hsla'
 * @param {array} color.values - [n,n,n] or [n,n,n,n]
 * @returns {string} A CSS color string
 */
export function convertColorToString(color: Color): string {
  const {type, values} = color

  if (type.indexOf('rgb') > -1) {
    // Only convert the first 3 values to int (i.e. not alpha)
    for (let i = 0; i < 3; i++) {
      values[i] = parseInt((values[i] as any))
    }
  }

  let colorString

  if (type.indexOf('hsl') > -1) {
    colorString = `${color.type}(${values[0]}, ${values[1]}%, ${values[2]}%`
  } else {
    colorString = `${color.type}(${values[0]}, ${values[1]}, ${values[2]}`
  }

  if (values.length === 4) {
    colorString += `, ${color.values[3]})`
  } else {
    colorString += ')'
  }

  return colorString
}

/**
 * Converts a color from CSS hex format to CSS rgb format.
 *
 *  @param {string} color - Hex color, i.e. #nnn or #nnnnnn
 *  @returns {string} A CSS rgb color string
 */
export function convertHexToRGB(color: string) {
  if (color.length === 4) {
    let extendedColor = '#'
    for (let i = 1; i < color.length; i++) {
      extendedColor += color.charAt(i) + color.charAt(i)
    }
    color = extendedColor
  }

  const values = {
    r:	parseInt(color.substr(1, 2), 16),
    g:	parseInt(color.substr(3, 2), 16),
    b:	parseInt(color.substr(5, 2), 16),
  }

  return `rgb(${values.r}, ${values.g}, ${values.b})`
}

/**
 * Returns an object with the type and values of a color.
 *
 * Note: Does not support rgb % values and color names.
 *
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @returns {{type: string, values: number[]}} A MUI color object
 */
export function decomposeColor(color: string): Color {
  if (color.charAt(0) === '#') {
    return decomposeColor(convertHexToRGB(color))
  }

  const marker = color.indexOf('(')

  const type = color.substring(0, marker)
  const strValues = color.substring(marker + 1, color.length - 1).split(',')
  const values = strValues.map((value) => parseFloat(value))

  return {type, values}
}

/**
 * Calculates the contrast ratio between two colors.
 *
 * Formula: http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef
 *
 * @param {string} foreground - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @param {string} background - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @returns {number} A contrast ratio value in the range 0 - 21 with 2 digit precision.
 */
export function getContrastRatio(foreground: string, background: string) {
  const lumA = getLuminance(foreground)
  const lumB = getLuminance(background)
  const contrastRatio = (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05)

  return Number(contrastRatio.toFixed(2)) // Truncate at two digits
}

/**
 * The relative brightness of any point in a color space,
 * normalized to 0 for darkest black and 1 for lightest white.
 *
 * Formula: https://www.w3.org/WAI/GL/wiki/Relative_luminance
 *
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @returns {number} The relative brightness of the color in the range 0 - 1
 */
export function getLuminance(color: string): number {
  const colorObj = decomposeColor(color)

  if (colorObj.type.indexOf('rgb') > -1) {
    const rgb = colorObj.values.map((val) => {
      val /= 255 // normalized
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    // Truncate at 3 digits
    return parseFloat((0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]).toFixed(3))
  } else if (colorObj.type.indexOf('hsl') > -1) {
    return colorObj.values[2] / 100
  }
  // Edge case.
  return 0
}

/**
 * Darken or lighten a colour, depending on its luminance.
 * Light colors are darkened, dark colors are lightened.
 *
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @param {number} coefficient=0.15 - multiplier in the range 0 - 1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export function emphasize(color: string, coefficient = 0.15) {
  return getLuminance(color) > 0.5 ?
    darken(color, coefficient) :
    lighten(color, coefficient)
}

/**
 * Set the absolute transparency of a color.
 * Any existing alpha values are overwritten.
 *
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @param {number} value - value to set the alpha channel to in the range 0 -1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export function fade(color: string, value: number) {
  const colorObj = decomposeColor(color)
  value = clamp(value, 0, 1)

  if (colorObj.type === 'rgb' || colorObj.type === 'hsl') {
    colorObj.type += 'a'
  }
  colorObj.values[3] = value

  return convertColorToString(colorObj)
}

/**
 * Darkens a color.
 *
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @param {number} coefficient - multiplier in the range 0 - 1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export function darken(color: string, coefficient: number) {
  const colorObj = decomposeColor(color)
  coefficient = clamp(coefficient, 0, 1)

  if (colorObj.type.indexOf('hsl') > -1) {
    colorObj.values[2] *= 1 - coefficient
  } else if (colorObj.type.indexOf('rgb') > -1) {
    for (let i = 0; i < 3; i++) {
      colorObj.values[i] *= 1 - coefficient
    }
  }
  return convertColorToString(colorObj)
}

/**
 * Lightens a color.
 *
 * @param {string} color - CSS color, i.e. one of: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla()
 * @param {number} coefficient - multiplier in the range 0 - 1
 * @returns {string} A CSS color string. Hex input values are returned as rgb
 */
export function lighten(color: string, coefficient: number) {
  const colorObj = decomposeColor(color)
  coefficient = clamp(coefficient, 0, 1)

  if (colorObj.type.indexOf('hsl') > -1) {
    colorObj.values[2] += (100 - colorObj.values[2]) * coefficient
  } else if (colorObj.type.indexOf('rgb') > -1) {
    for (let i = 0; i < 3; i++) {
      colorObj.values[i] += (255 - colorObj.values[i]) * coefficient
    }
  }

  return convertColorToString(colorObj)
}
