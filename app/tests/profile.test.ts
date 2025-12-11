import { Profile, ProfileStorage, defaultProfile, defaultProfileStorage, defaultProfileUI } from '../src/models/profile/Profile.model'
import { hydrate, stripStorage } from '../src/models/profile/transformer'

describe('Profile Model', () => {
  test('should create a profile with default values', () => {
    const p: Profile = defaultProfile

    expect(p.profile_name).toBe('New Profile')
    expect(p.OS).toBe('any')
    expect(p.layers).toEqual([])
    expect(p.active_layer_index).toBe(0)

    const p_storage: ProfileStorage = stripStorage(defaultProfileStorage, p)
    expect(p_storage).toEqual(defaultProfileStorage)

    const p_combined: Profile = hydrate(p_storage, defaultProfileUI)
    expect(p_combined).toEqual(p)
  })
})
