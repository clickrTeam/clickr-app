import { ProfileSelectorService } from './ProfileSelector.service'
// services.ts
export const createServices = () => {
  const api = {
    getUser: async (id: string) =>
      fetch(`/api/user/${id}`).then(r => r.json()),
  };

  const store = {
    state: { count: 0 },
    set(updater: (s: any) => any) { this.state = updater(this.state) },
    get() { return this.state },
  };

  const profileSelectorService = new ProfileSelectorService();

  return { api, store, profileSelectorService };
};
