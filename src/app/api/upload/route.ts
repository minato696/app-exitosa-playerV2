// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import sharp from 'sharp';

// Nota: Necesitas instalar sharp: npm install sharp

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'program' o 'station'
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      );
    }
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de archivo no válido. Solo se permiten JPG, PNG y WebP' },
        { status: 400 }
      );
    }
    
    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type || 'programs');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // Generar nombre único
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${timestamp}-${randomId}.webp`;
    const filePath = path.join(uploadDir, fileName);
    
    // Convertir imagen a WebP
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Procesar con sharp
    await sharp(buffer)
      .webp({ quality: 80 }) // Calidad 80 para buen balance entre calidad y tamaño
      .resize(800, 800, { // Redimensionar manteniendo aspecto
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(filePath);
    
    // URL pública
    const publicUrl = `/uploads/${type || 'programs'}/${fileName}`;
    
    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: fileName,
        originalName: file.name
      }
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar la imagen' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar imagen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'URL de imagen requerida' },
        { status: 400 }
      );
    }
    
    // Convertir URL a ruta de archivo
    const filePath = path.join(process.cwd(), 'public', imageUrl);
    
    // Verificar si existe y eliminar
    if (existsSync(filePath)) {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar imagen' },
      { status: 500 }
    );
  }
}