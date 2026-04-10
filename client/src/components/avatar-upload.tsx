import { useRef, useState } from "react";
import { useUploadAvatar } from "@/hooks/use-upload";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, AlertTriangle, Check } from "lucide-react";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName: string;
  onUploadSuccess?: (avatarUrl: string) => void;
}

export function AvatarUpload({ currentAvatar, userName, onUploadSuccess }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const uploadAvatar = useUploadAvatar();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    uploadAvatar.mutate(file, {
      onSuccess: (data) => {
        setPreview(null);
        onUploadSuccess?.(data.avatar);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      handleUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload Avatar
        </CardTitle>
        <CardDescription>
          Drag and drop or click to upload your profile picture (JPG, PNG, max 2MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview or Current Avatar */}
        <div className="flex justify-center">
          <Avatar className="h-32 w-32 ring-4 ring-blue-200">
            <AvatarImage src={preview || currentAvatar || undefined} />
            <AvatarFallback className="text-2xl font-bold">{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>

        {/* Upload Area */}
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={uploadAvatar.isPending}
            className="hidden"
          />

          <div className="space-y-2">
            {uploadAvatar.isPending ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : uploadAvatar.isSuccess ? (
              <>
                <Check className="h-8 w-8 text-green-600 mx-auto" />
                <p className="text-sm text-green-600">Upload successful!</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-blue-600 mx-auto" />
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG or JPG (max 2MB)</p>
              </>
            )}
          </div>
        </div>

        {/* File Requirements */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            Supported formats: JPG, PNG • Maximum size: 2MB
          </AlertDescription>
        </Alert>

        {uploadAvatar.isError && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-sm text-red-900">
              {(uploadAvatar.error as Error)?.message || "Upload failed"}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
