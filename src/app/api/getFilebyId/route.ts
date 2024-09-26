// src/api/getFileById/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; // Adjust the import path to your Prisma client instance
import { z } from 'zod';


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    // Fetch the file details by ID
    const file = await db.file.findUnique({
      where: { id: fileId },
    });

    // console.log(file?.data)

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Validate and transform the file data if needed
    const parsedFile = file;

    return NextResponse.json(parsedFile);
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
