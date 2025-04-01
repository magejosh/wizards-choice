'use server'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { headers } from 'next/headers'

// In-memory store for non-Cloudflare environments
let memoryStore = {
  pageViews: 0,
  accessLogs: [] as { accessed_at: string; ip: string; path: string }[]
};

// Helper to check if we're in a Cloudflare environment
const isCloudflareEnv = async () => {
  try {
    const cf = await getCloudflareContext();
    return cf?.env?.DB != null;
  } catch {
    return false;
  }
};

// Helper to get current timestamp in ISO format
const getCurrentTimestamp = () => new Date().toISOString();

// Increment counter and log access
export async function incrementAndLog() {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const path = headersList.get('x-forwarded-host') || '/';
  
  // Check if we're in Cloudflare environment
  if (await isCloudflareEnv()) {
    const cf = await getCloudflareContext();
    
    const { results: countResults } = await cf.env.DB.prepare(
      'INSERT INTO counters (name, value) VALUES (?, 1) ON CONFLICT (name) DO UPDATE SET value = value + 1 RETURNING value'
    )
      .bind('page_views')
      .all();

    await cf.env.DB.prepare('INSERT INTO access_logs (ip, path, accessed_at) VALUES (?, ?, datetime())')
      .bind(ip, path)
      .run();

    const { results: logs } = await cf.env.DB.prepare('SELECT * FROM access_logs ORDER BY accessed_at DESC LIMIT 5').all();

    return {
      count: countResults[0].value,
      recentAccess: logs
    } as { count: number; recentAccess: { accessed_at: string }[] };
  } else {
    // Fallback to memory store for non-Cloudflare environments
    memoryStore.pageViews++;
    const newLog = {
      accessed_at: getCurrentTimestamp(),
      ip,
      path
    };
    memoryStore.accessLogs.unshift(newLog);
    memoryStore.accessLogs = memoryStore.accessLogs.slice(0, 5); // Keep only last 5 logs

    return {
      count: memoryStore.pageViews,
      recentAccess: memoryStore.accessLogs
    };
  }
}

// Get current stats
export async function getStats() {
  if (await isCloudflareEnv()) {
    const cf = await getCloudflareContext();
    const { results: count } = await cf.env.DB.prepare('SELECT value FROM counters WHERE name = ?')
      .bind('page_views')
      .all();

    const { results: logs } = await cf.env.DB.prepare(
      'SELECT accessed_at FROM access_logs ORDER BY accessed_at DESC LIMIT 5'
    ).all();

    return {
      count: count[0]?.value || 0,
      recentAccess: logs
    } as { count: number; recentAccess: { accessed_at: string }[] };
  } else {
    // Return memory store stats for non-Cloudflare environments
    return {
      count: memoryStore.pageViews,
      recentAccess: memoryStore.accessLogs
    };
  }
}
