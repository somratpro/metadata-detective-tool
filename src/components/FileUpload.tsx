import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileImage, AlertCircle, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import exifr from "exifr";

interface FileUploadProps {
  onFileAnalysis: (file: File, metadata: any) => void;
}

export const FileUpload = ({ onFileAnalysis }: FileUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFile = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Use exifr to extract comprehensive metadata
      const metadata = await exifr.parse(file, {
        tiff: true,
        xmp: true,
        icc: true,
        iptc: true,
        jfif: true,
        ihdr: true,
        userComment: true,
        gps: true,
        interop: true,
        pick: [] // Get everything
      });

      if (!metadata || Object.keys(metadata).length === 0) {
        throw new Error("No metadata found in this file");
      }

      onFileAnalysis(file, metadata);
      toast({
        title: "Analysis Complete",
        description: `Successfully extracted metadata from ${file.name}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze file";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: errorMessage,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      analyzeFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isAnalyzing
  });

  return (
    <div className="space-y-6">
      <Card 
        {...getRootProps()} 
        className={`
          p-12 border-2 border-dashed border-border bg-card/30 hover:bg-card/50 
          transition-all duration-300 cursor-pointer group
          ${isDragActive ? 'border-primary bg-primary/5 evidence-glow' : ''}
          ${isAnalyzing ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="text-center space-y-4">
          {isAnalyzing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-12 w-12 text-primary animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Analyzing File...</h3>
                <p className="text-muted-foreground">Extracting metadata and evidence</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-primary group-hover:scale-110 transition-transform" />
                ) : (
                  <FileImage className="h-12 w-12 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all" />
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragActive ? 'Drop file to analyze' : 'Upload Image for Analysis'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop an image file here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports: JPEG, PNG, TIFF, GIF, BMP, WebP
                </p>
              </div>
              
              <Button 
                variant="outline" 
                className="mt-4"
                disabled={isAnalyzing}
              >
                Select File
              </Button>
            </>
          )}
        </div>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};