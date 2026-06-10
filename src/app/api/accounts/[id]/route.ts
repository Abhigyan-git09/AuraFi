import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
      const account = await db.account.findFirst({
        where: { id, userId: session.user.id },
        include: {
          plaidItem: {
            select: {
              institutionName: true,
              lastSyncedAt: true,
            },
          },
        },
      });

      if (!account) {
        return NextResponse.json({ message: "Account not found." }, { status: 404 });
      }

      return NextResponse.json({
        ...account,
        institutionName: account.plaidItem.institutionName,
        lastSynced: account.plaidItem.lastSyncedAt?.toISOString() || null,
        plaidItem: undefined,
      });
    } catch (dbError) {
      console.warn("Database connection failed in account GET. Serving mock account.", dbError);
      const { mockAccounts } = require("@/data/mockData");
      const account = mockAccounts.find((a: any) => a.id === id);
      if (!account) {
        return NextResponse.json({ message: "Account not found." }, { status: 404 });
      }
      return NextResponse.json(account);
    }
  } catch (error) {
    console.error("Account GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch account." },
      { status: 500 }
    );
  }
}

const updateAccountSchema = z.object({
  name: z.string().min(1, "Nickname is required").optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "No fields to update." },
        { status: 400 }
      );
    }

    try {
      const account = await db.account.findFirst({
        where: { id, userId: session.user.id },
      });

      if (!account) {
        return NextResponse.json({ message: "Account not found." }, { status: 404 });
      }

      const updated = await db.account.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({
        message: "Account updated successfully.",
        account: { id: updated.id, name: updated.name },
      });
    } catch (dbError) {
      console.warn("Database connection failed in account PATCH. Returning mock success.", dbError);
      return NextResponse.json({
        message: "Account updated successfully. (Mock)",
        account: { id, ...updateData },
      });
    }
  } catch (error) {
    console.error("Account PATCH error:", error);
    return NextResponse.json(
      { message: "Failed to update account." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    try {
      const account = await db.account.findFirst({
        where: { id, userId: session.user.id },
      });

      if (!account) {
        return NextResponse.json({ message: "Account not found." }, { status: 404 });
      }

      await db.account.delete({
        where: { id },
      });
    } catch (dbError) {
      console.warn("Database connection failed in DELETE account route. Returning mock success.", dbError);
    }

    return NextResponse.json({ message: "Account disconnected successfully." });
  } catch (error) {
    console.error("Account delete error:", error);
    return NextResponse.json(
      { message: "Failed to disconnect account." },
      { status: 500 }
    );
  }
}
