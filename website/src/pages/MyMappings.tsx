import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MoreHorizontal,
  Share,
  Trash2,
  ArrowUpRight,
  Keyboard,
  Pencil,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  get_user_mappings,
  create_new_mapping,
  delete_mapping,
  rename_mapping,
  update_mapping_visibility,
  } from "@/api/endpoints";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type Mapping = {
  id: string;
  user: string;
  name: string;
  description: string;
  mappings: Record<string, string>; // Object to store key-value pairs of mappings
  updated_at: string;
  lastEdited: string;
  keyCount: number;
  is_active: boolean;
  is_public: boolean;
  numLikes: number;
  numDownloads: number;
  tags: Array<string>;
};

const MyMappings = () => {
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  const [newMappingName, setNewMappingName] = useState("");
  const [newMappingDesc, setNewMappingDesc] = useState("");
  const [newMappingTags, setNewMappingTags] = useState<string[]>([]);
  const [newMappingJson, setNewMappingJson] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [renamingMappingId, setRenamingMappingId] = useState<string | null>(null);
  const [modifiedMappingName, setModifiedMappingName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const username = user?.username;

  useEffect(() => {
    fetchMappings();
  }, []);

  const updateMappingCounts = () => {
    setMappings((currentMappings) =>
      currentMappings.map((mapping) => ({
        ...mapping,
        keyCount: Object.keys(mapping.mappings || {}).length - 1,
      }))
    );
  };

  const updateLastEdited = () => {
    setMappings((currentMappings) =>
      currentMappings.map((mapping) => {
        const updatedDate = new Date(mapping.updated_at);
        const now = new Date();
        const diffHours = Math.floor(
          (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60)
        );
        const diffDays = Math.floor(diffHours / 24);

        let lastEdited;
        if (diffHours < 1) {
          lastEdited = "Just now";
        } else if (diffHours < 24) {
          lastEdited = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
        } else {
          lastEdited = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
        }

        return {
          ...mapping,
          lastEdited,
        };
      })
    );
  };
  const fetchMappings = async () => {
    try {
      setIsLoading(true);
      const data = await get_user_mappings(username);
      setMappings(data);
      updateMappingCounts();
      updateLastEdited();
      console.log(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch mappings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMapping = async () => {
    if (!newMappingName.trim()) return;

    try {
      let parsedMappings = {};
      if (newMappingJson.trim()) {
        try {
          parsedMappings = JSON.parse(newMappingJson);
          if (typeof parsedMappings !== "object") {
            throw new Error("JSON must be an object");
          }
        } catch (e) {
          return;
        }
      }

      const mappingData = {
        name: newMappingName,
        description: newMappingDesc,
        mappings: parsedMappings,
        is_active: false,
        is_public: false,
        num_likes: 0,
        num_downloads: 0,
        tags: newMappingTags,
      };
      await create_new_mapping(username, mappingData);
      await fetchMappings(); // Refresh the mappings list

      setNewMappingName("");
      setNewMappingDesc("");
      setNewMappingJson("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create mapping:", error);
    }
  };

  const handleDeleteMapping = async (id: string) => {
    try {
      await delete_mapping(username, id);
      // After successful deletion, remove from local state
      setMappings(mappings.filter((mapping) => mapping.id !== id));
      toast.success('Mapping deleted successfully');
    } catch (error) {
      console.error("Failed to delete mapping:", error);
      toast.error('Failed to delete mapping');
    }
  };

    const copyToClipboard = async (mappingId: string) => {
    try {
      await navigator.clipboard.writeText(`https://clickr-web.vercel.app/community/mapping/${mappingId}`);
      toast.success('Mapping link copied to clipboard', {
        style: { background: '#22c55e', color: 'white' },
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy mapping link to clipboard');
    }
  };

  const handleRenameMapping = async (id: string, newName: string) => {
    try {
      await rename_mapping(id, newName);
      toast.success('Mapping renamed successfully');
    } catch (error) {
      toast.error('Failed to rename mapping');
    }
  }

  const filteredMappings = mappings.filter((mapping) => {
    if (!searchQuery) return true;
    return (
      mapping.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mapping.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Mappings</h1>
              <p className="text-muted-foreground">
                Create and manage your keyboard mapping profiles
              </p>
            </div>

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button size="lg" className="flex items-center gap-2">
                  <Plus size={16} /> Create New Mapping
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Mapping</DialogTitle>
                  <DialogDescription>
                    Give your mapping a name and description to help you
                    identify it later.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="My Custom Mapping"
                      className="col-span-3"
                      value={newMappingName}
                      onChange={(e) => setNewMappingName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Optional description"
                      className="col-span-3"
                      value={newMappingDesc}
                      onChange={(e) => setNewMappingDesc(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      placeholder="Enter tags separated by commas"
                      className="col-span-3"
                      value={newMappingTags}
                      onChange={(e) =>
                        setNewMappingTags(
                          e.target.value.split(",").map((tag) => tag.trim())
                        )
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="JSON Config" className="text-right">
                    JSON Config
                  </Label>
                  <div className="col-span-3">
                    <textarea
                      id="json"
                      placeholder='Optional JSON mappings (e.g., {"a": "b"})'
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                      value={newMappingJson}
                      onChange={(e) => {
                        setNewMappingJson(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateMapping}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Rename Dialog */}
          <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Rename Mapping</DialogTitle>
                <DialogDescription>
                  Enter a new name for your mapping.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">New Name</Label>
                  <Input
                    id="new-name"
                    placeholder="Enter new name"
                    value={modifiedMappingName}
                    onChange={(e) => setModifiedMappingName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsRenaming(false);
                    setModifiedMappingName("");
                    setRenamingMappingId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (renamingMappingId) {
                      handleRenameMapping(renamingMappingId, modifiedMappingName);
                    }
                    setIsRenaming(false);
                    setModifiedMappingName("");
                    setRenamingMappingId(null);
                    fetchMappings();
                  }}
                  disabled={!modifiedMappingName.trim()}
                >
                  Rename
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="relative max-w-xl mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search mappings..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {filteredMappings.length > 0 ? (
              filteredMappings.map((mapping, index) => (
                <motion.div
                  key={mapping.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    className={`hover:shadow-md transition-shadow ${
                      mapping.is_public ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {mapping.name}
                            {mapping.is_public && (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                Public
                              </span>
                            )}
                          </CardTitle>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground m-0">
                              {mapping.description}
                            </p>
                            {mapping.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setRenamingMappingId(mapping.id);
                                setModifiedMappingName(mapping.name);
                                setIsRenaming(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                await update_mapping_visibility(mapping.id, !mapping.is_public);
                                await fetchMappings();
                              }}
                            >
                              <Globe className="mr-2 h-4 w-4" />
                              {mapping.is_public ? "Hide" : "Publish"}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyToClipboard(mapping.id)}>
                              <Share className="mr-2 h-4 w-4" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteMapping(mapping.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-2 mb-4 mt-1">
                  </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Last edited: {mapping.lastEdited}</span>
                        <span>{mapping.keyCount < 0 ? 0 : mapping.keyCount} Layers</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" asChild>
                        <Link
                          to={`/mapping/${mapping.id}`}
                          className="flex items-center justify-center gap-2"
                        >
                          View Details
                          <ArrowUpRight size={14} />
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="col-span-2 text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Keyboard className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">No mappings found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "No mappings match your search criteria"
                    : "You haven't created any keyboard mappings yet"}
                </p>
                <Button onClick={() => setIsCreating(true)}>
                  Create your first mapping
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MyMappings;
