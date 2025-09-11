import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError, getServerRollbar } from "@/lib/rollbar";

// Read a single billboard
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; billboardid: string }> }
) {
  try {
    const { storeid, billboardid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!billboardid) return new NextResponse("Billboard id is required", { status: 400 });

    const billboard = await (prismadb as any).billboards.findUnique({
      where: { id: billboardid },
    });

    if (!billboard || billboard.storeId !== storeid) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    reportError(error, { route: "BILLBOARD_GET" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Update a billboard
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ storeid: string; billboardid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, billboardid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!billboardid) return new NextResponse("Billboard id is required", { status: 400 });

    const body = await req.json();
    const { label, imageUrl } = body as { label?: string; imageUrl?: string };
    if (!label || label.trim().length === 0)
      return new NextResponse("Label is required", { status: 400 });
    if (!imageUrl || imageUrl.trim().length === 0)
      return new NextResponse("Image URL is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    const updated = await (prismadb as any).billboards.update({
      where: { id: billboardid },
      data: { label: label.trim(), imageUrl: imageUrl.trim() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    reportError(error, { route: "BILLBOARD_PATCH" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete a billboard
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; billboardid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, billboardid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!billboardid) return new NextResponse("Billboard id is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    await (prismadb as any).billboards.delete({ where: { id: billboardid } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    reportError(error, { route: "BILLBOARD_DELETE" });
    return new NextResponse("Internal error", { status: 500 });
  }
}


