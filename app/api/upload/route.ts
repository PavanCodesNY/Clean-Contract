import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const baseUrl = process.env.PYTHON_BACKEND_URL ?? "http://localhost:8000";

  try {
    const formData = await request.formData();
    const response = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: "Backend upload failed", detail },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to reach backend", detail: String(error) },
      { status: 500 }
    );
  }
}
