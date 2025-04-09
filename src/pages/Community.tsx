
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Heart, ArrowUpRight, User, Clock, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mapping = {
  id: string;
  title: string;
  description: string;
  author: string;
  downloadCount: number;
  likeCount: number;
  timeAgo: string;
  isLiked: boolean;
  tags: string[];
};

const dummyMappings: Mapping[] = [
  {
    id: '1',
    title: 'Vim-style Navigation',
    description: 'Transform any editor into Vim with these keyboard shortcuts',
    author: 'vimmaster',
    downloadCount: 3452,
    likeCount: 872,
    timeAgo: '2 days ago',
    isLiked: false,
    tags: ['editor', 'productivity', 'vim']
  },
  {
    id: '2',
    title: 'Gamer Pro Setup',
    description: 'Optimized key mappings for FPS and MOBA games',
    author: 'progamer123',
    downloadCount: 1892,
    likeCount: 425,
    timeAgo: '1 week ago',
    isLiked: true,
    tags: ['gaming', 'fps', 'moba']
  },
  {
    id: '3',
    title: 'Designer Workflow',
    description: 'Custom shortcuts for Figma, Photoshop and Illustrator',
    author: 'designhub',
    downloadCount: 978,
    likeCount: 301,
    timeAgo: '3 days ago',
    isLiked: false,
    tags: ['design', 'figma', 'photoshop']
  },
  {
    id: '4',
    title: 'Ergonomic Typing',
    description: 'Remap your keyboard for less finger movement and better ergonomics',
    author: 'ergouser',
    downloadCount: 761,
    likeCount: 284,
    timeAgo: '5 days ago',
    isLiked: false,
    tags: ['ergonomic', 'health', 'typing']
  },
  {
    id: '5',
    title: 'Code Ninja',
    description: 'VS Code optimized shortcuts for JavaScript development',
    author: 'jsdev',
    downloadCount: 2045,
    likeCount: 512,
    timeAgo: '2 weeks ago',
    isLiked: false,
    tags: ['development', 'vscode', 'javascript']
  },
  {
    id: '6',
    title: 'Mac to Windows',
    description: 'Make your Windows PC feel like a Mac with these key mappings',
    author: 'platformswitcher',
    downloadCount: 1532,
    likeCount: 347,
    timeAgo: '1 month ago',
    isLiked: true,
    tags: ['mac', 'windows', 'productivity']
  },
];

const filters = [
  'All',
  'Popular',
  'Recent',
  'Gaming',
  'Productivity',
  'Design',
  'Development',
];

const Community = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [mappings, setMappings] = useState(dummyMappings);

  const handleLike = (id: string) => {
    setMappings(mappings.map(mapping => {
      if (mapping.id === id) {
        return {
          ...mapping,
          isLiked: !mapping.isLiked,
          likeCount: mapping.isLiked ? mapping.likeCount - 1 : mapping.likeCount + 1
        };
      }
      return mapping;
    }));
  };

  const filteredMappings = mappings.filter(mapping => {
    if (searchQuery) {
      return (
        mapping.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (selectedFilter !== 'All') {
      return mapping.tags.some(tag => 
        tag.toLowerCase() === selectedFilter.toLowerCase()
      );
    }
    
    return true;
  });

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
                variant={selectedFilter === filter ? "default" : "outline"}
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
                  <CardTitle>{mapping.title}</CardTitle>
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
                    <span className="mr-4">{mapping.author}</span>
                    <Clock size={14} className="mr-1" />
                    <span>{mapping.timeAgo}</span>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 flex justify-between">
                  <div className="flex gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        "flex items-center gap-1",
                        mapping.isLiked && "text-red-500"
                      )}
                      onClick={() => handleLike(mapping.id)}
                    >
                      <Heart size={16} fill={mapping.isLiked ? "currentColor" : "none"} />
                      <span>{mapping.likeCount}</span>
                    </Button>
                    
                    <Button size="sm" variant="ghost" className="flex items-center gap-1">
                      <Download size={16} />
                      <span>{mapping.downloadCount}</span>
                    </Button>
                  </div>
                  
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
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
  );
};

export default Community;
