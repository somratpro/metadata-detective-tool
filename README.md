# Universal File Metadata Analyzer

A comprehensive metadata extraction and analysis tool for digital forensics investigations. This application can analyze a wide variety of file types and extract detailed metadata information.

## Features

### Supported File Types

#### 🖼️ Images

- **Formats**: JPEG, PNG, TIFF, GIF, BMP, WebP, RAW
- **Extracted Data**:
  - EXIF data (camera settings, timestamps)
  - GPS location information
  - Camera and lens details
  - Technical specifications (resolution, color space, etc.)

#### 📄 Documents

- **Formats**: PDF, DOCX, TXT, JSON, YAML, XML, CSV
- **Extracted Data**:
  - Creation and modification dates
  - Author information
  - Content preview
  - Document properties
  - Security settings (for PDFs)

#### 🎵 Audio Files

- **Formats**: MP3, WAV, FLAC, AAC, M4A, OGG, WMA
- **Extracted Data**:
  - ID3 tags (title, artist, album, year)
  - Technical specs (bitrate, sample rate, codec)
  - Duration and quality information

#### 🎬 Video Files (Basic Support)

- **Formats**: MP4, AVI, MOV, WMV, FLV, WebM, MKV
- **Note**: Video files are detected but require server-side processing for detailed metadata extraction

#### 📦 Archive Files (Basic Support)

- **Formats**: ZIP, RAR, 7Z, TAR, GZ
- **Note**: Archive files are detected and basic information is provided

## Usage

1. **Upload a file**: Drag and drop any supported file onto the upload area, or click to browse and select a file.

2. **View metadata**: The app automatically analyzes the file and displays the metadata in organized categories:
   - **Basic Info**: File name, size, type, modification date
   - **Technical**: Technical specifications and format details
   - **Content**: Content-specific information (varies by file type)
   - **Media Info**: Media-specific metadata (for images, audio, video)
   - **Security**: Security-related information (for documents)
   - **Additional**: Extra metadata and raw data

3. **Export data**: Copy metadata to clipboard or export as JSON for further analysis.

## Technology Stack

- **Frontend**: React + TypeScript + Vite
- **UI Components**: Tailwind CSS + shadcn/ui
- **Metadata Extraction Libraries**:
  - `exifreader`: Image metadata extraction
  - `pdfjs-dist`: PDF analysis
  - `music-metadata`: Audio file analysis
  - `mammoth`: Word document processing
  - `js-yaml`: YAML file parsing

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Security Note

This tool is designed for digital forensics and security analysis. All file processing happens locally in your browser - no files are uploaded to external servers.

## Project Info

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
