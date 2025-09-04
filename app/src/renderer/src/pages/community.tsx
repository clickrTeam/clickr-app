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
import { Profile } from '../../../models/Profile'
import log from 'electron-log'

type Mapping = {
  id: string
  user: string
  name: string
  description: string
  mappings: Profile
  updated_at: string
  lastEdited: string
  keyCount: number
  isActive: boolean
  isPublic: boolean
  numLikes: number
  numDownloads: number
  tags: Array<string>
}
const filters = ['All', 'Popular', 'Recent', 'Gaming', 'Productivity', 'Design', 'Development']

const Community = ({
  onViewDetails
}: {
  onViewDetails: (mappingId: string) => void;
}): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [mappings, setMappings] = useState<Mapping[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCommunityMappings = async (): Promise<void> => {
    try {
      setIsLoading(true)
      // Use the IPC bridge instead of direct API call
      const data = await window.api.fetchCommunityMappings()
      setMappings(data)
      updateLastEdited()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mappings')
    } finally {
      setIsLoading(false)
    }
  }

  const updateLastEdited = (): void => {
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
  const handleLike = (id: string): void => {
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
    if (isLoading) log.info('Loading mappings...')
    if (error) log.error('Error fetching mappings:', error)
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
                  <CardDescription>
                    <span className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground m-0">
                        {mapping.description}
                      </span>
                      {mapping.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
                        >
                          {tag}
                        </span>
                      ))}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
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

                  <Button
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => onViewDetails(mapping.id)}
                  >
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
