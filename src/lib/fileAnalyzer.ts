import ExifReader from "exifreader";
import * as yaml from "js-yaml";
import * as mammoth from "mammoth";
import { parseBlob } from "music-metadata";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker with simpler approach that avoids CDN issues
const setupPDFWorker = () => {
  // For development and production builds, disable worker by default to avoid CDN issues
  if (typeof window !== "undefined") {
    // Try to use a local worker first, fallback to no worker
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;
    } catch (error) {
      console.warn("PDF worker setup failed, using main thread:", error);
      // Disable worker to use main thread processing
      pdfjsLib.GlobalWorkerOptions.workerSrc = "";
    }
  }
};

setupPDFWorker();

export interface FileMetadata {
  basic: {
    fileName: string;
    fileSize: string;
    fileType: string;
    lastModified: string;
    [key: string]: string | number | boolean;
  };
  technical?: {
    [key: string]: string | number | boolean;
  };
  content?: {
    [key: string]: string | number | boolean;
  };
  media?: {
    [key: string]: string | number | boolean;
  };
  security?: {
    [key: string]: string | number | boolean;
  };
  custom?: {
    [key: string]: string | number | boolean | object;
  };
}

export class FileAnalyzer {
  private static getFileExtension(filename: string): string {
    return filename.split(".").pop()?.toLowerCase() || "";
  }

