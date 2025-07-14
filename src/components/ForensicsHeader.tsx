import { Shield, Search, FileSearch } from "lucide-react";

export const ForensicsHeader = () => {
  return (
    <header className="border-b border-border bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg forensics-gradient flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Forensics Analyzer</h1>
              <p className="text-sm text-muted-foreground">Digital Evidence Investigation Tool</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Search className="h-4 w-4" />
              <span>Metadata Extraction</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <FileSearch className="h-4 w-4" />
              <span>Evidence Analysis</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};