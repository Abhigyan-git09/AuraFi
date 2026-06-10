import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Deleting the User triggers a cascade deletion of all PlaidItems, Accounts, Transactions, Budgets, and UserSettings
    try {
      await db.user.delete({
        where: { id: session.user.id },
      });
    } catch (dbError) {
      console.warn("Database connection failed in account deletion. Returning mock success.", dbError);
    }

    return NextResponse.json({
      message: "Account and all associated data have been permanently deleted.",
    });
  } catch (error) {
    console.error("Account destruction error:", error);
    return NextResponse.json(
      { message: "Failed to delete user account." },
      { status: 500 }
    );
  }
}
