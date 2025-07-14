import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Download, 
  Camera, 
  MapPin, 
  Calendar, 
  Smartphone,
  Copy,
  Eye,
  FileText,
  Palette
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MetadataDisplayProps {
  file: File;
  metadata: any;
  onClear: () => void;
}

export const MetadataDisplay = ({ file, metadata, onClear }: MetadataDisplayProps) => {
  const [imageUrl] = useState(() => URL.createObjectURL(file));

  // Helper function to extract value from ExifReader format
  const extractValue = (tagData: any): string => {
    if (!tagData) return "N/A";
    if (typeof tagData === 'object' && 'description' in tagData) {
      return tagData.description || tagData.value || "N/A";
    }
    if (typeof tagData === 'object' && 'value' in tagData) {
      return tagData.value;
    }
    return String(tagData);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "N/A") return "N/A";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    if (typeof value === "number" && value % 1 !== 0) return value.toFixed(6);
    return String(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Metadata has been copied to your clipboard",
    });
  };

  const exportMetadata = () => {
    const dataStr = JSON.stringify(metadata, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.split('.')[0]}_metadata.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ExifReader returns a flat object, not nested sections
  console.log("MetadataDisplay received:", metadata);
  console.log("Metadata keys:", Object.keys(metadata));
  console.log("Sample metadata values:", {
    Make: metadata["Make"],
    Model: metadata["Model"], 
    DateTime: metadata["DateTime"]
  });
  
  // Organize metadata into categories with direct ExifReader tags
  const categories = {
    basic: {
      icon: FileText,
      title: "Basic Information",
      data: {
        "File Name": file.name,
        "File Size": `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        "File Type": file.type,
        "Last Modified": new Date(file.lastModified).toLocaleString(),
        "Image Width": extractValue(metadata["Image Width"] || metadata["ExifImageWidth"]),
        "Image Height": extractValue(metadata["Image Height"] || metadata["ExifImageHeight"]),
      }
    },
    camera: {
      icon: Camera,
      title: "Camera & Settings",
      data: {
        "Make": extractValue(metadata["Make"]),
        "Model": extractValue(metadata["Model"]),
        "Software": extractValue(metadata["Software"]),
        "Lens Model": extractValue(metadata["LensModel"]),
        "F-Number": extractValue(metadata["FNumber"]),
        "Exposure Time": extractValue(metadata["ExposureTime"]),
        "ISO": extractValue(metadata["ISOSpeedRatings"] || metadata["ISO"] || metadata["PhotographicSensitivity"]),
        "Focal Length": extractValue(metadata["FocalLength"]),
        "Flash": extractValue(metadata["Flash"]),
        "White Balance": extractValue(metadata["WhiteBalance"]),
        "Metering Mode": extractValue(metadata["MeteringMode"]),
        "Exposure Mode": extractValue(metadata["ExposureMode"]),
        "Scene Type": extractValue(metadata["SceneType"]),
      }
    },
    location: {
      icon: MapPin,
      title: "GPS Location",
      data: {
        "Latitude": extractValue(metadata["GPSLatitude"]),
        "Longitude": extractValue(metadata["GPSLongitude"]),
        "Altitude": extractValue(metadata["GPSAltitude"]),
        "GPS Date/Time": extractValue(metadata["GPSDateStamp"]),
        "GPS Processing Method": extractValue(metadata["GPSProcessingMethod"]),
        "GPS Speed": extractValue(metadata["GPSSpeed"]),
        "GPS Direction": extractValue(metadata["GPSImgDirection"]),
      }
    },
    datetime: {
      icon: Calendar,
      title: "Date & Time",
      data: {
        "Date Taken": extractValue(metadata["DateTimeOriginal"]),
        "Date Modified": extractValue(metadata["DateTime"]),
        "Date Digitized": extractValue(metadata["DateTimeDigitized"]),
        "Timezone": extractValue(metadata["OffsetTime"]),
        "Subsec Time": extractValue(metadata["SubSecTime"]),
      }
    },
    technical: {
      icon: Smartphone,
      title: "Technical Details",
      data: {
        "Color Space": extractValue(metadata["ColorSpace"]),
        "Orientation": extractValue(metadata["Orientation"]),
        "Resolution X": extractValue(metadata["XResolution"]),
        "Resolution Y": extractValue(metadata["YResolution"]),
        "Resolution Unit": extractValue(metadata["ResolutionUnit"]),
        "Bits Per Sample": extractValue(metadata["BitsPerSample"]),
        "Compression": extractValue(metadata["Compression"]),
        "Photometric Interpretation": extractValue(metadata["PhotometricInterpretation"]),
        "Samples Per Pixel": extractValue(metadata["SamplesPerPixel"]),
      }
    },
    colors: {
      icon: Palette,
      title: "Color & Profile",
      data: {
        "Color Profile": extractValue(metadata["ColorSpace"]),
        "White Point": extractValue(metadata["WhitePoint"]),
        "Primary Chromaticities": extractValue(metadata["PrimaryChromaticities"]),
        "Y Cb Cr Coefficients": extractValue(metadata["YCbCrCoefficients"]),
        "Copyright": extractValue(metadata["Copyright"]),
        "Artist": extractValue(metadata["Artist"]),
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onClear}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Upload</span>
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Evidence Analysis</h2>
            <p className="text-muted-foreground">{file.name}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={() => copyToClipboard(JSON.stringify(metadata, null, 2))}
            className="flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy All</span>
          </Button>
          <Button 
            onClick={exportMetadata}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Image Preview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Image Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <img 
                src={imageUrl} 
                alt="Evidence file" 
                className="w-full rounded-lg border border-border"
              />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Dimensions:</span>
                  <p className="font-mono">
                    {extractValue(metadata["Image Width"] || metadata["ExifImageWidth"])} × {extractValue(metadata["Image Height"] || metadata["ExifImageHeight"])}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">File Size:</span>
                  <p className="font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metadata Categories */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Forensic Metadata Analysis</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {Object.keys(metadata).length} Properties Found
              </Badge>
              {(metadata["GPSLatitude"] && metadata["GPSLongitude"]) && (
                <Badge variant="outline" className="text-primary">GPS Data Available</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="camera" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {Object.entries(categories).map(([key, category]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    <category.icon className="h-3 w-3 mr-1" />
                    {category.title.split(' ')[0]}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(categories).map(([key, category]) => (
                <TabsContent key={key} value={key}>
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {Object.entries(category.data).map(([field, value]) => {
                        const hasValue = value !== null && value !== undefined && value !== "N/A";
                        return (
                          <div 
                            key={field}
                            className={`
                              flex justify-between items-start p-3 rounded-lg border
                              ${hasValue ? 'border-border bg-card/30' : 'border-muted bg-muted/20'}
                            `}
                          >
                            <span className="font-medium text-sm text-foreground">{field}</span>
                            <span className={`
                              font-mono text-sm text-right max-w-60 truncate
                              ${hasValue ? 'text-foreground' : 'text-muted-foreground'}
                            `}>
                              {formatValue(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Raw Data Section */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Metadata (JSON)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <pre className="code-text text-xs whitespace-pre-wrap break-words p-4 bg-muted/20 rounded-lg">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};