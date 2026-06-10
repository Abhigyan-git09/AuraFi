import { NextResponse } from "next/server";
import { Products, CountryCode } from "plaid";
import { auth } from "@/auth";
import { plaidClient } from "@/lib/plaid";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const clientUserId = session.user.id as string;

    // Detect missing/placeholder Plaid keys and use mock fallback
    const isMockMode =
      !process.env.PLAID_CLIENT_ID ||
      !process.env.PLAID_SECRET ||
      process.env.PLAID_CLIENT_ID.includes("placeholder") ||
      process.env.PLAID_SECRET.includes("placeholder");

    if (isMockMode) {
      console.warn("Plaid keys not configured. Returning local development mock link token.");
      return NextResponse.json({ link_token: "mock_link_token_123" });
    }

    const request = {
      user: {
        client_user_id: clientUserId,
      },
      client_name: "AuraFi Personal Finance",
      products: ["auth", "transactions"] as Products[],
      country_codes: ["US"] as CountryCode[],
      language: "en",
    };

    const response = await plaidClient.linkTokenCreate(request);
    return NextResponse.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error("Error creating Plaid link token, falling back to mock:", error?.response?.data || error);
    return NextResponse.json({ link_token: "mock_link_token_fallback" });
  }
}
