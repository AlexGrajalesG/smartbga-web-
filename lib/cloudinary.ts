import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Mismo folder/convencion que scripts/upload-cloudinary.mjs: smartbga/productos/<slug>
export async function subirImagenProducto(archivo: File, slug: string): Promise<string> {
  const buffer = Buffer.from(await archivo.arrayBuffer());
  const dataUri = `data:${archivo.type};base64,${buffer.toString("base64")}`;

  const resultado = await cloudinary.uploader.upload(dataUri, {
    folder: `smartbga/productos/${slug}`,
    overwrite: true,
    quality: "auto",
    fetch_format: "auto",
  });

  return resultado.secure_url;
}
