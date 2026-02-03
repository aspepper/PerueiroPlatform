import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL;

function getR2Client() {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error("R2 credentials ausentes.");
  }

  return new S3Client({
    region: process.env.R2_REGION || "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

function ensureBucket() {
  if (!BUCKET_NAME) {
    throw new Error("R2_BUCKET_NAME ausente.");
  }
  if (!PUBLIC_BASE_URL) {
    throw new Error("R2_PUBLIC_BASE_URL ausente.");
  }
}

async function uploadObject(
  key: string,
  buffer: Buffer,
  contentType: string,
) {
  ensureBucket();
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${PUBLIC_BASE_URL}/${key}`;
}

export async function uploadOriginalContract(buffer: Buffer, contractId: string) {
  const key = `contracts/original/${contractId}.pdf`;
  return uploadObject(key, buffer, "application/pdf");
}

export async function uploadSignedContract(
  buffer: Buffer,
  contractId: string,
  contentType: string,
) {
  const extension =
    contentType === "application/pdf"
      ? "pdf"
      : contentType === "image/jpeg"
        ? "jpg"
        : "png";
  const key = `contracts/signed/${contractId}.${extension}`;
  return uploadObject(key, buffer, contentType);
}
