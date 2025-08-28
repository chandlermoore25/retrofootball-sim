import { FIELD } from './FieldConstants'

export function yardToX(yard: number, widthPx: number): number {
  return (yard / FIELD.lengthYds) * widthPx
}

export function stripeCount(): number {
  return Math.floor(FIELD.lengthYds / FIELD.yardPerStripe)
}
