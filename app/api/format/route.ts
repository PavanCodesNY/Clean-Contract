import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const baseUrl = process.env.PYTHON_BACKEND_URL ?? "http://localhost:8000";

  try {
    const formData = await request.formData();
    const response = await fetch(`${baseUrl}/api/format`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: "Backend format request failed", detail },
        { status: response.status }
      );
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/pdf",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unable to reach backend", detail: String(error) },
      { status: 500 }
    );
  }
}
