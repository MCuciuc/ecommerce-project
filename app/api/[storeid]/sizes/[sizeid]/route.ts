import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";

// Read a single size
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; sizeid: string }> }
) {
  try {
    const { storeid, sizeid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!sizeid) return new NextResponse("Size id is required", { status: 400 });

    const size = await (prismadb as any).size.findUnique({
      where: { id: sizeid },
    });

    if (!size || size.storeId !== storeid) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_GET]", error);
    reportError(error, { route: "SIZE_GET" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Update a size
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ storeid: string; sizeid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, sizeid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!sizeid) return new NextResponse("Size id is required", { status: 400 });

    const body = await req.json();
    const { name, value } = body as { name?: string; value?: string };
    if (!name || name.trim().length === 0)
      return new NextResponse("Name is required", { status: 400 });
    if (!value || value.trim().length === 0)
      return new NextResponse("Value is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    const updated = await (prismadb as any).size.update({
      where: { id: sizeid },
      data: { name: name.trim(), value: value.trim() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.log("[SIZE_PATCH]", error);
    reportError(error, { route: "SIZE_PATCH" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete a size
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; sizeid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, sizeid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!sizeid) return new NextResponse("Size id is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    await (prismadb as any).size.delete({ where: { id: sizeid } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[SIZE_DELETE]", error);
    reportError(error, { route: "SIZE_DELETE" });
    return new NextResponse("Internal error", { status: 500 });
  }
}


