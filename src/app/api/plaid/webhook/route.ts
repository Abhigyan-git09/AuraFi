import { NextResponse } from "next/server";
import { plaidClient } from "@/lib/plaid";
import { db } from "@/lib/db";

interface PlaidWebhookBody {
  webhook_type: string;
  webhook_code: string;
  item_id: string;
  error?: any;
  new_transactions?: number;
}

export async function POST(req: Request) {
  try {
    const body: PlaidWebhookBody = await req.json();
    const { webhook_type, webhook_code, item_id, error } = body;

    console.log(`Plaid webhook received: ${webhook_type} / ${webhook_code} for item ${item_id}`);

    // Verify the Plaid Item exists
    try {
      const plaidItem = await db.plaidItem.findUnique({
        where: { itemId: item_id },
      });

      if (!plaidItem) {
        console.warn(`Webhook received for unknown Plaid Item: ${item_id}`);
        return NextResponse.json({ message: "Item not found." }, { status: 404 });
      }

      switch (webhook_type) {
        case "TRANSACTIONS": {
          switch (webhook_code) {
            case "SYNC_UPDATES_AVAILABLE":
              console.log(`Sync available for item ${plaidItem.id}. Triggering sync.`);
              await syncTransactions({
                id: plaidItem.id,
                userId: plaidItem.userId,
                accessToken: plaidItem.accessToken,
                cursor: plaidItem.cursor,
              });
              break;

            case "DEFAULT_UPDATE":
              console.log(`Default transaction update for item ${plaidItem.id}`);
              break;

            case "INITIAL_UPDATE":
              console.log(`Initial transaction update for item ${plaidItem.id}`);
              break;

            case "HISTORICAL_UPDATE":
              console.log(`Historical transaction update for item ${plaidItem.id}`);
              break;

            case "TRANSACTIONS_REMOVED":
              console.log(`Transactions removed for item ${plaidItem.id}`);
              await syncTransactions(plaidItem);
              break;
          }
          break;
        }

        case "ITEM": {
          switch (webhook_code) {
            case "ERROR":
              console.error(`Plaid Item error for ${item_id}:`, error);
              break;

            case "PENDING_EXPIRATION":
              console.warn(`Plaid Item ${item_id} pending expiration`);
              break;

            case "USER_PERMISSION_REVOKED":
              console.warn(`User revoked permission for item ${item_id}`);
              await db.plaidItem.delete({ where: { id: plaidItem.id } });
              console.log(`Deleted Plaid Item ${plaidItem.id} after permission revocation.`);
              break;

            case "USER_ACCOUNT_REVOKED":
              console.warn(`Account revoked for item ${item_id}`);
              break;
          }
          break;
        }

        case "AUTH": {
          switch (webhook_code) {
            case "AUTOMATICALLY_VERIFIED":
              console.log(`Auth automatically verified for item ${item_id}`);
              break;
          }
          break;
        }

        default:
          console.log(`Unhandled webhook type: ${webhook_type}`);
      }
    } catch (dbError) {
      console.warn("Database connection failed during webhook processing.", dbError);
    }

    return NextResponse.json({ message: "Webhook received." });
  } catch (error) {
    console.error("Plaid webhook POST error:", error);
    return NextResponse.json(
      { message: "Failed to process webhook." },
      { status: 500 }
    );
  }
}

async function syncTransactions(plaidItem: {
  id: string;
  userId: string;
  accessToken: string;
  cursor: string | null;
}) {
  let cursor = plaidItem.cursor || undefined;
  let hasMore = true;

  while (hasMore) {
    const response = await plaidClient.transactionsSync({
      access_token: plaidItem.accessToken,
      cursor,
      count: 200,
    });

    const data = response.data;

    const accounts = await db.account.findMany({
      where: { itemId: plaidItem.id },
    });
    const accountMap = new Map(accounts.map((a) => [a.plaidAccountId, a.id]));

    for (const t of data.added) {
      const dbAccountId = accountMap.get(t.account_id);
      if (!dbAccountId) continue;

      await db.transaction.upsert({
        where: { plaidTransactionId: t.transaction_id },
        create: {
          plaidTransactionId: t.transaction_id,
          accountId: dbAccountId,
          userId: plaidItem.userId,
          name: t.name,
          merchantName: t.merchant_name || null,
          amount: t.amount,
          date: new Date(t.date),
          category: t.category || [],
          personalFinanceCategory: t.personal_finance_category?.primary || null,
          personalFinanceCategoryIcon: t.personal_finance_category_icon_url || null,
          isoCurrencyCode: t.iso_currency_code || "USD",
          pending: t.pending,
        },
        update: {
          name: t.name,
          merchantName: t.merchant_name || null,
          amount: t.amount,
          date: new Date(t.date),
          category: t.category || [],
          personalFinanceCategory: t.personal_finance_category?.primary || null,
          personalFinanceCategoryIcon: t.personal_finance_category_icon_url || null,
          isoCurrencyCode: t.iso_currency_code || "USD",
          pending: t.pending,
        },
      });
    }

    for (const t of data.modified) {
      const dbAccountId = accountMap.get(t.account_id);
      if (!dbAccountId) continue;

      await db.transaction.update({
        where: { plaidTransactionId: t.transaction_id },
        data: {
          name: t.name,
          merchantName: t.merchant_name || null,
          amount: t.amount,
          date: new Date(t.date),
          category: t.category || [],
          personalFinanceCategory: t.personal_finance_category?.primary || null,
          personalFinanceCategoryIcon: t.personal_finance_category_icon_url || null,
          isoCurrencyCode: t.iso_currency_code || "USD",
          pending: t.pending,
        },
      });
    }

    for (const t of data.removed) {
      if (t.transaction_id) {
        await db.transaction.deleteMany({
          where: { plaidTransactionId: t.transaction_id },
        });
      }
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  await db.plaidItem.update({
    where: { id: plaidItem.id },
    data: {
      cursor,
      lastSyncedAt: new Date(),
    },
  });
}
