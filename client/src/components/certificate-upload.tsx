import { useRef, useState } from "react";
import { useUploadCertificate } from "@/hooks/use-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, AlertTriangle, Check, File, X } from "lucide-react";

interface CertificateUploadProps {
  currentCertificate?: string;
  onUploadSuccess?: (certificateUrl: string) => void;
}

export function CertificateUpload({ currentCertificate, onUploadSuccess }: CertificateUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const uploadCertificate = useUploadCertificate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    uploadCertificate.mutate(file, {
      onSuccess: (data) => {
        setFileName(null);
        onUploadSuccess?.(data.certificate);
      },
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      handleUpload(file);
    }
  };

  const getFileType = (url: string) => {
    if (url?.endsWith(".pdf")) return "pdf";
    if (url?.endsWith(".png") || url?.includes("png")) return "image";
    if (url?.endsWith(".jpg") || url?.endsWith(".jpeg") || url?.includes("jpg")) return "image";
    return "document";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="w-5 h-5 text-green-600" />
          Upload Certificate
        </CardTitle>
        <CardDescription>
          Upload your teaching certificate or qualification (JPG, PNG, PDF, max 2MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Certificate Display */}
        {currentCertificate && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Current Certificate</p>
                  <p className="text-xs text-gray-600 truncate max-w-xs">{currentCertificate}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        )}

        {/* Upload Area */}
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:bg-green-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            disabled={uploadCertificate.isPending}
            className="hidden"
          />

          <div className="space-y-2">
            {uploadCertificate.isPending ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto" />
                <p className="text-sm text-gray-600">Uploading {fileName}...</p>
              </>
            ) : uploadCertificate.isSuccess ? (
              <>
                <Check className="h-8 w-8 text-green-600 mx-auto" />
                <p className="text-sm text-green-600">Upload successful!</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-green-600 mx-auto" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, or PDF (max 2MB)</p>
              </>
            )}
          </div>
        </div>

        {/* File Requirements */}
        <Alert className="bg-green-50 border-green-200">
          <AlertTriangle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900">
            Supported formats: JPG, PNG, PDF • Maximum size: 2MB
          </AlertDescription>
        </Alert>

        {uploadCertificate.isError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              {(uploadCertificate.error as Error)?.message || "Upload failed"}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
