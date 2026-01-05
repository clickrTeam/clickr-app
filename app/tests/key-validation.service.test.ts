
import { ENSURE_KEYS } from '../src/models/Keys.enum'
import { REPRESENTED_KEYS, keyShortLabels } from '../src/renderer/src/components/VisualKeyboard/Layout.const'

describe('Key Validation Service', () => {
  describe('REPRESENTED_KEYS', () => {
    it('should only contain valid keys from ENSURE_KEYS', () => {
      for (const key of REPRESENTED_KEYS) {
        if (key !== 'Fn') {
          expect(ENSURE_KEYS).toContain(key)
        }
      }
    })

    it('should not be empty', () => {
      expect(REPRESENTED_KEYS.length).toBeGreaterThan(0)
    })
  })

  describe('keyShortLabels', () => {
    it('should only contain valid keys from ENSURE_KEYS', () => {
      for (const key of Object.keys(keyShortLabels)) {
        if (key !== 'Fn') {
          expect(ENSURE_KEYS).toContain(key)
        }
      }
    })

    it('should have values for all keys', () => {
      for (const [key, label] of Object.entries(keyShortLabels)) {
        expect(label).toBeTruthy()
        expect(typeof label).toBe('string')
      }
    })

    it('should not be empty', () => {
      expect(Object.keys(keyShortLabels).length).toBeGreaterThan(0)
    })
  })
})
