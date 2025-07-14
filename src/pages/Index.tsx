import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { MetadataDisplay } from "@/components/MetadataDisplay";
import { ForensicsHeader } from "@/components/ForensicsHeader";
import { Card } from "@/components/ui/card";
import { Shield } from "lucide-react";

const Index = () => {
  const [fileData, setFileData] = useState<{
    file: File;
    metadata: any;
  } | null>(null);

  const handleFileAnalysis = (file: File, metadata: any) => {
    setFileData({ file, metadata });
  };

  const clearAnalysis = () => {
    setFileData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <ForensicsHeader />
      
      <main className="container mx-auto px-4 py-8">
        {!fileData ? (
          <div className="max-w-4xl mx-auto">
            {/* Welcome Section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full forensics-gradient mb-6 evidence-glow">
                <Shield className="h-10 w-10 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Digital Forensics File Analyzer
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional metadata extraction and analysis tool for digital forensics investigations. 
                Upload images to reveal hidden metadata and evidence.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-border bg-card/50">
                <h3 className="text-lg font-semibold mb-2 text-primary">EXIF Data</h3>
                <p className="text-sm text-muted-foreground">
                  Extract camera settings, timestamps, and technical metadata from images
                </p>
              </Card>
              <Card className="p-6 border-border bg-card/50">
                <h3 className="text-lg font-semibold mb-2 text-primary">GPS Location</h3>
                <p className="text-sm text-muted-foreground">
                  Discover geolocation data embedded in photographs
                </p>
              </Card>
              <Card className="p-6 border-border bg-card/50">
                <h3 className="text-lg font-semibold mb-2 text-primary">Device Info</h3>
                <p className="text-sm text-muted-foreground">
                  Identify camera models, lens information, and software details
                </p>
              </Card>
            </div>

            <FileUpload onFileAnalysis={handleFileAnalysis} />
          </div>
        ) : (
          <MetadataDisplay 
            file={fileData.file} 
            metadata={fileData.metadata} 
            onClear={clearAnalysis}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
