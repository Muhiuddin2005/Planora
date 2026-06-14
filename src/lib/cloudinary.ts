import axios from "axios";

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (
    !cloudName ||
    !uploadPreset ||
    cloudName === "your_cloudinary_cloud_name" ||
    uploadPreset === "your_cloudinary_unsigned_preset_name"
  ) {
    throw new Error("Cloudinary settings are not configured in your environment (.env.local). Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );
    return response.data.secure_url;
  } catch (error: any) {
    const message = error.response?.data?.error?.message || error.message || "Failed to upload image to Cloudinary.";
    console.error("Cloudinary upload error:", error.response?.data || error);
    throw new Error(message);
  }
};
