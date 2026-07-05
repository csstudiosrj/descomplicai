/**
 * API Route: /api/uploadthing
 * File Router do UploadThing v7 para Pages Router (Next.js)
 */

import { createRouteHandler } from 'uploadthing/next-legacy';
import { createUploadthing } from 'uploadthing/server';

const f = createUploadthing();

const uploadRouter = {
  imageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 5,
    },
  }).onUploadComplete(({ file }) => {
    console.log('[UploadThing] Upload imagem completo:', file.url);
  }),
  pdfUploader: f({
    blob: {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(({ file }) => {
    console.log('[UploadThing] Upload PDF completo:', file.url);
  }),
};

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
