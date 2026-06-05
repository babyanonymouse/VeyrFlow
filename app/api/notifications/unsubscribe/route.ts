import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";

export async function DELETE(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await request.json();
    const { endpoint } = body;

    await connectDB();
    await PushSubscription.deleteOne({ endpoint, userId });

    return new NextResponse("Unsubscribed", { status: 200 });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
