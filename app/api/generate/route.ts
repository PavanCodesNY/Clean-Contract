import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const baseUrl = process.env.PYTHON_BACKEND_URL ?? "http://localhost:8000";

  try {
    const payload = await request.json();
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: "Backend generation request failed", detail },
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
