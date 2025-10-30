# Settings Page Implementation Plan - Electron App

## Overview
Create a comprehensive settings page for the Electron app that supports both local (non-logged-in) users and authenticated users with additional account-specific settings. The settings will be stored locally using Electron's secure storage mechanisms.

---

## 1. Settings Categories

### 1.1 Local Settings (Available to All Users)
Stored in `settings.json` file in userData directory:

#### Appearance & Display
- **Theme**: Light / Dark / System Preference
  - Default: System Preference
  - Note: Electron's `nativeTheme` API for system preference detection

#### Application Behavior
- **Start on System Boot**: Launch Clickr when system starts
  - Default: Disabled
  - Storage: `startOnBoot` boolean
  - Implementation: Uses Electron's `app.setLoginItemSettings()`
- **Minimize to Tray**: Keep app running in system tray when closed
  - Default: Disabled
  - Storage: `minimizeToTray` boolean

#### Keyboard & Daemon
- **Auto-start Keybinder**: Automatically start keybinder daemon on app launch
  - Default: Enabled
  - Storage: `autoStartKeybinder` boolean
- **Keybinder Auto-restart**: Automatically restart keybinder if it crashes
  - Default: Enabled
  - Storage: `keybinderAutoRestart` boolean
- **Show Keybinder Status**: Display keybinder status in UI
  - Default: Enabled
  - Storage: `showKeybinderStatus` boolean

#### Privacy & Data
- **Analytics**: Enable/Disable anonymous usage analytics
  - Default: Enabled
  - Storage: `analyticsEnabled` boolean

#### Notifications
- **System Notifications**: Enable system notifications
  - Default: Enabled
  - Storage: `systemNotificationsEnabled` boolean
- **Layer Switch**: Enable UI on desktop for switching layers
  - Default: Enabled
  - Storage: `layerNotificationEnabled` boolean

#### Community & Sync
- **Default Mapping Visibility**: Public / Private (for new mappings)
  - Default: Private
  - Storage: `defaultMappingVisibility` ('public' | 'private')
- **Auto-sync Mappings**: Automatically sync mappings with cloud
  - Default: Enabled (only if logged in)
  - Storage: `autoSyncMappings` boolean

---

### 1.2 Account Settings (Only for Logged-In Users)
Stored in backend via API + cached locally in `settings.json`:

#### Profile Information
- **Username**: Display current username (read-only)
- **Email**: Display and update email address
  - Backend: `email` field
  - API endpoint: `PATCH /api/users/{username}/profile/`
- **Profile Image**: Upload/Update profile picture
  - Backend: `profile_image` field
  - File upload: Image (JPG, PNG, max 2MB)
  - Implementation: Use Electron's `dialog.showOpenDialog()` for file picker
- **Default Mapping Visibility**: Public / Private for new mappings
  - Backend: `default_mapping_visibility` (CharField)
  - Default: 'private'
  - API endpoint: `PATCH /api/users/{username}/preferences/`


#### Account Security
- **Change Password**: Update account password
  - Requires: Current password, new password, confirm password
  - Validation: Min 8 characters
  - API endpoint: `POST /api/users/{username}/change-password/`

#### Data Management
- **Sync Now**: Manually trigger sync with cloud
  - Triggers: Fetch user mappings, update local profiles
- **Delete Account**: Permanently delete account and all data
  - Requires: Confirmation dialog + password confirmation
  - API endpoint: `DELETE /api/users/{username}/account/`
  - Warning: Irreversible action

---

## 2. File Structure

```
app/src/
├── main/
│   ├── services/
│   │   ├── settings-store.ts          # NEW: Settings storage service (similar to profile-store.ts)
│   ├── ipc/
│   │   └── settings-ipc.ts            # NEW: IPC handlers for settings
│   └── ...
├── preload/
│   ├── index.ts                       # UPDATE: Add settings API methods
│   └── index.d.ts                     # UPDATE: Add settings API types
└── renderer/src/
    ├── pages/
    │   └── Settings.tsx               # NEW: Main settings page component
    ├── components/
    │   └── settings/
    │       ├── AppearanceSettings.tsx  # Appearance section
    │       ├── ApplicationSettings.tsx # Application behavior section
    │       ├── KeyboardSettings.tsx    # Keyboard/daemon settings
    │       ├── PrivacySettings.tsx     # Privacy & data section
    │       ├── NotificationSettings.tsx # Notification preferences
    │       ├── ProfileSettings.tsx     # Profile info (logged-in only)
    │       ├── SecuritySettings.tsx    # Security settings (logged-in only)
    │       └── DataManagement.tsx      # Data sync/delete (logged-in only)
    └── ...
```

---

## 3. Implementation Details

### 3.1 Settings Storage Service (`settings-store.ts`)

Similar to `profile-store.ts`, creates a service to manage settings:

