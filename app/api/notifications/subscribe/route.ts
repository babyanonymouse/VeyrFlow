import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { endpoint, keys } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return new NextResponse("Invalid subscription data", { status: 400 });
    }

    await connectDB();
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
      { upsert: true, new: true }
    );

    return new NextResponse("Subscribed", { status: 200 });
  } catch (error) {
    console.error("Subscription error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
