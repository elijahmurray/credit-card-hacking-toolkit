import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface ProfileRow {
  data: Record<string, unknown> | null;
  onboarded: boolean | null;
  updated_at: string | null;
}

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: row } = await supabase
    .from("profiles")
    .select("data, onboarded, updated_at")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  const data = row?.data ?? null;
  const isEmpty = !data || Object.keys(data).length === 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Your profile
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/onboarding?force=true"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Redo my profile
          </Link>
          <Link
            href="/chat"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            Back to chat →
          </Link>
        </div>
      </div>

      {isEmpty ? (
        <div className="rounded-md border border-zinc-200 bg-white p-8 text-center">
          <p className="text-sm text-zinc-700">
            You haven&apos;t built your profile yet.
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Walk through the onboarding flow — about 5 minutes of short
            questions covering your card history, 5/24 status, and goals.
          </p>
          <Link
            href="/onboarding"
            className="mt-6 inline-flex items-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Start onboarding
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-zinc-100">
              {flatten(data).map(([key, value]) => (
                <tr key={key}>
                  <td className="w-1/3 px-4 py-2 align-top font-mono text-xs text-zinc-500">
                    {key}
                  </td>
                  <td className="px-4 py-2 align-top text-zinc-900">
                    {value === "" ? (
                      <span className="text-zinc-400">—</span>
                    ) : (
                      value
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {row?.updated_at && (
            <p className="border-t border-zinc-100 px-4 py-2 text-xs text-zinc-500">
              Last updated {new Date(row.updated_at).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Flatten the profile JSON to a list of [dotted.key, displayValue] tuples for
 * a simple read-only table. Arrays are stringified inline so they're scannable.
 */
function flatten(
  obj: unknown,
  prefix = "",
): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  if (obj === null || obj === undefined) return out;
  if (typeof obj !== "object") {
    out.push([prefix || "value", String(obj)]);
    return out;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      out.push([prefix, "[]"]);
    } else if (obj.every((x) => typeof x !== "object" || x === null)) {
      out.push([prefix, obj.map((x) => String(x)).join(", ")]);
    } else {
      out.push([prefix, `${obj.length} entries`]);
      obj.forEach((v, i) => {
        out.push(...flatten(v, `${prefix}[${i}]`));
      });
    }
    return out;
  }
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") {
      out.push(...flatten(v, key));
    } else {
      out.push([key, v === null || v === undefined ? "" : String(v)]);
    }
  }
  return out;
}
