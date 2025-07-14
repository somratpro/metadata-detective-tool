import { MetadataDisplay } from "@/components/EnhancedMetadataDisplay";
import { FileUpload } from "@/components/FileUpload";
import { ForensicsHeader } from "@/components/ForensicsHeader";
import { Card } from "@/components/ui/card";
import { FileMetadata } from "@/lib/fileAnalyzer";
import { Shield } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [fileData, setFileData] = useState<{
    file: File;
    metadata: FileMetadata;
  } | null>(null);

  const handleFileAnalysis = (file: File, metadata: FileMetadata) => {
    setFileData({ file, metadata });
  };

  const clearAnalysis = () => {
    setFileData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/10 to-slate-950">
      <ForensicsHeader />

      <main className="container mx-auto px-4 py-8">
        {!fileData ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                <Shield className="h-10 w-10 text-red-400" />
              </div>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Cyber Security Forensic Analyzer
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional metadata extraction and analysis tool for cyber
                security investigations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 border-red-500/20 bg-red-900/5">
                <h3 className="text-lg font-semibold mb-2 text-red-400">
                  Digital Evidence
                </h3>
                <p className="text-sm text-muted-foreground">
                  Extract EXIF data and metadata
                </p>
              </Card>
              <Card className="p-6 border-red-500/20 bg-red-900/5">
                <h3 className="text-lg font-semibold mb-2 text-red-400">
                  Document Analysis
                </h3>
                <p className="text-sm text-muted-foreground">
                  Analyze PDF and document metadata
                </p>
              </Card>
              <Card className="p-6 border-red-500/20 bg-red-900/5">
                <h3 className="text-lg font-semibold mb-2 text-red-400">
                  Media Forensics
                </h3>
                <p className="text-sm text-muted-foreground">
                  Extract audio/video metadata
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
