/**
 * API Route: /api/uploadthing
 * File Router do UploadThing v7 para Pages Router (Next.js)
 * Usa uploadthing/next-legacy porque o projeto está em Pages Router.
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
    console.log('[UploadThing] Upload completo:', file.url);
  }),
};

export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});
