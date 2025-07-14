import { Lock, Search, Shield } from "lucide-react";

export const ForensicsHeader = () => {
  return (
    <header className="border-b border-red-500/20 bg-gradient-to-r from-red-950/30 to-orange-950/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 border border-red-500/30">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Cyber Forensics Lab
              </h1>
              <p className="text-sm text-muted-foreground">
                Advanced Metadata Analysis Tool
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-red-400" />
              <span>Deep Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-red-400" />
              <span>Secure Processing</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
