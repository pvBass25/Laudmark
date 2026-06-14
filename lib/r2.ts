import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function getPresignedUploadUrl(key: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ContentType: contentType,
  })
  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 })
  const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`
  return { uploadUrl, publicUrl }
}

// Best-effort purge of stored files when their testimonials are deleted
// (GDPR — spec §14). Only touches objects under our own public base URL;
// failures are logged, never thrown, so a deletion flow can't be blocked
// by R2 being unreachable.
export async function deleteR2Objects(publicUrls: string[]): Promise<void> {
  const base = process.env.R2_PUBLIC_URL
  if (!base) return
  await Promise.all(publicUrls.map(async url => {
    if (!url.startsWith(`${base}/`)) return
    const key = url.slice(base.length + 1)
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }))
    } catch (err) {
      console.error('R2 delete failed for', key, err)
    }
  }))
}
