import { generateDocument } from "../../../lib/generator";

export async function POST(request) {
  try {
    const body = await request.json();
    const { bullets, tone = "formal", length = "medium", letterType = "business", recipient = "", subject = "" } = body;

    if (!bullets || !bullets.trim()) {
      return Response.json(
        { error: "Please provide bullet points or key details to compose your document." },
        { status: 400 }
      );
    }

    const result = await generateDocument({
      bullets,
      tone,
      length,
      letterType,
      recipient,
      subject,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Generation API error:", error);
    return Response.json(
      { error: "An unexpected error occurred while generating the document." },
      { status: 500 }
    );
  }
}