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
} from "lucide-react";
import { useEffect } from "react";

// Updated types to match the actual mapping structure
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

// ... other imports remain the same

// Update the types to match the actual data structure
type MappingDetails = {
  id: string;
  user: string;
  name: string;
  description: string;
  mappings: Record<string, string>; // This matches the actual data structure
  updated_at: string;
  lastEdited: string;
  keyCount: number;
  isActive: boolean;
  isPublic: boolean;
  numLikes: number;
  numDownloads: number;
  tags: Array<string>;
};

const MappingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [mapping, setMapping] = useState<MappingDetails | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMapping = async () => {
      try {
        // Get the mapping from localStorage
        const storedMappings = localStorage.getItem("mappings");
        if (storedMappings) {
          const mappings = JSON.parse(storedMappings);
          console.log(mappings);
          const foundMapping = mappings.find(
            (m: MappingDetails) => m.id.toString() === id
          );
          console.log(foundMapping.mappings);
          setMapping(foundMapping.mappings);
        }
      } catch (error) {
        console.error("Error fetching mapping:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapping();
  }, [id]);

  // Helper function to format the last edited time
  const formatLastEdited = (updatedAt: string) => {
    const updatedDate = new Date(updatedAt);
    const now = new Date();
    const diffHours = Math.floor(
      (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60)
    );
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    }
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

  // Convert mappings object to array of entries
  const mappingEntries = Object.entries(mapping.mappings || {});
  console.log(mappingEntries);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header section remains the same */}
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
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{mapping.description}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last edited: {mapping.lastEdited}
                </p>
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
                  {mappingEntries.length}{" "}
                  {mappingEntries.length === 1 ? "mapping" : "mappings"}
                </Badge>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Source Key
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        Target Key
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mappingEntries.map(([sourceKey, targetKey], index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        className="hover:bg-muted/30"
                      >
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {sourceKey}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {targetKey}
                          </Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MappingDetail;