```typescript
// Main process service
type Settings = {
  // Appearance
  theme: 'light' | 'dark' | 'system'

  // Application
  startOnBoot: boolean
  minimizeToTray: boolean
  
  // Keyboard/Daemon
  autoStartKeybinder: boolean
  keybinderAutoRestart: boolean
  showKeybinderStatus: boolean
  
  // Privacy
  analyticsEnabled: boolean
  
  // Notifications
  systemNotificationsEnabled: boolean
  layerNotificationEnabled: boolean
  
  // Community
  defaultMappingVisibility: 'public' | 'private'
  autoSyncMappings: boolean
}

interface SettingsStore {
  getSettings(): Settings
  updateSettings(updates: Partial<Settings>): void
  resetSettings(): void
  getSetting<K extends keyof Settings>(key: K): Settings[K]
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void
}
```

### 3.2 IPC Handlers (`settings-ipc.ts`)

```typescript
// IPC handlers for settings communication
export function registerSettingsHandlers(): void {
  ipcMain.handle('get-settings', () => {
    return settingsStore.getSettings()
  })
  
  ipcMain.handle('update-settings', (_event, updates: Partial<Settings>) => {
    settingsStore.updateSettings(updates)
    return settingsStore.getSettings()
  })
  
  ipcMain.handle('reset-settings', () => {
    settingsStore.resetSettings()
    return settingsStore.getSettings()
  })
  
  ipcMain.handle('get-setting', (_event, key: keyof Settings) => {
    return settingsStore.getSetting(key)
  })
  
  ipcMain.handle('set-setting', (_event, key: keyof Settings, value: any) => {
    settingsStore.setSetting(key, value)
    return settingsStore.getSettings()
  })
}
```

### 3.3 Preload API (`preload/index.ts`)

```typescript
// Add to existing API interface
const api: API = {
  // ... existing methods ...
  
  // Settings methods
  getSettings(): Promise<Settings>
  updateSettings(updates: Partial<Settings>): Promise<Settings>
  resetSettings(): Promise<Settings>
  getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]>
  setSetting<K extends keyof Settings>(key: K, value: Settings[K]): Promise<Settings>
}
```

---

## 4. Backend API Endpoints (Django)

### 4.1 New/Updated Endpoints Needed

#### Get User Profile & Preferences
```
GET /api/users/{username}/profile/
- Returns: User profile data including preferences
- Response: { username, email, profile_image, default_mapping_visibility }
```

#### Update User Profile
```
PATCH /api/users/{username}/profile/
- Body: { email?, profile_image? }
- Returns: Updated profile data
```

#### Update User Preferences
```
PATCH /api/users/{username}/preferences/
- Body: { default_mapping_visibility? }
- Returns: Updated preferences
```

#### Change Password
```
POST /api/users/{username}/change-password/
- Body: { current_password, new_password, confirm_password }
- Returns: { success: true }
```

#### Delete Account
```
DELETE /api/users/{username}/account/
- Body: { password } (confirmation)
- Returns: { success: true }
```

### 4.2 Database Migrations Needed

1. Add `default_mapping_visibility` CharField to MyUser model

### 4.3 Serializer Updates

Update `MyUserProfileSeralizer` to include:
- `email`
- `default_mapping_visibility`

---

## 5. UI/UX Design

### 5.1 Page Layout

```
┌─────────────────────────────────────────┐
│ Settings                                │
├─────────────────────────────────────────┤
│                                         │
│  [Tabs Navigation]                      │
│  - Appearance                           │
│  - Application                         │
│  - Keyboard & Daemon                   │
│  - Privacy & Data                      │
│  - Notifications                       │
│  ─────────────────────────              │
│  - Profile (🔒 Logged-in only)         │
│  - Security (🔒 Logged-in only)        │
│  - Data Management (🔒 Logged-in only)  │
│                                         │
│  [Settings Content Area]               │
│  ┌─────────────────────────────────┐    │
│  │ Section Title                   │    │
│  │                                 │    │
│  │ Setting 1: [Toggle/Switch]     │    │
│  │ Setting 2: [Select/Dropdown]   │    │
│  │ Setting 3: [Input Field]       │    │
│  │                                 │    │
│  │ [Save Changes] [Reset]         │    │
│  └─────────────────────────────────┘    │
│                                         │
└─────────────────────────────────────────┘
```

### 5.2 Component Design

- Use **Tabs** component for section navigation
- Use **Card** components for each settings section
- Use **Switch** components for boolean toggles
- Use **Select** components for dropdown options
- Use **Input** components for text fields
- Use **Button** components for actions
- Use **Separator** to divide logged-in vs local sections
- Show **AlertDialog** for destructive actions (delete account, reset settings)
- Use **Toast** notifications for save confirmations

### 5.3 User Experience Features

1. **Auto-save**: Local settings save immediately on change
2. **Save Indicators**: Show "Saving..." / "Saved" status for account settings
3. **Validation**: Real-time validation for email, password fields
4. **Confirmation Dialogs**: For destructive actions (delete account, reset settings)
5. **Loading States**: Show loading spinners during API calls
6. **Error Handling**: Display friendly error messages with toast notifications
7. **Responsive Design**: Works well on different window sizes

