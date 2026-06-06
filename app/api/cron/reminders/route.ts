import { NextResponse, NextRequest } from "next/server";
import webpush from "web-push";
import { connectDB } from "@/lib/db";
import PushSubscription from "@/models/PushSubscription";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Configure webpush details inside the handler to prevent build-time errors when VAPID keys are missing
  webpush.setVapidDetails(
    "mailto:your-email@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );

  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  await connectDB();

  try {
    const subscriptions = await PushSubscription.find({});

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: "VeyrFlow",
            body: "Time to check your habits!",
          })
        );
      } catch (error: any) {
        // Prune expired or invalid subscriptions
        if (error.statusCode === 410 || error.statusCode === 404) {
          await PushSubscription.deleteOne({ _id: sub._id });
          console.log(`Pruned inactive subscription: ${sub.endpoint}`);
        } else {
          console.error(`Failed to send notification to ${sub.endpoint}:`, error);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    return NextResponse.json({ success: true, dispatchedCount: subscriptions.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
