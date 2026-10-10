import { NextRequest } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"

type AdminCheck = { ok: true; uid: string } | { ok: false; status: number; error: string }

export async function requireAdmin(req: NextRequest): Promise<AdminCheck> {
  const header = req.headers.get("authorization")
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) return { ok: false, status: 401, error: "Unauthorized" }

  try {
    const decoded = await adminAuth.verifyIdToken(token)
    if (decoded.admin !== true) return { ok: false, status: 403, error: "Forbidden" }
    return { ok: true, uid: decoded.uid }
  } catch {
    return { ok: false, status: 401, error: "Unauthorized" }
  }
}