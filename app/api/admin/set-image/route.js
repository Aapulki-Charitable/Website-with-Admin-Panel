import { NextResponse } from 'next/server';
import { isLoggedIn } from '../../../../lib/auth';
import { getContent, saveContent, deleteFileIfOwned } from '../../../../lib/blob';

const ALLOWED_FIELDS = ['aboutImage', 'karyakarteImage', 'heroBgImage'];

export async function POST(request) {
  if (!(await isLoggedIn())) {
    return NextResponse.json({ error: 'लॉगिन आवश्यक आहे.' }, { status: 401 });
  }

  const { field, url } = await request.json();
  if (!ALLOWED_FIELDS.includes(field) || !url) {
    return NextResponse.json({ error: 'अवैध विनंती.' }, { status: 400 });
  }

  const content = await getContent();
  const oldUrl = content[field];
  content[field] = url;
  await saveContent(content);
  await deleteFileIfOwned(oldUrl);

  return NextResponse.json({ ok: true });
}
