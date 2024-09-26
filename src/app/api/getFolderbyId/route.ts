// src/api/getFolderById/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the import path to your Prisma client instance
import { z } from 'zod';

// Define validation schema using Zod


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get('folderId');

    if (!folderId) {
      return NextResponse.json({ error: 'Missing folderId' }, { status: 400 });
    }

    // Fetch the folder details by ID
    const folder = await db.folder.findUnique({
      where: { id: folderId },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Validate and transform the folder data if needed
    const parsedFolder = folder;

    return NextResponse.json(parsedFolder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
