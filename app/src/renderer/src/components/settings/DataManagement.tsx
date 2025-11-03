import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@renderer/components/ui/dialog'

interface DataManagementProps {
  username?: string
}

const DataManagement = ({ username }: DataManagementProps): JSX.Element => {
  const navigate = useNavigate()
  const [isSyncing, setIsSyncing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletePassword, setDeletePassword] = useState<string>('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSyncNow = async (): Promise<void> => {
    if (!username) {
      toast.error('Username is required')
      return
    }

    setIsSyncing(true)
    try {
      await window.api.syncMappings(username)
      toast.success('Mappings synced successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync mappings'
      toast.error('Failed to sync mappings', {
        description: errorMessage
      })
    } finally {
      setIsSyncing(false)
    }
  }

  const handleDeleteAccount = (): void => {
    setShowDeleteDialog(true)
  }

  const confirmDeleteAccount = async (): Promise<void> => {
    if (!username) {
      toast.error('Username is required')
      return
    }

    if (!deletePassword) {
      toast.error('Password is required to delete account')
      return
    }

    setIsDeleting(true)
    try {
      await window.api.deleteAccount(username, deletePassword)
      toast.success('Account deleted successfully')
      // Navigate to home page - user will be logged out automatically
      navigate('/')
      // Reload the app to clear all state
      window.location.reload()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete account'
      toast.error('Failed to delete account', {
        description: errorMessage
      })
      setShowDeleteDialog(false)
      setDeletePassword('')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your account data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-lg">Sync Now</CardTitle>
              <CardDescription>Manually trigger sync with cloud</CardDescription>
            </div>
            <Button onClick={handleSyncNow} disabled={isSyncing}>
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </div>

          <div className="border-t pt-6">
            <div className="space-y-2">
              <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
              <CardDescription>Permanently delete your account and all data</CardDescription>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your account and remove
              all your data from our servers. Please enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="deletePassword">Password</Label>
            <Input
              id="deletePassword"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false)
                setDeletePassword('')
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteAccount}
              disabled={isDeleting || !deletePassword}
              variant="destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default DataManagement
