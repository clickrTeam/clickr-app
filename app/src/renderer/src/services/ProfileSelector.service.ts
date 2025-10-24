import { Profile } from "src/models/Profile"

export class ProfileSelectorService {
  private profileIndex: number | null = null
  private profiles: Profile[] = []

  public setProfileIndex(index: number | null): void {
    this.profileIndex = index
  }

  public getProfileIndex(): number | null {
    return this.profileIndex
  }

  public setProfiles(profiles: Profile[]): void {
    this.profiles = profiles
  }

  public getProfiles(): Profile[] {
    return this.profiles
  }

  public selectProfile(index: number): Profile | null {
    if (index >= 0 && index < this.profiles.length) {
      return this.profiles[index]
    }
    return null
  }
}
