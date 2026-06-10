import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let accounts;
    try {
      accounts = await db.account.findMany({
        where: { userId: session.user!.id as string },
        orderBy: { name: "asc" },
      });
    } catch (dbError) {
      console.warn("Database connection failed in accounts API. Serving mock accounts.", dbError);
      const { mockAccounts } = require("@/data/mockData");
      accounts = mockAccounts.map((acc: any) => ({
        ...acc,
        userId: session.user!.id as string,
        plaidAccountId: acc.id,
        officialName: acc.officialName || null,
        subtype: acc.subtype || null,
        limitBalance: acc.limitBalance || null,
        isoCurrencyCode: "USD",
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    }

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Accounts GET error:", error);
    return NextResponse.json(
      { message: "Failed to fetch accounts." },
      { status: 500 }
    );
  }
}
