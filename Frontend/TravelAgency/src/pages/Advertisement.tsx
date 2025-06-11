
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, X, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

interface FormData {
  title: string;
  description: string;
  image: File | null;
}

interface FormErrors {
  title: string;
  description: string;
  image: string;
}

interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  uploadDate: string;
}

const Advertisement: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    image: null,
  });
  const [errors, setErrors] = useState<FormErrors>({
    title: "",
    description: "",
    image: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mock data for previous advertisements - in real app this would come from API
  const [previousAds] = useState<Advertisement[]>([
    {
      id: "1",
      title: "Discover Ethiopia's Hidden Gems",
      description: "Join us on an unforgettable journey through the ancient rock churches of Lalibela, the stunning landscapes of the Simien Mountains, and the vibrant culture of Addis Ababa.",
      imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=228&fit=crop",
      uploadDate: "2024-06-10"
    },
    {
      id: "2",
      title: "Cultural Heritage Tours",
      description: "Experience the rich history and traditions of Ethiopia with our expert guides.",
      imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=228&fit=crop",
      uploadDate: "2024-06-08"
    }
  ]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      title: "",
      description: "",
      image: "",
    };

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    // Description validation (optional but limited)
    if (formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    // Image validation
    if (!formData.image) {
      newErrors.image = "Image file is required";
    } else {
      const allowedFormats = ['.jpg', '.jpeg', '.png'];
      const fileName = formData.image.name.toLowerCase();
      const isValidFormat = allowedFormats.some(format => fileName.endsWith(format));
      
      if (!isValidFormat) {
        newErrors.image = "Only .jpg, .jpeg, and .png formats are allowed";
      } else if (formData.image.size > 2 * 1024 * 1024) { // 2MB in bytes
        newErrors.image = "Image file must be 2MB or less";
      }
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === "");
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
    
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      if (formData.image) {
        uploadData.append('image', formData.image);
      }

      // Simulate API call (replace with actual API endpoint)
      await new Promise(resolve => setTimeout(resolve, 3000));

      setUploadProgress(100);
      clearInterval(progressInterval);

      toast({
        title: "Success!",
        description: "Advertisement image uploaded successfully",
      });

      // Reset form
      setFormData({ title: "", description: "", image: null });
      setImagePreview(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload advertisement image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Advertisement</h1>
          <p className="text-gray-600 mt-2">
            Upload promotional images to showcase your travel agency's services and destinations
          </p>
        </div>

        {/* Upload Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Upload Advertisement Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title Field */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter advertisement title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                  maxLength={100}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
                <p className="text-gray-500 text-sm">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your advertisement content"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
                  maxLength={500}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <p className="text-gray-500 text-sm">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Image Upload Field */}
              <div className="space-y-2">
                <Label htmlFor="image-upload">Advertisement Image *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  {!formData.image ? (
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <div className="space-y-2">
                        <p className="text-gray-600">
                          Choose an image to upload
                        </p>
                        <p className="text-sm text-gray-500">
                          Maximum 2MB • .jpg, .jpeg, .png formats • Recommended 3.5:1 aspect ratio
                        </p>
                      </div>
                      <input
                        id="image-upload"
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-4"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        Select Image File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg border"
                            style={{ aspectRatio: '3.5/1' }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Image className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {formData.image.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(formData.image.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeImage}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                {errors.image && (
                  <p className="text-red-500 text-sm">{errors.image}</p>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="bg-[#4E7B34] hover:bg-[#3d6128] px-8"
                >
                  {isUploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Advertisement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* My Posts Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              My Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previousAds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No advertisements posted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {previousAds.map((ad) => (
                  <div key={ad.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-32 h-16 object-cover rounded flex-shrink-0"
                      style={{ aspectRatio: '3.5/1' }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {ad.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded on {new Date(ad.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Advertisement;
