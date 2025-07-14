import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { FileMetadata } from "@/lib/fileAnalyzer";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Copy,
  Download,
  Eye,
  FileText,
  MapPin,
  Palette,
  Shield,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

interface MetadataDisplayProps {
  file: File;
  metadata: FileMetadata;
  onClear: () => void;
}

export const MetadataDisplay = ({
  file,
  metadata,
  onClear,
}: MetadataDisplayProps) => {
  const [imageUrl] = useState(() => URL.createObjectURL(file));

  // Helper function to format values for display
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") {
      return value % 1 !== 0 ? value.toFixed(6) : value.toString();
    }
    if (typeof value === "object") {
      if (Array.isArray(value)) return value.join(", ");
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Helper function to copy metadata to clipboard
  const copyToClipboard = () => {
    const metadataText = JSON.stringify(metadata, null, 2);
    navigator.clipboard.writeText(metadataText);
    toast({
      title: "Copied to clipboard",
      description: "Complete metadata has been copied to your clipboard",
    });
  };

  // Enhanced categories with comprehensive data organization
  const categories = {
    basic: {
      title: "File Information",
      icon: FileText,
      data: metadata.basic,
    },
    technical: {
      title: "Technical Details",
      icon: Smartphone,
      data: metadata.technical || {},
    },
    camera: {
      title: "Camera & Settings",
      icon: Camera,
      data: metadata.media || {},
    },
    location: {
      title: "Location Data",
      icon: MapPin,
      data: metadata.custom?.location || {},
    },
    color: {
      title: "Color & Rendering",
      icon: Palette,
      data: metadata.custom?.color || {},
    },
    forensics: {
      title: "Forensic Analysis",
      icon: Eye,
      data: metadata.custom?.forensics || {},
    },
    rights: {
      title: "Rights & Attribution",
      icon: Calendar,
      data: metadata.custom?.rights || {},
    },
    security: {
      title: "Security & Integrity",
      icon: Shield,
      data: metadata.security || {},
    },
  };

  // Filter out empty categories and count total properties
  const populatedCategories = Object.entries(categories).filter(
    ([, category]) => {
      const data = category.data;
      return (
        data &&
        Object.keys(data).length > 0 &&
        Object.values(data).some(
          (value) =>
            value !== "N/A" &&
            value !== null &&
            value !== undefined &&
            value !== ""
        )
      );
    }
  );

  const totalProperties = populatedCategories.reduce(
    (sum, [, category]) => sum + Object.keys(category.data).length,
    0
  );

  // Check for GPS data
  const hasGPSData =
    metadata.custom?.location &&
    Object.values(metadata.custom.location).some(
      (value) =>
        value !== "N/A" && value !== null && value !== undefined && value !== ""
    );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with file preview */}
      <Card className="border-red-500/20 bg-red-900/5">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Evidence Analysis
              </h2>
              <p className="text-muted-foreground">{file.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClear}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* File preview */}
            {file.type.startsWith("image/") && (
              <div className="space-y-4">
                <img
                  src={imageUrl}
                  alt="Evidence file"
                  className="w-full rounded-lg border border-red-500/20 max-h-80 object-contain bg-black/5"
                />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Dimensions</p>
                    <p className="font-mono">
                      {metadata.technical?.["Image Width"] || "N/A"} ×{" "}
                      {metadata.technical?.["Image Height"] || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">File Size</p>
                    <p className="font-mono">{metadata.basic.fileSize}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">
                    Analysis Status
                  </h4>
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="w-full justify-center"
                    >
                      {totalProperties} Properties Found
                    </Badge>
                    {hasGPSData && (
                      <Badge
                        variant="outline"
                        className="text-primary w-full justify-center"
                      >
                        GPS Data Available
                      </Badge>
                    )}
                    {metadata.custom?.forensics?.["Has Thumbnail"] ===
                      "Yes" && (
                      <Badge
                        variant="outline"
                        className="text-green-400 w-full justify-center"
                      >
                        Thumbnail Present
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">File Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-mono">
                        {metadata.basic.fileType}
                      </span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Modified:</span>{" "}
                      <span className="font-mono">
                        {metadata.basic.lastModified}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata tabs */}
      <Card className="border-red-500/20 bg-red-900/5">
        <CardContent className="p-6">
          <Tabs
            defaultValue={populatedCategories[0]?.[0] || "basic"}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1 h-auto p-1 bg-red-900/10">
              {populatedCategories.map(([key, category]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="text-xs flex items-center gap-1 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-300"
                >
                  <category.icon className="h-3 w-3" />
                  <span className="hidden lg:inline">
                    {category.title.split(" ")[0]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {populatedCategories.map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-4">
                    <category.icon className="h-5 w-5 text-red-400" />
                    <h3 className="text-lg font-semibold text-foreground">
                      {category.title}
                    </h3>
                  </div>

                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {Object.entries(category.data).map(([field, value]) => {
                        const formattedValue = formatValue(value);
                        const hasValue =
                          formattedValue !== "N/A" && formattedValue !== "";

                        return (
                          <div
                            key={field}
                            className={`
                              flex justify-between items-start p-3 rounded-lg border transition-colors
                              ${
                                hasValue
                                  ? "border-red-500/20 bg-red-900/5 hover:bg-red-900/10"
                                  : "border-muted bg-muted/10"
                              }
                            `}
                          >
                            <span className="font-medium text-sm text-foreground min-w-0 flex-1 mr-4">
                              {field}
                            </span>
                            <span
                              className={`
                                font-mono text-sm text-right max-w-md break-all
                                ${
                                  hasValue
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                                }
                              `}
                              title={formattedValue}
                            >
                              {formattedValue}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Export options */}
      <Card className="border-red-500/20 bg-red-900/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Export Evidence</h4>
              <p className="text-sm text-muted-foreground">
                Export metadata for forensic documentation
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${file.name}-metadata.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Download className="h-4 w-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
