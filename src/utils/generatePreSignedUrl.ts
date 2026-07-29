import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3Config"
import dotenv from 'dotenv';
dotenv.config();

interface GenerateUploadUrlParams {
  key: string;
  contentType: string;
}

export async function generateUploadUrl({
  key,
  contentType,
}: GenerateUploadUrlParams) {

  const command = new PutObjectCommand({
    Bucket: process.env.BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });

  return {
    uploadUrl
  };
}