---

## 6. Navigation Integration

### 6.1 Navbar Updates

Add "Settings" link to navbar:
- Icon: Settings icon from lucide-react
- Show for all users (both logged-in and non-logged-in)
- Add to `navLinks` array in `Navbar.tsx`

### 6.2 Route Configuration

Add route in `App.tsx`:
```typescript
<Route path="/settings" element={<Settings isAuthenticated={isAuthenticated} username={username} />} />
```

---

## 7. Implementation Steps

### Phase 1: Local Settings Infrastructure
1. ✅ Create `settings-store.ts` service in main process
2. ✅ Create `settings-ipc.ts` IPC handlers
3. ✅ Update `preload/index.ts` with settings API
4. ✅ Update `preload/index.d.ts` with settings types
5. ✅ Register settings handlers in `main/index.ts`

### Phase 2: Settings UI Components
1. ✅ Create `Settings.tsx` main page component
2. ✅ Create local settings components (Appearance, Application, Keyboard, Privacy, Notifications)
3. ✅ Implement settings persistence via IPC
4. ✅ Add route to App.tsx
5. ✅ Add Settings link to Navbar

### Phase 3: Account Settings
1. ✅ Create account settings components (Profile, Security, Data Management)
2. ✅ Update backend models (migrations)
3. ✅ Create/update API endpoints
4. ✅ Update `api-ipc.ts` with new account endpoints
5. ✅ Update `preload/index.ts` with account API methods
6. ✅ Implement account settings sync

### Phase 4: Integration & Polish
1. ✅ Add auto-start functionality
2. ✅ Implement minimize to tray
3. ✅ Add loading states and error handling
4. ✅ Implement confirmation dialogs
5. ✅ Add toast notifications
6. ✅ Test all settings persistence
7. ✅ Test account settings API integration

---

## 8. Settings Requirements Summary

### Local Settings (All Users)
- ✅ Theme selection (Light/Dark/System)
- ✅ Start on system boot
- ✅ Minimize to tray
- ✅ Auto-start keybinder
- ✅ Keybinder auto-restart
- ✅ Show keybinder status
- ✅ Analytics toggle
- ✅ System notifications toggle
- ✅ Layer switch notification toggle
- ✅ Default mapping visibility
- ✅ Auto-sync mappings

### Account Settings (Logged-in Users Only)
- ✅ Email display and update
- ✅ Profile image upload/update
- ✅ Default mapping visibility (synced)
- ✅ Change password
- ✅ Manual sync trigger
- ✅ Delete account

---

## 9. Security Considerations

1. **Password Change**: Require current password + validation
2. **Email Update**: Require email verification (future enhancement)
3. **Profile Image**: Validate file type and size on backend
4. **Account Deletion**: Require password confirmation + final warning
5. **API Endpoints**: All account endpoints require authentication
6. **Settings Storage**: Use Electron's secure storage where appropriate

---

## 10. Electron-Specific Features

### 10.1 System Integration
- **Start on Boot**: Use `app.setLoginItemSettings()` with `openAtLogin: true`
- **Minimize to Tray**: Implement system tray icon and minimize behavior
- **Native Theme**: Use `nativeTheme` API for system theme detection

### 10.2 File Operations
- **Profile Image Upload**: Use `dialog.showOpenDialog()` for file selection
- **Settings Storage**: Use `app.getPath('userData')` for settings file location

---

## 11. Future Enhancements

- Email verification workflow
- Two-factor authentication
- Advanced keyboard customization (key repeat delay, etc.)
- Theme customization (custom colors)
- Keyboard shortcut preferences
- Backup/restore settings
- Import/export settings
- Settings sync across devices (for logged-in users)

---

## 12. Technical Notes

### Storage Pattern
- Settings stored in `{userData}/settings.json` similar to `profiles.json`
- Account settings cached locally but synced with backend
- Use Electron's `safeStorage` for sensitive settings if needed

### IPC Pattern
- Follow existing pattern: Main process → IPC handlers → Preload → Renderer
- Register handlers in `main/index.ts` similar to profile handlers
- Use `ipcMain.handle()` for async operations

### Code Organization
- Follow existing code patterns from `profile-store.ts` and `profile-ipc.ts`
- Use existing UI components from `components/ui/` directory
- Follow React Router patterns from existing pages
- Use toast notifications from `sonner` (already imported)

### Error Handling
- Use `electron-log` for logging in main process
- Use console.log/error in renderer process
- Show user-friendly error messages via toast notifications
- Handle network errors gracefully

---

## Notes

- All local settings use JSON file storage in userData directory
- Account settings sync to backend and cache in settings.json
- Settings page accessible to all users (with different sections shown)
- Use existing UI components from `components/ui/` directory
- Follow existing code patterns from `MyMappings.tsx` and `Login.tsx`
- Use toast notifications from `sonner` for user feedback
- Electron-specific features leverage native APIs where possible

