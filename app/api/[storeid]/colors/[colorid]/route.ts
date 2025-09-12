import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";

// Read a single color
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; colorid: string }> }
) {
  try {
    const { storeid, colorid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!colorid) return new NextResponse("Color id is required", { status: 400 });

    const color = await (prismadb as any).color.findUnique({
      where: { id: colorid },
    });

    if (!color || color.storeId !== storeid) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(color);
  } catch (error) {
    console.log("[COLOR_GET]", error);
    reportError(error, { route: "COLOR_GET" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Update a color
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ storeid: string; colorid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, colorid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!colorid) return new NextResponse("Color id is required", { status: 400 });

    const body = await req.json();
    const { name, value } = body as { name?: string; value?: string };
    if (!name || name.trim().length === 0)
      return new NextResponse("Name is required", { status: 400 });
    if (!value || value.trim().length === 0)
      return new NextResponse("Value is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    const updated = await (prismadb as any).color.update({
      where: { id: colorid },
      data: { name: name.trim(), value: value.trim() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.log("[COLOR_PATCH]", error);
    reportError(error, { route: "COLOR_PATCH" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete a color
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; colorid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, colorid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!colorid) return new NextResponse("Color id is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    await (prismadb as any).color.delete({ where: { id: colorid } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[COLOR_DELETE]", error);
    reportError(error, { route: "COLOR_DELETE" });
    return new NextResponse("Internal error", { status: 500 });
  }
}


