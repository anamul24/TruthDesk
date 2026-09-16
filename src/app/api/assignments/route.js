import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { getSession } from "@/lib/authorize";
import { assignmentSchema } from "@/lib/validations";

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
    } else if (role === "editor") {
      query.editorId = userId;
    }

    const status = searchParams.get("status");
    if (status) {
      query.status = status;
    }

    const db = await getCollection(COLLECTIONS.ASSIGNMENTS);
    const assignments = await db.find(query).sort({ deadline: 1 }).toArray();

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error("GET /api/assignments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !["editor", "admin"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = assignmentSchema.parse(body);

    const db = await getCollection(COLLECTIONS.ASSIGNMENTS);
    
    const newAssignment = {
      ...validatedData,
      deadline: new Date(validatedData.deadline),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insertOne(newAssignment);

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("POST /api/assignments error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
