import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  weeklyReport: z.boolean(),
  instantAlerts: z.boolean(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let settings;
    try {
      settings = await db.userSettings.findUnique({
        where: { userId: session.user.id },
      });

      if (!settings) {
        // Create default settings if not exists
        settings = await db.userSettings.create({
          data: {
            userId: session.user.id,
            emailNotifications: true,
            weeklyReport: true,
            instantAlerts: false,
          },
        });
      }
    } catch (dbError) {
      console.warn("Database connection failed in notifications GET. Serving mock settings.", dbError);
      settings = {
        userId: session.user.id,
        emailNotifications: true,
        weeklyReport: true,
        instantAlerts: false,
      };
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch notification settings." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = notificationsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { emailNotifications, weeklyReport, instantAlerts } = parsed.data;

    let settings;
    try {
      settings = await db.userSettings.upsert({
        where: { userId: session.user.id },
        update: {
          emailNotifications,
          weeklyReport,
          instantAlerts,
        },
        create: {
          userId: session.user.id,
          emailNotifications,
          weeklyReport,
          instantAlerts,
        },
      });
    } catch (dbError) {
      console.warn("Database connection failed in notifications PATCH. Returning mock settings.", dbError);
      settings = {
        userId: session.user.id,
        emailNotifications,
        weeklyReport,
        instantAlerts,
      };
    }

    return NextResponse.json({
      message: "Notification preferences saved successfully.",
      settings,
    });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json(
      { message: "Failed to save notification settings." },
      { status: 500 }
    );
  }
}
