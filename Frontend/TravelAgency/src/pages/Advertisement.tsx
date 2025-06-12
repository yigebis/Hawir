import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, X, CheckCircle, Loader2, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCloudinaryUploadPreset,
  uploadImageToCloudinary,
  addAdvertisement,
  FetchedAdvertisement,
  fetchAdvertisements,
  deleteAdvertisement
} from "@/lib/api/advertisementService";

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

const AdvertisementPage: React.FC = () => {
  const { toast } = useToast();
  const { agency, token } = useAuth();

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

  const [previousAds, setPreviousAds] = useState<FetchedAdvertisement[]>([]);
  const [loadingPreviousAds, setLoadingPreviousAds] = useState(true);
  const [errorPreviousAds, setErrorPreviousAds] = useState<string | null>(null);

  // Fetch previous advertisements on component mount and after add/delete
  const loadPreviousAds = useCallback(async () => {
    if (!agency?.unique_id) {
      setLoadingPreviousAds(false);
      setErrorPreviousAds("Agency ID not available to fetch previous ads. Please log in.");
      setPreviousAds([]);
      return;
    }
    setLoadingPreviousAds(true);
    setErrorPreviousAds(null);
    try {
      const fetchedAds = await fetchAdvertisements(agency.unique_id);

      // Sort by uploadDate (descending)
      const sortedAds = fetchedAds.sort((a, b) => {
        const dateA = new Date(a.uploadDate).getTime();
        const dateB = new Date(b.uploadDate).getTime();
        return dateB - dateA;
      });

      setPreviousAds(sortedAds);
    } catch (err: any) {
      console.error("Failed to fetch previous advertisements:", err);
      setErrorPreviousAds(err.message || "Failed to load previous advertisements.");
      setPreviousAds([]);
      toast({
        title: "Error Loading Previous Ads",
        description: err.message || "Could not fetch your previously posted advertisements.",
        variant: "destructive",
      });
    } finally {
      setLoadingPreviousAds(false);
    }
  }, [agency?.unique_id, toast]);

  useEffect(() => {
    loadPreviousAds();
  }, [loadPreviousAds]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {
      title: "",
      description: "",
      image: "",
    };

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 50) {
      newErrors.title = "Title must be 50 characters or less";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 700) {
      newErrors.description = "Description must be 700 characters or less";
    }

    if (!formData.image) {
      newErrors.image = "Image file is required";
    } else {
      const allowedFormats = ['.jpg', '.jpeg', '.png'];
      const fileName = formData.image.name.toLowerCase();
      const isValidFormat = allowedFormats.some(format => fileName.endsWith(format));

      if (!isValidFormat) {
        newErrors.image = "Only .jpg, .jpeg, and .png formats are allowed";
      } else if (formData.image.size > 2 * 1024 * 1024) {
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
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    if (!agency?.unique_id || !token) {
      toast({
        title: "Authentication Error",
        description: "Agency information or authentication token is missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let cloudinarySecureUrl: string | null = null;

    try {
      toast({
        title: "Starting Upload",
        description: "Retrieving Cloudinary credentials...",
        variant: "default",
      });
      const { cloud_name, upload_preset } = await getCloudinaryUploadPreset(token);
      console.log("Cloudinary credentials received:", { cloud_name, upload_preset });

      if (!formData.image) {
        throw new Error("No image file selected for upload.");
      }

      toast({
        title: "Uploading Image",
        description: "Please wait while your image is being uploaded.",
        variant: "default",
      });
      const cloudinaryResponse = await uploadImageToCloudinary(
        formData.image,
        cloud_name,
        upload_preset,
        (progress) => setUploadProgress(progress)
      );
      cloudinarySecureUrl = cloudinaryResponse.secure_url;
      console.log("Image uploaded to Cloudinary:", cloudinarySecureUrl);

      if (!cloudinarySecureUrl) {
        throw new Error("Cloudinary secure URL not obtained.");
      }

      const advertisementPayload = {
        title: formData.title,
        description: formData.description,
        media_url: cloudinarySecureUrl,
        agency_id: agency.unique_id,
      };

      toast({
        title: "Saving Advertisement",
        description: "Finalizing advertisement details...",
        variant: "default",
      });
      const backendResponse = await addAdvertisement(advertisementPayload, token);
      console.log("Advertisement added to backend:", backendResponse);

      toast({
        title: "Success!",
        description: (
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Advertisement uploaded successfully!
          </div>
        ),
        variant: "default",
      });

      setFormData({ title: "", description: "", image: null });
      setImagePreview(null);
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      loadPreviousAds(); // Refresh the list

    } catch (error: any) {
      console.error("Advertisement upload process failed:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload advertisement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteAdvertisement = useCallback(async (adId: string) => {
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Authentication token is missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this advertisement? This action cannot be undone.")) {
      return;
    }

    toast({
      title: "Deleting Advertisement",
      description: "Removing advertisement from your posts...",
      variant: "default",
    });

    try {
      await deleteAdvertisement(adId, token);
      toast({
        title: "Advertisement Deleted!",
        description: (
          <div className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Advertisement successfully removed.
          </div>
        ),
        variant: "default",
      });
      loadPreviousAds(); // Refresh the list after successful deletion
    } catch (error: any) {
      console.error(`Failed to delete advertisement ${adId}:`, error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete advertisement. Please try again.",
        variant: "destructive",
      });
    }
  }, [token, loadPreviousAds, toast]);


  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          {/* Applying the desired styles from the dialog title text */}
          <h1 className="text-[#F35B04] text-lg font-bold tracking-[2.4px] uppercase">
            ADVERTISEMENT
          </h1>
          {/* Applying styles to match DialogDescription, which is typically text-gray-600 and text-sm */}
          <p className="text-gray-600 mt-2 text-sm">
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
                  maxLength={50}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
                <p className="text-gray-500 text-sm">
                  {formData.title.length}/50 characters
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your advertisement content"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`min-h-[120px] ${errors.description ? 'border-red-500' : ''}`}
                  maxLength={700}
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
                <p className="text-gray-500 text-sm">
                  {formData.description.length}/700 characters
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
                        disabled={isUploading}
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
                            disabled={isUploading}
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
                          disabled={isUploading}
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
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
            {loadingPreviousAds ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                <p className="ml-3 text-gray-600">Loading previous advertisements...</p>
              </div>
            ) : errorPreviousAds ? (
              <div className="text-center py-8 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                <p>Failed to load your advertisements.</p>
                <p className="text-sm mt-2">Details: {errorPreviousAds}</p>
                <p className="text-sm mt-1">Please ensure you are logged in and try again.</p>
                <Button onClick={loadPreviousAds} className="mt-4 bg-[#F35B04] hover:bg-[#F35B04]/90">Try Again</Button>
              </div>
            ) : previousAds.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No advertisements posted yet. Start by uploading one above!</p>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-800 ml-auto flex-shrink-0"
                      onClick={() => handleDeleteAdvertisement(ad.id)}
                      title="Delete advertisement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default AdvertisementPage;
