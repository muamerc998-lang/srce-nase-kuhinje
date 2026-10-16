import { describe, expect, it } from 'vitest'
import { scaleQuantity, formatQuantity, formatNumber, scaleFactor } from '@/lib/quantities/scale'
import { unitForm, UNITS } from '@/lib/quantities/units'

describe('preračun količina', () => {
  it('ne mijenja izvornu količinu (vraća novi objekat)', () => {
    const q = { amount: 250, unit: 'g' }
    const s = scaleQuantity(q, 2)
    expect(s.amount).toBe(500)
    expect(q.amount).toBe(250)
  })

  it('množi decimalne brojeve i zaokružuje metričke jedinice smisleno', () => {
    expect(scaleQuantity({ amount: 1.5, unit: 'kg' }, 0.5).amount).toBe(0.75)
    expect(scaleQuantity({ amount: 7, unit: 'g' }, 0.5).amount).toBe(3.5)
    expect(scaleQuantity({ amount: 125, unit: 'g' }, 1.5).amount).toBe(190) // 187,5 → 190 (na 5)
    expect(scaleQuantity({ amount: 30, unit: 'ml' }, 1.5).amount).toBe(45)
  })

  it('obrađuje raspone', () => {
    const s = scaleQuantity({ amount: 2, amountMax: 3, unit: 'kasika' }, 2)
    expect(s.amount).toBe(4)
    expect(s.amountMax).toBe(6)
    expect(formatQuantity(s)).toBe('4–6 kašika')
  })

  it('ne množi "po ukusu" i "po potrebi"', () => {
    const s = scaleQuantity({ amount: null, unit: 'po-ukusu' }, 3)
    expect(s.fixed).toBe(true)
    expect(formatQuantity(s)).toBe('po ukusu')
    expect(scaleQuantity({ amount: null, unit: 'po-potrebi' }, 0.5).fixed).toBe(true)
  })

  it('zaokružuje jaja na cijeli broj i pamti izračunatu vrijednost', () => {
    const s = scaleQuantity({ amount: 3, unit: 'bez' }, 0.5)
    expect(s.amount).toBe(2)
    expect(s.roundedFrom?.amount).toBe(1.5)
    const one = scaleQuantity({ amount: 1, unit: 'bez' }, 0.5)
    expect(one.amount).toBe(1) // nikad 0 jaja
    expect(scaleQuantity({ amount: 2, unit: 'bez' }, 2).roundedFrom).toBeUndefined()
  })

  it('kuhinjske mjere zaokružuje na četvrtine i prikazuje razlomcima', () => {
    const s = scaleQuantity({ amount: 1, unit: 'kasicica' }, 0.5)
    expect(s.amount).toBe(0.5)
    expect(formatQuantity(s)).toBe('½ kašičice')
    expect(formatQuantity(scaleQuantity({ amount: 1, unit: 'solja' }, 1.5))).toBe('1½ šolje')
    expect(formatQuantity({ amount: 0.25, unit: 'kasika' })).toBe('¼ kašike')
  })

  it('pri faktoru 1 vraća izvornu količinu', () => {
    const s = scaleQuantity({ amount: 1.5, unit: 'kg' }, 1)
    expect(s.scaled).toBe(false)
    expect(formatQuantity(s)).toBe('1,5 kg')
  })

  it('koristi decimalni zarez i bosanske oblike jedinica', () => {
    expect(formatNumber(0.75)).toBe('0,75')
    const k = UNITS.kasika
    expect(unitForm(k, 1)).toBe('kašika')
    expect(unitForm(k, 3)).toBe('kašike')
    expect(unitForm(k, 5)).toBe('kašika')
    expect(unitForm(k, 21)).toBe('kašika')
    expect(unitForm(k, 12)).toBe('kašika')
    expect(unitForm(k, 0.5)).toBe('kašike')
    expect(formatQuantity({ amount: 2, unit: 'cesanj' })).toBe('2 češnja')
  })

  it('računa faktor iz porcija i odbija nevažeće vrijednosti', () => {
    expect(scaleFactor(4, 6)).toBe(1.5)
    expect(scaleFactor(null, 6)).toBe(1)
    expect(scaleFactor(4, 0)).toBe(1)
    expect(scaleQuantity({ amount: 100, unit: 'g' }, NaN).fixed).toBe(true)
  })
})
