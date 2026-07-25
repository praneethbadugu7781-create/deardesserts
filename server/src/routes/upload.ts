import { Router } from 'express';
import crypto from 'crypto';

const router = Router();

/**
 * GET /api/upload/imagekit-auth
 * Generates authentication signature for secure ImageKit client uploads
 */
router.get('/imagekit-auth', (_req, res) => {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || 'private_u1ut08T9421ec/u572reDcP+rgI=';
  const token = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const expire = Math.floor(Date.now() / 1000) + 2400; // 40 mins validity

  const signature = crypto
    .createHmac('sha1', privateKey)
    .update(token + expire)
    .digest('hex');

  res.json({
    token,
    expire,
    signature,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'public_bz7bgQh2UVl7uULw2VZBpRBC9nE=',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/deardesserts',
  });
});

export default router;
