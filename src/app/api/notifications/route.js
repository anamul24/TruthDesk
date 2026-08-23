import { NextResponse } from "next/server";
import { getCollection, COLLECTIONS } from "@/lib/db";
import { requireAuthAPI } from "@/lib/authorize";

// GET notifications for current user
export async function GET(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);

    // Get notifications for this user OR broadcast notifications for their role
    const query = {
      $or: [
        { userId: session.user.id },
        { userId: session.user.role + "s" }, // e.g., "editors" broadcast
      ],
    };

    const [notifications, total, unreadCount] = await Promise.all([
      collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
      collection.countDocuments({ ...query, read: false }),
    ]);

    const serialized = notifications.map((n) => ({
      ...n,
      _id: n._id.toString(),
    }));

    return NextResponse.json({
      notifications: serialized,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// PUT - mark notifications as read
export async function PUT(request) {
  try {
    const { session, error } = await requireAuthAPI();
    if (error) return error;

    const body = await request.json();
    const { notificationIds, markAllRead } = body;

    const collection = await getCollection(COLLECTIONS.NOTIFICATIONS);

    if (markAllRead) {
      await collection.updateMany(
        {
          $or: [
            { userId: session.user.id },
            { userId: session.user.role + "s" },
          ],
          read: false,
        },
        { $set: { read: true } }
      );
    } else if (notificationIds && notificationIds.length > 0) {
      const { ObjectId } = await import("mongodb");
      await collection.updateMany(
        {
          _id: { $in: notificationIds.map((id) => new ObjectId(id)) },
        },
        { $set: { read: true } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update notifications:", err);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
