/**
 * Skill: Shopify Analytics
 * Pulls products, customers, and orders from Shopify Admin API.
 * Computes KPIs (AOV, repeat rate, top products).
 */

import { supabaseAdmin } from "@/lib/supabase-admin";
import { decrypt } from "@/lib/crypto";

const SHOPIFY_API_VERSION = "2024-01";

interface ShopifyPaginatedOptions {
  storeUrl: string;
  accessToken: string;
  resource: string;
  params?: Record<string, string>;
}

async function fetchAllShopify<T>(options: ShopifyPaginatedOptions): Promise<T[]> {
  const { storeUrl, accessToken, resource, params = {} } = options;
  const items: T[] = [];
  const query = new URLSearchParams({ limit: "250", ...params }).toString();
  let url: string | null = `https://${storeUrl}/admin/api/${SHOPIFY_API_VERSION}/${resource}.json?${query}`;

  while (url) {
    const res: Response = await fetch(url, {
      headers: { "X-Shopify-Access-Token": accessToken },
    });
    if (!res.ok) {
      throw new Error(`Shopify ${resource} error (${res.status}): ${await res.text()}`);
    }
    const json: Record<string, T[]> = await res.json();
    items.push(...(json[resource] ?? []));

    // Parse Link header for pagination
    const linkHeader: string | null = res.headers.get("Link");
    const nextMatch: RegExpMatchArray | null | undefined = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
    url = nextMatch ? nextMatch[1] : null;
  }

  return items;
}

export interface ShopifySyncResult {
  products_count: number;
  customers_count: number;
  orders_count: number;
}

export async function syncShopifyData(
  merchantId: string,
  shopifyStoreUrl: string
): Promise<ShopifySyncResult> {
  // Get merchant's access token
  const { data: merchant } = await supabaseAdmin
    .from("merchants")
    .select("shopify_access_token")
    .eq("id", merchantId)
    .single();

  if (!merchant?.shopify_access_token) {
    throw new Error("No Shopify access token found");
  }

  const accessToken = decrypt(merchant.shopify_access_token);
  const storeUrl = shopifyStoreUrl.replace("https://", "").replace("/", "");

  // Fetch all data in parallel
  const [products, customers, orders] = await Promise.all([
    fetchAllShopify<Record<string, unknown>>({ storeUrl, accessToken, resource: "products" }),
    fetchAllShopify<Record<string, unknown>>({ storeUrl, accessToken, resource: "customers" }),
    fetchAllShopify<Record<string, unknown>>({
      storeUrl,
      accessToken,
      resource: "orders",
      params: {
        created_at_min: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        status: "any",
      },
    }),
  ]);

  // Upsert products
  if (products.length > 0) {
    const productRows = products.map((p) => ({
      merchant_id: merchantId,
      shopify_product_id: String(p.id),
      title: p.title,
      handle: p.handle,
      product_type: p.product_type,
      vendor: p.vendor,
      status: p.status,
      variants: p.variants,
      images: p.images,
    }));
    await supabaseAdmin.from("shopify_products").upsert(productRows, {
      onConflict: "merchant_id,shopify_product_id",
    });
  }

  // Upsert customers
  if (customers.length > 0) {
    const customerRows = customers.map((c) => ({
      merchant_id: merchantId,
      shopify_customer_id: String(c.id),
      email: c.email,
      first_name: c.first_name,
      last_name: c.last_name,
      orders_count: c.orders_count ?? 0,
      total_spent: parseFloat(String(c.total_spent ?? "0")),
      tags: c.tags,
    }));
    await supabaseAdmin.from("shopify_customers").upsert(customerRows, {
      onConflict: "merchant_id,shopify_customer_id",
    });
  }

  // Upsert orders
  if (orders.length > 0) {
    const orderRows = orders.map((o) => ({
      merchant_id: merchantId,
      shopify_order_id: String(o.id),
      shopify_customer_id: o.customer ? String((o.customer as Record<string, unknown>).id) : null,
      email: o.email,
      total_price: parseFloat(String(o.total_price ?? "0")),
      financial_status: o.financial_status,
      fulfillment_status: o.fulfillment_status,
      line_items: o.line_items,
    }));
    await supabaseAdmin.from("shopify_orders").upsert(orderRows, {
      onConflict: "merchant_id,shopify_order_id",
    });
  }

  return {
    products_count: products.length,
    customers_count: customers.length,
    orders_count: orders.length,
  };
}

export interface ShopifyKPIs {
  total_products: number;
  total_customers: number;
  total_orders: number;
  avg_order_value: number;
  repeat_purchase_rate: number;
  top_products: { title: string; order_count: number }[];
  lapsed_customers: number;
}

export async function getShopifyKPIs(merchantId: string): Promise<ShopifyKPIs> {
  const [
    { count: totalProducts },
    { count: totalCustomers },
    { data: orders },
    { data: customers },
  ] = await Promise.all([
    supabaseAdmin.from("shopify_products").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId),
    supabaseAdmin.from("shopify_customers").select("*", { count: "exact", head: true }).eq("merchant_id", merchantId),
    supabaseAdmin.from("shopify_orders").select("total_price, line_items, shopify_customer_id").eq("merchant_id", merchantId),
    supabaseAdmin.from("shopify_customers").select("shopify_customer_id, orders_count, total_spent, updated_at").eq("merchant_id", merchantId),
  ]);

  const orderList = orders ?? [];
  const customerList = customers ?? [];

  const totalRevenue = orderList.reduce((sum, o) => sum + (o.total_price ?? 0), 0);
  const avgOrderValue = orderList.length > 0 ? totalRevenue / orderList.length : 0;

  const repeatBuyers = customerList.filter((c) => (c.orders_count ?? 0) > 1).length;
  const repeatRate = customerList.length > 0 ? repeatBuyers / customerList.length : 0;

  // Top products by order frequency
  const productCounts: Record<string, number> = {};
  for (const order of orderList) {
    const items = (order.line_items as Array<Record<string, unknown>>) ?? [];
    for (const item of items) {
      const title = (item.title as string) ?? "Unknown";
      productCounts[title] = (productCounts[title] ?? 0) + 1;
    }
  }
  const topProducts = Object.entries(productCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([title, order_count]) => ({ title, order_count }));

  // Lapsed customers (no order in 90 days)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const lapsedCustomers = customerList.filter(
    (c) => (c.orders_count ?? 0) > 0 && c.updated_at < ninetyDaysAgo
  ).length;

  return {
    total_products: totalProducts ?? 0,
    total_customers: totalCustomers ?? 0,
    total_orders: orderList.length,
    avg_order_value: Math.round(avgOrderValue * 100) / 100,
    repeat_purchase_rate: Math.round(repeatRate * 1000) / 10,
    top_products: topProducts,
    lapsed_customers: lapsedCustomers,
  };
}
