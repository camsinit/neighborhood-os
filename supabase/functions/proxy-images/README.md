# Image Proxy Function

This function proxies images from Supabase storage through the sending domain to improve email deliverability.

## Usage

Instead of using direct Supabase URLs:
```
https://nnwzfliblfuldwxpuata.supabase.co/storage/v1/object/public/neighborhood-assets/image.png
```

Use the proxy URL:
```
https://updates.neighborhoodos.com/functions/v1/proxy-images?path=neighborhood-assets/image.png
```

## Benefits

- ✅ Images served from the same domain as emails (updates.neighborhoodos.com)
- ✅ Better email deliverability (no suspicious external domains)
- ✅ Proper caching headers for performance
- ✅ CORS support for web usage

## Deployment

Deploy this function to Supabase:
```bash
supabase functions deploy proxy-images
```
