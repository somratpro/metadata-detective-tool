import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { FileAnalyzer, FileMetadata } from "@/lib/fileAnalyzer";
import {
  AlertCircle,
  FileImage,
  FileText,
  Film,
  Loader,
  Music,
  Upload,
} from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileAnalysis: (file: File, metadata: FileMetadata) => void;
}

export const FileUpload = ({ onFileAnalysis }: FileUploadProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFile = useCallback(
    async (file: File) => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const metadata = await FileAnalyzer.analyzeFile(file);
        onFileAnalysis(file, metadata);
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${file.name} (${metadata.basic.fileType})`,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to analyze file";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Analysis Failed",
          description: errorMessage,
        });
      } finally {
        setIsAnalyzing(false);
      }
    },
    [onFileAnalysis]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        analyzeFile(acceptedFiles[0]);
      }
    },
    [analyzeFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [
        ".jpg",
        ".jpeg",
        ".png",
        ".tiff",
        ".gif",
        ".bmp",
        ".webp",
        ".raw",
      ],
      "application/pdf": [".pdf"],
      "audio/*": [".mp3", ".wav", ".flac", ".aac", ".m4a", ".ogg", ".wma"],
      "video/*": [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm", ".mkv"],
      "text/*": [".txt", ".csv", ".xml"],
      "application/json": [".json"],
      "application/x-yaml": [".yaml", ".yml"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/zip": [".zip"],
      "application/x-rar-compressed": [".rar"],
      "application/x-7z-compressed": [".7z"],
    },
    multiple: false,
    disabled: isAnalyzing,
  });

  return (
    <div className="space-y-6">
      <Card
        {...getRootProps()}
        className={`
          p-12 border-2 border-dashed transition-all duration-300 cursor-pointer group
          ${
            isDragActive
              ? "border-red-500 bg-red-500/5 shadow-lg shadow-red-500/20"
              : "border-red-500/30 bg-red-900/5 hover:bg-red-900/10 hover:border-red-500/50"
          }
          ${isAnalyzing ? "cursor-not-allowed opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />

        <div className="text-center space-y-4">
          {isAnalyzing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader className="h-12 w-12 text-red-500 animate-spin" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Analyzing File...
                </h3>
                <p className="text-muted-foreground">
                  Extracting metadata and forensic evidence
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                {isDragActive ? (
                  <Upload className="h-12 w-12 text-red-500 group-hover:scale-110 transition-transform" />
                ) : (
                  <FileText className="h-12 w-12 text-red-400 group-hover:text-red-500 group-hover:scale-110 transition-all" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {isDragActive
                    ? "Drop file to analyze"
                    : "Upload File for Forensic Analysis"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop any supported file here, or click to select
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2 p-2 rounded border border-red-500/20 bg-red-900/5">
                    <FileImage className="h-4 w-4 text-red-400" />
                    <span>Images (JPEG, PNG, TIFF, etc.)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border border-red-500/20 bg-red-900/5">
                    <FileText className="h-4 w-4 text-red-400" />
                    <span>Documents (PDF, DOCX, TXT)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border border-red-500/20 bg-red-900/5">
                    <Music className="h-4 w-4 text-red-400" />
                    <span>Audio (MP3, WAV, FLAC)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border border-red-500/20 bg-red-900/5">
                    <Film className="h-4 w-4 text-red-400" />
                    <span>Video (MP4, AVI, MOV)</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="mt-4 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                disabled={isAnalyzing}
              >
                Select File for Analysis
              </Button>
            </>
          )}
        </div>
      </Card>

      {error && (
        <Alert
          variant="destructive"
          className="border-red-500/50 bg-red-900/10"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};
