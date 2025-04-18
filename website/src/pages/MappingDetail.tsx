
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Download, Copy, Keyboard } from 'lucide-react';

type KeyMapping = {
  sourceKey: string;
  targetKey: string;
  description?: string;
};

type MappingDetails = {
  id: string;
  name: string;
  description: string;
  lastEdited: string;
  isActive: boolean;
  keyMappings: KeyMapping[];
};

const dummyMappingDetails: Record<string, MappingDetails> = {
  '1': {
    id: '1',
    name: 'Work Setup',
    description: 'Key mappings for productivity software',
    lastEdited: '2 hours ago',
    isActive: true,
    keyMappings: [
      { sourceKey: 'Caps Lock', targetKey: 'Escape', description: 'Easy access to Escape key' },
      { sourceKey: 'Alt + J', targetKey: 'Left Arrow', description: 'Vim-style left navigation' },
      { sourceKey: 'Alt + K', targetKey: 'Down Arrow', description: 'Vim-style down navigation' },
      { sourceKey: 'Alt + L', targetKey: 'Right Arrow', description: 'Vim-style right navigation' },
      { sourceKey: 'Alt + I', targetKey: 'Up Arrow', description: 'Vim-style up navigation' },
      { sourceKey: 'Ctrl + Space', targetKey: 'F2', description: 'Quick rename in code editors' },
      { sourceKey: 'Win + E', targetKey: 'Alt + Tab', description: 'Fast app switching' },
      { sourceKey: 'Right Alt', targetKey: 'F12', description: 'Show definition in code editors' },
      { sourceKey: 'F1', targetKey: 'Ctrl + S', description: 'Quick save' },
      { sourceKey: 'Alt + X', targetKey: 'Ctrl + W', description: 'Close current window/tab' },
      { sourceKey: 'Alt + Z', targetKey: 'Ctrl + Z', description: 'Undo' },
      { sourceKey: 'Alt + Y', targetKey: 'Ctrl + Y', description: 'Redo' },
    ]
  },
  '2': {
    id: '2',
    name: 'Gaming Profile',
    description: 'Optimized for FPS games',
    lastEdited: '2 days ago',
    isActive: false,
    keyMappings: [
      { sourceKey: 'Caps Lock', targetKey: 'F', description: 'Use ability' },
      { sourceKey: 'Mouse 4', targetKey: 'Q', description: 'Primary ability' },
      { sourceKey: 'Mouse 5', targetKey: 'E', description: 'Secondary ability' },
      { sourceKey: 'Tab', targetKey: 'Alt', description: 'Show scoreboard' },
      { sourceKey: 'Alt', targetKey: 'X', description: 'Ping location' },
      { sourceKey: 'J', targetKey: 'Alt + F4', description: 'Emergency exit' },
      { sourceKey: 'Scroll Lock', targetKey: 'PrintScreen', description: 'Screenshot' },
      { sourceKey: 'Shift', targetKey: 'Ctrl', description: 'Crouch' },
    ]
  }
};

const MappingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [mapping, setMapping] = useState<MappingDetails | undefined>(
    id ? dummyMappingDetails[id] : undefined
  );

  if (!mapping) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Mapping not found</h2>
          <Button asChild>
            <Link to="/my-mappings">Back to My Mappings</Link>
          </Button>
        </div>
      </div>
    );
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
            <Link 
              to="/my-mappings"
              className="text-muted-foreground hover:text-foreground flex items-center mb-4"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to My Mappings
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold">{mapping.name}</h1>
                  {mapping.isActive && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{mapping.description}</p>
                <p className="text-sm text-muted-foreground mt-1">Last edited: {mapping.lastEdited}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <Link to={`/mapping/${mapping.id}/edit`}>
                    <Edit size={14} /> Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Copy size={14} /> Clone
                </Button>
                <Button size="sm" className="gap-1">
                  <Download size={14} /> Export
                </Button>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Keyboard size={20} />
                <h2 className="text-xl font-semibold">Key Mappings</h2>
                <Badge variant="secondary">
                  {mapping.keyMappings.length} {mapping.keyMappings.length === 1 ? 'mapping' : 'mappings'}
                </Badge>
              </div>

              <motion.div
                className="border rounded-md overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Source Key</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Target Key</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mapping.keyMappings.map((keyMapping, index) => (
                      <motion.tr 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="hover:bg-muted/30"
                      >
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono text-xs">
                            {keyMapping.sourceKey}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="font-mono text-xs">
                            {keyMapping.targetKey}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {keyMapping.description}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MappingDetail;
