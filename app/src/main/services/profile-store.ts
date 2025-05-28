import * as fs from 'fs'
import * as path from 'path'
import { app } from 'electron'
import { Profile } from '../../models/Profile'

type Profiles = {
  profiles: Profile[]
  activeProfileIndex?: number
}

// Path to the single JSON file storing all app data
const dataFilePath = path.join(app.getPath('userData'), 'profiles.json')
console.log(dataFilePath)

// Ensure the data file exists with default structure
function ensureDataFile(): void {
  if (!fs.existsSync(dataFilePath)) {
    const initialData: Profiles = { profiles: [], activeProfileIndex: undefined }
    fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2), 'utf-8')
  }
}

let profiles: Profiles | undefined = undefined
// Read and parse the data file
function getProfiles(): Profiles {
  ensureDataFile()
  if (profiles == undefined) {
    const raw = fs.readFileSync(dataFilePath, 'utf-8')
    const json = JSON.parse(raw)
    json.profiles = json.profiles.map(Profile.fromJSON) // Update profiles array with parsed profiles
    profiles = json
  }

  return profiles as Profiles
}

// Serialize and write the data file
function writeProfiles(): void {
  fs.writeFileSync(dataFilePath, JSON.stringify(getProfiles(), null, 2), 'utf-8')
}

export const profileStore = {
  /**
   * Get all profiles stored in the app data file
   */
  getProfiles(): Profile[] {
    return getProfiles().profiles
  },

  /**
   * Get the currently active profile, if any
   */
  getActive(): number | undefined {
    return getProfiles().activeProfileIndex
  },

  /**
   * Create a new profile with the given name and store it.
   * This new profile will always be stored at the end of the list
   */
  create(name: string): number {
    const data = getProfiles()
    const newProfile = new Profile(name)
    data.profiles.push(newProfile)
    writeProfiles()
    return data.profiles.length - 1
  },

  /**
   * Set the active profile by its index in the profiles array
   */
  setActiveByIndex(index: number): void {
    const data = getProfiles()
    if (index >= 0 && index < data.profiles.length) {
      data.activeProfileIndex = index
      writeProfiles()
    }
  },

  setProfileByIndex(index: number, newProfile: Profile): void {
    const data = getProfiles()
    if (index < 0 || index >= data.profiles.length) return

    data.profiles[index] = newProfile
    writeProfiles()
  },

  deleteProfileByIndex(index: number): void {
    const data = getProfiles()
    if (index < 0 || index >= data.profiles.length) return
    if (data.activeProfileIndex != undefined) {
      if (index == data.activeProfileIndex) {
        data.activeProfileIndex = undefined
      } else if (index < data.activeProfileIndex) {
        data.activeProfileIndex--
      }
    }

    data.profiles.splice(index, 1)
    writeProfiles()
  }
}
