export default function imagekitLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}) {
  // If the image is an external URL (like Unsplash), just return it directly since it's already optimized by them
  if (src.startsWith('http')) {
    return src;
  }

  // Use the ImageKit endpoint if set, otherwise load local public asset directly
  const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL;
  if (!urlEndpoint) {
    return src;
  }
  
  // Format the path
  const path = src.startsWith('/') ? src.slice(1) : src;
  
  // Construct ImageKit transformation parameters
  const params = [`w-${width}`];
  if (quality) {
    params.push(`q-${quality || 75}`);
  }
  
  return `${urlEndpoint}/${path}?tr=${params.join(',')}`;
}
