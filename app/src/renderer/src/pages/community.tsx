import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@renderer/components/ui/card'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Search, Heart, ArrowUpRight, User, Clock, Download } from 'lucide-react'
import { cn } from '@renderer/lib/utils'

type Mapping = {
  id: string
  user: string
  name: string
  description: string
  mappings: Record<string, string> // Object to store key-value pairs of mappings
  updated_at: string
  lastEdited: string
  keyCount: number
  isActive: boolean
  isPublic: boolean
  numLikes: number
  numDownloads: number
  tags: Array<string>
}
const dummyMappings: Mapping[] = [
  {
    id: '1',
    name: 'Vim-style Navigation',
    description: 'Transform any editor into Vim with these keyboard shortcuts',
    user: 'vimmaster',
    mappings: {},
    isActive: false,
    isPublic: true,
    updated_at: new Date().toISOString(),
    lastEdited: '2 days ago',
    keyCount: 24,
    numDownloads: 3452,
    numLikes: 872,
    tags: ['editor', 'productivity', 'vim']
  },
  {
    id: '2',
    name: 'Gamer Pro Setup',
    description: 'Optimized key mappings for FPS and MOBA games',
    user: 'progamer123',
    mappings: {},
    isActive: false,
    isPublic: true,
    updated_at: new Date().toISOString(),
    lastEdited: '1 week ago',
    keyCount: 35,
    numDownloads: 1892,
    numLikes: 425,
    tags: ['gaming', 'fps', 'moba']
  },
  {
    id: '3',
    name: 'Designer Workflow',
    description: 'Custom shortcuts for Figma, Photoshop and Illustrator',
    user: 'designhub',
    mappings: {},
    isActive: false,
    isPublic: true,
    updated_at: new Date().toISOString(),
    lastEdited: '3 days ago',
    keyCount: 42,
    numDownloads: 978,
    numLikes: 301,
    tags: ['design', 'figma', 'photoshop']
  },
  {
    id: '4',
    name: 'Ergonomic Typing',
    description: 'Remap your keyboard for less finger movement and better ergonomics',
    user: 'ergouser',
    mappings: {},
    isActive: false,
    isPublic: true,
    updated_at: new Date().toISOString(),
    lastEdited: '5 days ago',
    keyCount: 28,
    numDownloads: 761,
    numLikes: 284,
    tags: ['ergonomic', 'health', 'typing']
  },
  {
    id: '5',
    name: 'Code Ninja',
    description: 'VS Code optimized shortcuts for JavaScript development',
    user: 'jsdev',
    mappings: {},
    isActive: false,
    isPublic: true,
    updated_at: new Date().toISOString(),
    lastEdited: '2 weeks ago',
    keyCount: 56,
    numDownloads: 2045,
    numLikes: 512,
    tags: ['development', 'vscode', 'javascript']
  },
  {
    id: '6',
    name: 'Mac to Windows',
    description: 'Make your Windows PC feel like a Mac with these key mappings',
    user: 'platformswitcher',
    mappings: {},
    isActive: false,
    isPublic: true,
    updated_at: new Date().toISOString(),
    lastEdited: '1 month ago',
    keyCount: 32,
    numDownloads: 1532,
    numLikes: 347,
    tags: ['mac', 'windows', 'productivity']
  }
]
const filters = ['All', 'Popular', 'Recent', 'Gaming', 'Productivity', 'Design', 'Development']

const Community = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [mappings, setMappings] = useState<Mapping[]>(dummyMappings)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunityMappings = async () => {
    try {
      setIsLoading(true)
      // Use the IPC bridge instead of direct API call
      const data = await window.api.fetchCommunityMappings()
      console.log(data)
      setMappings(data)
      updateLastEdited()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mappings')
    } finally {
      setIsLoading(false)
    }
  }

  const updateLastEdited = () => {
    setMappings((currentMappings) =>
      currentMappings.map((mapping) => {
        const updatedDate = new Date(mapping.updated_at)
        const now = new Date()
        const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)

        let lastEdited
        if (diffHours < 1) {
          lastEdited = 'Just now'
        } else if (diffHours < 24) {
          lastEdited = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
        } else {
          lastEdited = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
        }

        return {
          ...mapping,
          lastEdited
        }
      })
    )
  }

  useEffect(() => {
    fetchCommunityMappings()
  }, [])
  const handleLike = (id: string) => {
    setMappings(
      mappings.map((mapping) => {
        if (mapping.id === id) {
          return {
            ...mapping,
            likeCount: mapping.numLikes ? mapping.numLikes - 1 : mapping.numLikes + 1
          }
        }
        return mapping
      })
    )
  }

  const filteredMappings = mappings.filter((mapping) => {
    if (searchQuery) {
      return (
        mapping.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (selectedFilter !== 'All') {
      return mapping.tags.some((tag) => tag.toLowerCase() === selectedFilter.toLowerCase())
    }

    return true
  })

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">Community Mappings</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover and share keyboard mappings created by the Clickr community
          </p>

          <div className="relative max-w-xl mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search mappings..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredMappings.map((mapping, index) => (
            <motion.div
              key={mapping.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{mapping.name}</CardTitle>
                  <CardDescription>{mapping.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mapping.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <User size={14} className="mr-1" />
                    <span className="mr-4">{mapping.user}</span>
                    <Clock size={14} className="mr-1" />
                    <span>{mapping.lastEdited}</span>
                  </div>
                </CardContent>

                <CardFooter className="border-t pt-4 flex justify-between">
                  <div className="flex gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn('flex items-center gap-1')}
                      onClick={() => handleLike(mapping.id)}
                    >
                      <Heart size={16} fill={'none'} />
                      <span>{mapping.numLikes ?? 0}</span>
                    </Button>

                    <Button size="sm" variant="ghost" className="flex items-center gap-1">
                      <Download size={16} />
                      <span>{mapping.numDownloads ?? 0}</span>
                    </Button>
                  </div>

                  <Button size="sm" className="flex items-center gap-1">
                    Details
                    <ArrowUpRight size={14} />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Community
