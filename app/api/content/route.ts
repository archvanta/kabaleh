import { content } from "@/lib/load-content";
export const dynamic = "force-static";
// Generated at build time; intentionally no unauthenticated write endpoints.
export function GET() {
  return Response.json(content);
}
