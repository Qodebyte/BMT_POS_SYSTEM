export interface ImageUrl {
  filename?: string;
  url: string;
}


export function parseImageUrl(
  image_url?: string | ImageUrl[]
): ImageUrl[] {
  if (!image_url) return [];

  if (Array.isArray(image_url)) return image_url;

  if (typeof image_url === "string") {
    try {
      return JSON.parse(image_url) as ImageUrl[];
    } catch {
      return [];
    }
  }

  return [];
}


export function parseImageCartUrl(
  image_url: unknown
): { url: string }[] {
  if (!image_url) return [];

  
  if (Array.isArray(image_url)) return image_url as { url: string }[];

 
  if (typeof image_url === "string") {
    try {
      const parsed = JSON.parse(image_url);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

