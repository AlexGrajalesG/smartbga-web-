import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

// Verifica el tipo real del archivo por magic bytes (no confía en el MIME del cliente)
function detectarMimeReal(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return "image/webp"; // RIFF…WEBP
  return null;
}

// Mismo folder/convencion que scripts/upload-cloudinary.mjs: smartbga/productos/<slug>
export async function subirImagenProducto(archivo: File, slug: string): Promise<string> {
  if (archivo.size > MAX_SIZE) throw new Error("La imagen no puede pesar más de 5 MB.");

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const mimeReal = detectarMimeReal(buffer);
  if (!mimeReal) throw new Error("El archivo no es una imagen válida (JPEG, PNG, GIF o WebP).");

  const dataUri = `data:${mimeReal};base64,${buffer.toString("base64")}`;

  const resultado = await cloudinary.uploader.upload(dataUri, {
    folder: `smartbga/productos/${slug}`,
    overwrite: true,
    quality: "auto",
    fetch_format: "auto",
  });

  return resultado.secure_url;
}
