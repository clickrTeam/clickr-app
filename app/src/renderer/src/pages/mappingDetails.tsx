import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'
import { Badge } from '@renderer/components/ui/badge'
import {
  ArrowLeft,
  Download,
  Copy,
  Keyboard,
  Layers,
  TriangleAlert,
  Heart,
  Share,
  Tag
} from 'lucide-react'
import { useEffect } from 'react'

import { toast } from '@renderer/sonner'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@renderer/components/ui/dialog'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'

type Trigger = {
  type: string
  value?: string
  key_time_pairs?: [string, number][]
  behavior?: string
}

type Bind = {
  type: string
  value?: string | number
}

type Remapping = {
  trigger: Trigger
  bind: Bind
}

type Layer = {
  layer_name: string
  layer_number: number
  remappings: Remapping[]
}

type MappingLayers = {
  layers: Layer[]
  layer_count: number
  profile_name: string
}

type MappingDetails = {
  id: string
  user: string
  name: string
  description: string
  mappings: MappingLayers
  updated_at: string
  keyCount: number
  is_active: boolean
  is_public: boolean
  numLikes: number
  numDownloads: number
  tags: Array<string>
}

const MappingDetail = () => {
  //const { id } = useParams<{ id: string }>()
  const [mapping, setMapping] = useState<MappingDetails>()
  const [isLoading, setIsLoading] = useState(true)
  const [remappings, setRemappings] = useState<Layer[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newMappingTags, setNewMappingTags] = useState<string[]>([])
  //const navigate = useNavigate()
  //const { user } = useAuth()

  // Determine if this is viewed from community or personal context
  const isFromCommunity = window.location.pathname.includes('/community/')
  //const currentUser = user?.username
  // Check if current user owns this mapping
  //const isOwnMapping = mapping?.user === currentUser

  useEffect(() => {
    const fetchMapping = async () => {
      try {
        setIsLoading(true)
        const mapping = await window.api.fetchSpecificMapping(id)
        setMapping(mapping)
        setRemappings(mapping?.mappings?.layers || [])
      } catch (error) {
        console.error('Error fetching mapping:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchMapping()
    //Todo: Add id to dependencies
  }, [])

  useEffect(() => {
    if (mapping?.tags) {
      setNewMappingTags([...mapping.tags])
    }
  }, [mapping])

  const formatLastEdited = (updatedAt: string) => {
    const updatedDate = new Date(updatedAt)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    let lastEdited: string
    if (diffHours < 1) {
      lastEdited = 'Just now'
    } else if (diffHours < 24) {
      lastEdited = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    } else {
      lastEdited = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    }
    return lastEdited
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!mapping) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mapping not found</h2>
          <Button asChild>
            {/* TODO: Add back to my mappings */}
            {/* <Link to="/my-mappings">Back to My Mappings</Link> */}
          </Button>
        </div>
      </div>
    )
  }

  const copyToClipboard = async (mappingId: string) => {
    try {
      // TODO: Figure out if this works or fix it
      await navigator.clipboard.writeText(
        `https://clickr-web.vercel.app/community/mapping/${mappingId}`
      )
      toast.success('Mapping link copied to clipboard', {
        style: { background: '#22c55e', color: 'white' }
      })
    } catch (err) {
      console.error('Failed to copy text: ', err)
      toast.error('Failed to copy mapping link to clipboard')
    }
  }

  const downloadMapping = async (mappingId: string) => {
    try {
      const response = await window.api.fetchSpecificMapping(mappingId)
      const jsonStr = JSON.stringify(response.mappings, null, 2)
      const link = document.createElement('a')
      link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr)
      link.download = `${response.name || 'mapping'}.json`
      link.click()
      return response
    } catch (error) {
      console.error('Failed to download mapping: ', error)
    }
  }

  const handleAddTags = async (mappingId: string, tags: string[]) => {
    try {
      await window.api.addTags(mappingId, tags)
      toast.success('Tags updated successfully', {
        style: { background: '#22c55e', color: 'white' }
      })
    } catch (error) {
      console.error('Failed to add tags: ', error)
    }
  }

  const duplicateMapping = async () => {
    try {
      const mappingData = {
        name: mapping.name + ' (Copy)',
        description: mapping.description,
        mappings: mapping.mappings,
        is_active: false,
        is_public: false,
        num_likes: 0,
        num_downloads: 0,
        tags: mapping.tags
      }
      console.log(mappingData)
      // TODO: Add current user and change from TEST_USER
      await window.api.createNewMapping('TEST_USER', mappingData)
      toast.success('Mapping duplicated successfully', {
        style: { background: '#22c55e', color: 'white' }
      })
      // TODO: Add my mappings view navigation
      //   navigate(`/my-mappings`)
    } catch (error) {
      console.error('Failed to duplicate mapping: ', error)
    }
  }

  const importMapping = async () => {
    try {
      const mappingData = {
        name: mapping.name + ' (Imported)',
        description: mapping.description,
        mappings: mapping.mappings,
        is_active: false,
        is_public: false,
        num_likes: 0,
        num_downloads: 0,
        tags: mapping.tags
      }
      // TODO: Add current user and change from TEST_USER
      await window.api.createNewMapping('TEST_USER', mappingData)
      toast.success('Mapping imported successfully', {
        style: { background: '#22c55e', color: 'white' }
      })
      // TODO: Add my mappings view navigation
      //   navigate(`/my-mappings`)
    } catch (error) {
      console.error('Failed to import mapping: ', error)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            {/* <Link
              to={isFromCommunity ? '/community' : '/my-mappings'}
              className="text-muted-foreground hover:text-foreground flex items-center mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              {isFromCommunity ? 'Back to Community' : 'Back to My Mappings'}
            </Link> */}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold pb-1">{mapping.name}</h1>
                <p className="text-muted-foreground">{mapping.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last edited: {formatLastEdited(mapping.updated_at)}
                </p>
              </div>

              <div className="flex gap-2">
                {/* {isFromCommunity && !isOwnMapping ? ( */}
                {true ? (
                  // Community mapping buttons (not owned by current user)
                  <>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Heart size={14} /> Like
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => copyToClipboard(mapping.id)}
                    >
                      <Share size={14} /> Share
                    </Button>
                    <Button size="sm" className="gap-1" onClick={() => importMapping()}>
                      <Download size={14} /> Import
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1">
                      <TriangleAlert size={14} /> Report
                    </Button>
                  </>
                ) : (
                  // Personal mapping buttons (owned by current user)
                  <>
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1">
                          <Tag size={14} /> Edit Tags
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Tags</DialogTitle>
                          <DialogDescription>
                            Edit tags to your mapping to help you and others identify it later.
                            <br />
                            *Hint: Use dashes or underscores instead of spaces.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                              Edit Tags
                            </Label>
                            <Input
                              id="tags"
                              placeholder="Enter tags separated by commas"
                              className="col-span-3"
                              value={newMappingTags ? newMappingTags.join(', ') : ''}
                              onChange={(e) =>
                                setNewMappingTags(
                                  e.target.value.split(',').map((tag) => tag.trim())
                                )
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsCreating(false)
                                setNewMappingTags([])
                              }}
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                          <Button
                            onClick={() => {
                              handleAddTags(mapping.id, newMappingTags)
                              setNewMappingTags([])
                              setIsCreating(false)
                            }}
                          >
                            Add
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => duplicateMapping()}
                    >
                      <Copy size={14} /> Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => copyToClipboard(mapping.id)}
                    >
                      <Share size={14} /> Share
                    </Button>
                    <Button size="sm" className="gap-1" onClick={() => downloadMapping(mapping.id)}>
                      <Download size={14} /> Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard size={20} />
                <h2 className="text-xl font-semibold">Key Mappings</h2>
                <Badge variant="secondary">
                  {remappings.reduce((acc, layer) => acc + layer.remappings.length, 0)} mappings
                </Badge>
              </div>
              {remappings.map((layer) => (
                <div key={layer.layer_number} className="mb-6">
                  <div className="font-bold mb-2 flex items-center gap-2">
                    <Layers size={16} /> {layer.layer_name}
                    <Badge variant="outline">Layer {layer.layer_number}</Badge>
                  </div>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Trigger
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                            Bind
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {layer.remappings.map((remap, remapIdx) => (
                          <motion.tr
                            key={remapIdx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.05 * remapIdx
                            }}
                            className="hover:bg-muted/30"
                          >
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="font-mono text-xs">
                                {remap.trigger.type}
                                {remap.trigger.value ? `: ${remap.trigger.value}` : ''}
                                {remap.trigger.key_time_pairs
                                  ? `: ${remap.trigger.key_time_pairs
                                      .map(([k, t]) => `${k} (${t}ms)`)
                                      .join(', ')}`
                                  : ''}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="font-mono text-xs">
                                {remap.bind.type}
                                {remap.bind.value ? `: ${remap.bind.value}` : ''}
                              </Badge>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default MappingDetail
