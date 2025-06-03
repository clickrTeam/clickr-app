import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Download,
  Copy,
  Keyboard,
  Layers,
  Plus,
  TriangleAlert,
  Heart,
  Share,
} from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

type Trigger = {
  type: string;
  value?: string;
  key_time_pairs?: [string, number][];
  behavior?: string;
};

type Bind = {
  type: string;
  value?: string | number;
};

type Remapping = {
  trigger: Trigger;
  bind: Bind;
};

type Layer = {
  layer_name: string;
  layer_number: number;
  remappings: Remapping[];
};

type MappingLayers = {
  layers: Layer[];
  layer_count: number;
  profile_name: string;
};

type MappingDetails = {
  id: string;
  user: string;
  name: string;
  description: string;
  mappings: MappingLayers;
  updated_at: string;
  keyCount: number;
  isActive: boolean;
  isPublic: boolean;
  numLikes: number;
  numDownloads: number;
  tags: Array<string>;
};

const MappingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [mapping, setMapping] = useState<MappingDetails>();
  const [isLoading, setIsLoading] = useState(true);
  const [remappings, setRemappings] = useState<Layer[]>([]);
  const { user } = useAuth();

  // Determine if this is viewed from community or personal context
  // You can determine this from the route path or add a prop
  const isFromCommunity = window.location.pathname.includes("/community/");
  console.log(isFromCommunity);
  const currentUser = user?.username;
  // Check if current user owns this mapping
  const isOwnMapping = mapping?.user === currentUser;

  useEffect(() => {
    const fetchMapping = async () => {
      try {
        // Get the mapping from localStorage
        const storedMappings = localStorage.getItem("mappings");
        if (storedMappings) {
          const parsedMappings = JSON.parse(storedMappings);
          const foundMapping = parsedMappings.find(
            (m: MappingDetails) => m.id.toString() === id
          );
          setMapping(foundMapping);
          // Set remappings to the layers array
          setRemappings(foundMapping?.mappings?.layers || []);
        }
      } catch (error) {
        console.error("Error fetching mapping:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapping();
  }, [id]);

  const formatLastEdited = (updatedAt: string) => {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60)
    );
    const diffDays = Math.floor(diffHours / 24);
    let lastEdited: string;
    if (diffHours < 1) {
      lastEdited = "Just now";
    } else if (diffHours < 24) {
      lastEdited = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else {
      lastEdited = `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
    return lastEdited;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading...</h2>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-bold pb-1">{mapping.name}</h1>
                <p className="text-muted-foreground">{mapping.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last edited: {formatLastEdited(mapping.updated_at)}
                </p>
              </div>

              <div className="flex gap-2">
                {isFromCommunity && !isOwnMapping ? (
                  // Community mapping buttons (not owned by current user)
                  <>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Heart size={14} /> Like
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Copy size={14} /> Fork
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Download size={14} /> Import
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Share size={14} /> Share
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <TriangleAlert size={14} /> Report
                    </Button>
                  </>
                ) : (
                  // Personal mapping buttons (owned by current user)
                  <>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Copy size={14} /> Duplicate
                    </Button>
                    <Button size="sm" className="gap-1">
                      <Download size={14} /> Export
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Share size={14} /> Share
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
                  {remappings.reduce(
                    (acc, layer) => acc + layer.remappings.length,
                    0
                  )}{" "}
                  mappings
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
                              delay: 0.05 * remapIdx,
                            }}
                            className="hover:bg-muted/30"
                          >
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {remap.trigger.type}
                                {remap.trigger.value
                                  ? `: ${remap.trigger.value}`
                                  : ""}
                                {remap.trigger.key_time_pairs
                                  ? `: ${remap.trigger.key_time_pairs
                                      .map(([k, t]) => `${k} (${t}ms)`)
                                      .join(", ")}`
                                  : ""}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className="font-mono text-xs"
                              >
                                {remap.bind.type}
                                {remap.bind.value
                                  ? `: ${remap.bind.value}`
                                  : ""}
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
  );
};

export default MappingDetail;
