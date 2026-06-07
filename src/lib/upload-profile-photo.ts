const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 2 * 1024 * 1024;

function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');
  }

  return { cloudName, uploadPreset };
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Please upload a JPEG, PNG, WebP, or GIF image.');
  }

  if (file.size > MAX_BYTES) {
    throw new Error('Profile photo must be smaller than 2 MB.');
  }

  const { cloudName, uploadPreset } = getCloudinaryConfig();
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', `niche-finder/profile-photos/${uid}`);
  formData.append('public_id', `avatar-${Date.now()}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error?.message || 'Failed to upload profile photo to Cloudinary.');
  }

  if (!payload.secure_url) {
    throw new Error('Cloudinary did not return an image URL.');
  }

  return payload.secure_url as string;
}
