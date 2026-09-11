import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const uploadsDir = path.resolve(process.cwd(), 'uploads');

// Ensure directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Upload endpoint accepting Base64 image data
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64, filename } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'No image data provided' });
      return;
    }

    // Strip metadata prefix if present (e.g. data:image/jpeg;base64,)
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(imageBase64, 'base64');
    }

    // Limit file size to 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      res.status(400).json({ error: 'Image size exceeds 10MB limit' });
      return;
    }

    const uniqueName = `produce-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const targetPath = path.join(uploadsDir, uniqueName);

    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;
    res.status(201).json({
      message: 'Image uploaded successfully',
      url: publicUrl,
      filename: uniqueName,
    });
  } catch (err: any) {
    console.error('Image upload failed:', err);
    res.status(500).json({ error: err.message || 'Failed to process image upload' });
  }
});

export default router;
