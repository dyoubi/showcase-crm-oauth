export const FontStyleSchema = {
  $id: 'FontStyleSchema',
  type: 'object',
  properties: {
    bold: {
      type: 'string'
    },
    size: {
      type: 'number'
    }
  },
  required: ['bold', 'size']
}

export type FontStyle = {
  bold: string
  size: number
}
export const FontStyle = (() => {
  function check_FontStyle(value: any): boolean {
    return (
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      typeof value.bold === 'string' &&
      Number.isFinite(value.size)
    )
  }
  return function check(value: any): value is FontStyle {
    return check_FontStyle(value)
  }
})()
