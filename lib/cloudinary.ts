// Configuración de Cloudinary para subir imágenes
// Cloudinary guarda las fotos y nos da una URL para usarlas

import { v2 as cloudinary } from "cloudinary";

// Configurar con las credenciales del archivo .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Función para subir una imagen a Cloudinary
// Recibe la imagen en formato base64 y regresa la URL
export async function uploadImage(base64Image: string): Promise<string> {
  const result = await cloudinary.uploader.upload(base64Image, {
    folder: "ryb-perfumes/productos", // Carpeta en Cloudinary
    transformation: [
      { width: 800, height: 800, crop: "fill" }, // Tamaño estándar
      { quality: "auto" },                        // Calidad automática
      { fetch_format: "auto" },                   // Formato óptimo
    ],
  });
  return result.secure_url;
}

// Función para eliminar una imagen de Cloudinary
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extraer el public_id correctamente de la URL de Cloudinary
    // La URL tiene formato: .../upload/v123456/carpeta/nombre.jpg
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
    const match = imageUrl.match(regex);
    if (match) {
      await cloudinary.uploader.destroy(match[1]);
    }
  } catch (error) {
    // Si falla al eliminar la imagen, continuamos igual
    console.error("Error al eliminar imagen de Cloudinary:", error);
  }
}