  private static formatFileSize(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  private static createBasicMetadata(file: File): FileMetadata["basic"] {
    return {
      fileName: file.name,
      fileSize: this.formatFileSize(file.size),
      fileType: file.type || "Unknown",
      lastModified: new Date(file.lastModified).toLocaleString(),
      extension: this.getFileExtension(file.name),
      sizeInBytes: file.size,
    };
  }

  static async analyzeImage(file: File): Promise<FileMetadata> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const tags = ExifReader.load(arrayBuffer, { expanded: true });

      const metadata: FileMetadata = {
        basic: this.createBasicMetadata(file),
        technical: {},
        media: {},
        custom: {},
      };

      // Helper function to extract value from tags
      const extractValue = (tagData: unknown): string => {
        if (!tagData) return "N/A";
        if (typeof tagData === "string") return tagData;
        if (typeof tagData === "number") return tagData.toString();
        if (typeof tagData === "object" && tagData !== null) {
          if (typeof tagData === "object" && "description" in tagData) {
            const desc = (tagData as { description?: unknown }).description;
            if (desc !== undefined && desc !== "") {
              return String(desc);
            }
          }
          if (typeof tagData === "object" && "value" in tagData) {
            const val = (tagData as { value?: unknown }).value;
            if (val !== undefined && val !== "") {
              return String(val);
            }
          }
        }
        return "N/A";
      };

      // Helper function to search across multiple tag sections
      const extractValueFromSections = (
        fieldNames: string | string[]
      ): string => {
        const sections: (Record<string, unknown> | null | undefined)[] = [
          tags as Record<string, unknown>,
          tags.file ? (tags.file as unknown as Record<string, unknown>) : null,
          tags.jfif ? (tags.jfif as unknown as Record<string, unknown>) : null,
          tags.Thumbnail
            ? (tags.Thumbnail as unknown as Record<string, unknown>)
            : null,
          tags.exif ? (tags.exif as unknown as Record<string, unknown>) : null,
        ];
        const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

        for (const section of sections) {
          if (!section) continue;
          for (const field of fields) {
            const tagData = section[field];
            if (tagData !== undefined && tagData !== null) {
              const value = extractValue(tagData);
              if (value !== "N/A") return value;
            }
          }
        }
        return "N/A";
      };

      // Extract comprehensive image metadata
      if (tags) {
        // Camera and shooting information
        metadata.media = {
          "Camera Make": extractValueFromSections("Make"),
          "Camera Model": extractValueFromSections("Model"),
          "Lens Model": extractValueFromSections("LensModel"),
          Software: extractValueFromSections("Software"),
          "Date/Time": extractValueFromSections([
            "DateTime",
            "DateTimeOriginal",
            "DateTimeDigitized",
          ]),
          "F-Number": extractValueFromSections("FNumber"),
          "Exposure Time": extractValueFromSections("ExposureTime"),
          "ISO Speed": extractValueFromSections([
            "ISOSpeedRatings",
            "PhotographicSensitivity",
          ]),
          "Focal Length": extractValueFromSections("FocalLength"),
          "Focal Length (35mm)": extractValueFromSections(
            "FocalLengthIn35mmFilm"
          ),
          Flash: extractValueFromSections("Flash"),
          "White Balance": extractValueFromSections("WhiteBalance"),
          "Metering Mode": extractValueFromSections("MeteringMode"),
          "Exposure Mode": extractValueFromSections("ExposureMode"),
          "Scene Type": extractValueFromSections("SceneType"),
          "Exposure Program": extractValueFromSections("ExposureProgram"),
          "Exposure Bias": extractValueFromSections("ExposureBiasValue"),
          "Max Aperture": extractValueFromSections("MaxApertureValue"),
          "Subject Distance": extractValueFromSections("SubjectDistance"),
          "Digital Zoom": extractValueFromSections("DigitalZoomRatio"),
        };

        // Technical image details
        metadata.technical = {
          "Image Width": extractValueFromSections([
            "ImageWidth",
            "ExifImageWidth",
            "PixelXDimension",
          ]),
          "Image Height": extractValueFromSections([
            "ImageHeight",
            "ExifImageHeight",
            "PixelYDimension",
          ]),
          "Color Space": extractValueFromSections("ColorSpace"),
          Orientation: extractValueFromSections("Orientation"),
          "Resolution X": extractValueFromSections("XResolution"),
          "Resolution Y": extractValueFromSections("YResolution"),
          "Resolution Unit": extractValueFromSections("ResolutionUnit"),
          Compression: extractValueFromSections("Compression"),
          "Bits Per Sample": extractValueFromSections("BitsPerSample"),
          "Samples Per Pixel": extractValueFromSections("SamplesPerPixel"),
          "Photometric Interpretation": extractValueFromSections(
            "PhotometricInterpretation"
          ),
          "Planar Configuration": extractValueFromSections(
            "PlanarConfiguration"
          ),
          "YCbCr Positioning": extractValueFromSections("YCbCrPositioning"),
          "Reference Black/White": extractValueFromSections(
            "ReferenceBlackWhite"
          ),
        };

        // GPS and location information
        const hasGPS = tags["GPSLatitude"] || tags["GPSLongitude"];
        if (hasGPS) {
          metadata.custom!.location = {
            Latitude: extractValueFromSections("GPSLatitude"),
            Longitude: extractValueFromSections("GPSLongitude"),
            Altitude: extractValueFromSections("GPSAltitude"),
            "Altitude Ref": extractValueFromSections("GPSAltitudeRef"),
            "GPS Date/Time": extractValueFromSections("GPSDateStamp"),
            "GPS Time": extractValueFromSections("GPSTimeStamp"),
            "GPS Speed": extractValueFromSections("GPSSpeed"),
            "GPS Direction": extractValueFromSections("GPSImgDirection"),
            "GPS Processing Method": extractValueFromSections(
              "GPSProcessingMethod"
            ),
            "GPS Area Information":
              extractValueFromSections("GPSAreaInformation"),
          };
        }

        // Color and rendering information
        metadata.custom!.color = {
          "Color Profile": extractValueFromSections("ColorSpace"),
          "White Point": extractValueFromSections("WhitePoint"),
          "Primary Chromaticities": extractValueFromSections(
            "PrimaryChromaticities"
          ),
          "YCbCr Coefficients": extractValueFromSections("YCbCrCoefficients"),
          Gamma: extractValueFromSections("Gamma"),
          "Transfer Function": extractValueFromSections("TransferFunction"),
          "Color Transform": extractValueFromSections("ColorTransform"),
        };

        // Copyright and attribution
        const copyright = extractValueFromSections("Copyright");
        const artist = extractValueFromSections("Artist");
        if (copyright !== "N/A" || artist !== "N/A") {
          metadata.custom!.rights = {
            Copyright: copyright,
            Artist: artist,
            Creator: extractValueFromSections("Creator"),
            Rights: extractValueFromSections("Rights"),
          };
        }

        // Store comprehensive raw data for forensic analysis
        metadata.custom!.forensics = {
          "Total EXIF Tags": Object.keys(tags).length,
          "Has Thumbnail": tags.Thumbnail ? "Yes" : "No",
          "Has GPS Data": hasGPS ? "Yes" : "No",
          "Maker Notes": tags["MakerNote"] ? "Present" : "Not Present",
          "User Comment": extractValueFromSections("UserComment"),
          "Image Unique ID": extractValueFromSections("ImageUniqueID"),
          "Camera Serial Number":
            extractValueFromSections("CameraSerialNumber"),
          "Lens Serial Number": extractValueFromSections("LensSerialNumber"),
        };

        // Store all raw tags for advanced forensic analysis
        metadata.custom!.rawTags = tags;
      }

      return metadata;
    } catch (error) {
      throw new Error(
        `Failed to analyze image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async analyzePDF(file: File): Promise<FileMetadata> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Create basic metadata first
      const metadata: FileMetadata = {
        basic: this.createBasicMetadata(file),
        technical: {},
        content: {},
        security: {},
      };

      try {
        // Try to load PDF with pdfjs-dist with simplified options
        const pdf = await pdfjsLib.getDocument({
          data: arrayBuffer,
          useWorkerFetch: false,
          isEvalSupported: false,
        }).promise;

        // Successfully loaded PDF, extract metadata
        try {
          const pdfMetadata = await pdf.getMetadata();
          const info = pdfMetadata.info as Record<string, unknown>;

          metadata.content = {
            title: (info.Title as string) || "N/A",
            author: (info.Author as string) || "N/A",
            subject: (info.Subject as string) || "N/A",
            keywords: (info.Keywords as string) || "N/A",
            creator: (info.Creator as string) || "N/A",
            producer: (info.Producer as string) || "N/A",
            creationDate: info.CreationDate
              ? new Date(info.CreationDate as string).toLocaleString()
              : "N/A",
            modificationDate: info.ModDate
              ? new Date(info.ModDate as string).toLocaleString()
              : "N/A",
          };

          metadata.technical = {
            pages: pdf.numPages,
            pdfVersion: (info.PDFFormatVersion as string) || "N/A",
            fingerprint: pdf.fingerprints?.[0] || "N/A",
            parseStatus: "Success",
          };

          metadata.security = {
            encrypted: "Unknown",
            permissions: "Standard",
          };

          // Try to get text from first page
          try {
            const firstPage = await pdf.getPage(1);
            const textContent = await firstPage.getTextContent();
            const textItems = textContent.items
              .map((item) => {
                if ("str" in item) {
                  return (item as { str: string }).str;
                }
                return "";
              })
              .join(" ");
            metadata.content!.firstPageText =
              textItems.substring(0, 500) +
              (textItems.length > 500 ? "..." : "");
          } catch (textError) {
            metadata.content!.firstPageText = "Could not extract text";
          }

          return metadata;
        } catch (metadataError) {
          console.warn("PDF metadata extraction failed:", metadataError);
          metadata.content = {
            error: "Could not extract PDF metadata",
            details: (metadataError as Error).message,
          };
          metadata.technical = {
            pages: pdf.numPages || "Unknown",
            parseStatus: "Partial",
          };
          return metadata;
        }
      } catch (pdfjsError) {
        console.warn("PDF parsing failed:", pdfjsError);

        // Return basic file info with error details
        metadata.content = {
          error: "PDF parsing failed",
          details: (pdfjsError as Error).message,
          suggestion:
            "File may be corrupted, encrypted, password-protected, or the PDF worker failed to load",
          workerIssue: (pdfjsError as Error).message.includes("worker")
            ? "PDF worker loading failed - this is a common issue with PDF.js in browsers"
            : "Not a worker issue",
        };

        metadata.technical = {
          parseStatus: "Failed",
          errorType: (pdfjsError as Error).constructor.name,
          possibleCauses:
            "Worker loading failure, corrupted file, encryption, or unsupported PDF features",
        };

        return metadata;
      }
    } catch (error) {
      // Final fallback - return basic file info
      const metadata: FileMetadata = {
        basic: this.createBasicMetadata(file),
        content: {
          error: "Complete PDF analysis failed",
          details: error instanceof Error ? error.message : "Unknown error",
          suggestion: "File may be corrupted or inaccessible",
        },
        technical: {
          parseStatus: "Failed",
          errorType:
            error instanceof Error ? error.constructor.name : "Unknown",
        },
      };

      return metadata;
    }
  }

  static async analyzeAudio(file: File): Promise<FileMetadata> {
    try {
      // Use parseBlob instead of parseBuffer for browser compatibility
      const musicMetadata = await parseBlob(file);

      const metadata: FileMetadata = {
        basic: this.createBasicMetadata(file),
        technical: {},
        media: {},
        content: {},
      };

      metadata.content = {
        title: musicMetadata.common.title || "N/A",
        artist: musicMetadata.common.artist || "N/A",
        album: musicMetadata.common.album || "N/A",
        year: musicMetadata.common.year || "N/A",
        genre: musicMetadata.common.genre?.join(", ") || "N/A",
        track: musicMetadata.common.track?.no
          ? `${musicMetadata.common.track.no}${
              musicMetadata.common.track.of
                ? ` of ${musicMetadata.common.track.of}`
                : ""
            }`
          : "N/A",
        composer: musicMetadata.common.composer?.join(", ") || "N/A",
        comment: musicMetadata.common.comment?.join(", ") || "N/A",
        albumArtist: musicMetadata.common.albumartist || "N/A",
        date: musicMetadata.common.date || "N/A",
        label: musicMetadata.common.label?.join(", ") || "N/A",
        isrc: musicMetadata.common.isrc?.join(", ") || "N/A",
        barcode: musicMetadata.common.barcode || "N/A",
      };

      metadata.technical = {
        duration: musicMetadata.format.duration
          ? `${Math.floor(musicMetadata.format.duration / 60)}:${Math.floor(
              musicMetadata.format.duration % 60
            )
              .toString()
              .padStart(2, "0")}`
          : "N/A",
        bitrate: musicMetadata.format.bitrate
          ? `${musicMetadata.format.bitrate} kbps`
          : "N/A",
        sampleRate: musicMetadata.format.sampleRate
          ? `${musicMetadata.format.sampleRate} Hz`
          : "N/A",
        channels: musicMetadata.format.numberOfChannels || "N/A",
        codec:
          musicMetadata.format.codec || musicMetadata.format.container || "N/A",
        lossless: musicMetadata.format.lossless ? "Yes" : "No",
        bitsPerSample: musicMetadata.format.bitsPerSample || "N/A",
        tagTypes: musicMetadata.format.tagTypes?.join(", ") || "N/A",
      };

      metadata.media = {
        encoder:
          musicMetadata.format.tool || musicMetadata.common.encodedby || "N/A",
        codecProfile: musicMetadata.format.codecProfile || "N/A",
        container: musicMetadata.format.container || "N/A",
        quality: musicMetadata.format.lossless ? "Lossless" : "Lossy",
      };

      // Check for album art and additional metadata
      if (
        musicMetadata.common.picture &&
        musicMetadata.common.picture.length > 0
      ) {
        const picture = musicMetadata.common.picture[0];
        metadata.custom = {
          albumArt: {
            present: "Yes",
            format: picture.format || "Unknown",
            size: picture.data ? `${picture.data.length} bytes` : "Unknown",
            description: picture.description || "N/A",
            type: picture.type || "N/A",
          },
        };
      } else {
        metadata.custom = {
          albumArt: {
            present: "No",
          },
        };
      }

      return metadata;
    } catch (error) {
      throw new Error(
        `Failed to analyze audio file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async analyzeDocument(file: File): Promise<FileMetadata> {
    try {
      const metadata: FileMetadata = {
        basic: this.createBasicMetadata(file),
        content: {},
        technical: {},
      };

      const extension = this.getFileExtension(file.name);

      if (extension === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        metadata.content = {
          textContent:
            result.value.substring(0, 1000) +
            (result.value.length > 1000 ? "..." : ""),
          characterCount: result.value.length,
          wordCount: result.value.split(/\s+/).filter((word) => word.length > 0)
            .length,
          hasImages: result.messages.some((msg) =>
            msg.message.includes("image")
          )
            ? "Yes"
            : "No",
        };
      } else if (extension === "txt") {
        const text = await file.text();
        metadata.content = {
          textContent:
            text.substring(0, 1000) + (text.length > 1000 ? "..." : ""),
          characterCount: text.length,
          wordCount: text.split(/\s+/).filter((word) => word.length > 0).length,
          lineCount: text.split("\n").length,
        };
      } else if (extension === "json") {
        const text = await file.text();
        try {
          const jsonData = JSON.parse(text);
          metadata.content = {
            isValidJson: "Yes",
            objectType: Array.isArray(jsonData) ? "Array" : typeof jsonData,
            topLevelKeys:
              typeof jsonData === "object" && jsonData !== null
                ? Object.keys(jsonData).slice(0, 10).join(", ")
                : "N/A",
            characterCount: text.length,
          };
        } catch {
          metadata.content = {
            isValidJson: "No",
            characterCount: text.length,
            textPreview:
              text.substring(0, 500) + (text.length > 500 ? "..." : ""),
          };
        }
      } else if (extension === "yaml" || extension === "yml") {
        const text = await file.text();
        try {
          const yamlData = yaml.load(text);
          metadata.content = {
            isValidYaml: "Yes",
            objectType: Array.isArray(yamlData) ? "Array" : typeof yamlData,
            topLevelKeys:
              typeof yamlData === "object" && yamlData !== null
                ? Object.keys(yamlData as object)
                    .slice(0, 10)
                    .join(", ")
                : "N/A",
            characterCount: text.length,
          };
        } catch {
          metadata.content = {
            isValidYaml: "No",
            characterCount: text.length,
            textPreview:
              text.substring(0, 500) + (text.length > 500 ? "..." : ""),
          };
        }
      }

      return metadata;
    } catch (error) {
      throw new Error(
        `Failed to analyze document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async analyzeGenericFile(file: File): Promise<FileMetadata> {
    const metadata: FileMetadata = {
      basic: this.createBasicMetadata(file),
      technical: {},
      content: {},
    };

    // Try to read as text if it's small enough and might be text
    if (file.size < 1024 * 1024) {
      // Less than 1MB
      try {
        const text = await file.text();
        if (text && /^[\x20-\x7E\s]*$/.test(text.substring(0, 1000))) {
          // ASCII check
          metadata.content = {
            textPreview:
              text.substring(0, 500) + (text.length > 500 ? "..." : ""),
            characterCount: text.length,
            isLikelyText: "Yes",
          };
        }
      } catch {
        // File is likely binary
        metadata.content = {
          isLikelyText: "No",
          note: "Binary file or unsupported format",
        };
      }
    } else {
      metadata.content = {
        note: "File too large for content analysis",
        isLikelyText: "Unknown",
      };
    }

    return metadata;
  }

  static async analyzeFile(file: File): Promise<FileMetadata> {
    const extension = this.getFileExtension(file.name);
    const mimeType = file.type.toLowerCase();

    // Image files
    if (
      mimeType.startsWith("image/") ||
      ["jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "raw"].includes(
        extension
      )
    ) {
      return this.analyzeImage(file);
    }

    // PDF files
    if (mimeType === "application/pdf" || extension === "pdf") {
      return this.analyzePDF(file);
    }

    // Audio files
    if (
      mimeType.startsWith("audio/") ||
      ["mp3", "wav", "flac", "aac", "m4a", "ogg", "wma"].includes(extension)
    ) {
      return this.analyzeAudio(file);
    }

    // Document files
    if (
      ["txt", "docx", "json", "yaml", "yml", "xml", "csv"].includes(
        extension
      ) ||
      mimeType.includes("text/") ||
      mimeType.includes("application/json") ||
      mimeType.includes(
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      )
    ) {
      return this.analyzeDocument(file);
    }

    // Video files (basic analysis)
    if (
      mimeType.startsWith("video/") ||
      ["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(extension)
    ) {
      const metadata = await this.analyzeGenericFile(file);
      metadata.media = {
        note: "Video file detected - detailed analysis requires server-side processing",
        estimatedType: "Video",
      };
      return metadata;
    }

    // Archive files
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      const metadata = await this.analyzeGenericFile(file);
      metadata.technical = {
        note: "Archive file detected - contents not analyzed",
        archiveType: extension.toUpperCase(),
      };
      return metadata;
    }

    // Generic file analysis
    return this.analyzeGenericFile(file);
  }
}
