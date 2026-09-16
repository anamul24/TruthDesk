import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { getSession } from "@/lib/authorize";
import { pitchSchema } from "@/lib/validations";

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = session.user.role;
    const userId = session.user.id;
    
    let query = {};
    if (role === "journalist") {
      query.journalistId = userId;
    }

    const status = searchParams.get("status");
    if (status) {
      query.status = status;
    }

    const db = await getCollection(COLLECTIONS.PITCHES);
    const pitches = await db.find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({ pitches });
  } catch (error) {
    console.error("GET /api/pitches error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "journalist") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Auto-assign journalistId from session
    body.journalistId = session.user.id;
    
    const validatedData = pitchSchema.parse(body);

    const db = await getCollection(COLLECTIONS.PITCHES);
    
    const newPitch = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insertOne(newPitch);

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/pitches error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
