import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { requireOperatorPermission } from '@server/modules/admin/guards';

export const runtime = 'nodejs';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function matchesImageSignature(bytes: Buffer, mime: string) {
  if (mime === 'image/jpeg') return bytes.length >= 3 && bytes.subarray(0, 3).toString('hex') === 'ffd8ff';
  if (mime === 'image/png') return bytes.length >= 8 && bytes.subarray(0, 8).toString('hex') === '89504e470d0a1a0a';
  if (mime === 'image/gif') return bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString());
  if (mime === 'image/webp') return bytes.length >= 12 && bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  return false;
}

export async function POST(request: Request) {
  const access = await requireOperatorPermission('products');
  if (!access.authorized) return access.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Dữ liệu tải lên không hợp lệ' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File) || !EXTENSIONS[file.type] || file.size === 0 || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Ảnh phải là JPG, PNG, WEBP hoặc GIF và không quá 5MB' }, { status: 400 });
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  if (!matchesImageSignature(bytes, file.type)) {
    return NextResponse.json({ error: 'Nội dung file không phải ảnh hợp lệ' }, { status: 400 });
  }
  const filename = `${Date.now()}-${randomBytes(8).toString('hex')}${EXTENSIONS[file.type]}`;
  const directory = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes, { flag: 'wx' });
  return NextResponse.json({ url: `/uploads/${filename}` });
}
