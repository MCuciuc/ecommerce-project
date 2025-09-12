import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";

// Read a single category
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; categoryid: string }> }
) {
  try {
    const { storeid, categoryid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!categoryid) return new NextResponse("Category id is required", { status: 400 });

    const category = await prismadb.category.findUnique({
      where: { id: categoryid },
      include: { billboard: true },
    });

    if (!category || category.storeId !== storeid) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    reportError(error, { route: "CATEGORY_GET" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Update a category
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ storeid: string; categoryid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, categoryid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!categoryid) return new NextResponse("Category id is required", { status: 400 });

    const body = await req.json();
    const { name, billboardId } = body as { name?: string; billboardId?: string };
    if (!name || name.trim().length === 0)
      return new NextResponse("Name is required", { status: 400 });
    if (!billboardId || billboardId.trim().length === 0)
      return new NextResponse("Billboard id is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    const updated = await prismadb.category.update({
      where: { id: categoryid },
      data: { name: name.trim(), billboardId: billboardId.trim() },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    reportError(error, { route: "CATEGORY_PATCH" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete a category
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; categoryid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, categoryid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!categoryid) return new NextResponse("Category id is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    await prismadb.category.delete({ where: { id: categoryid } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    reportError(error, { route: "CATEGORY_DELETE" });
    return new NextResponse("Internal error", { status: 500 });
  }
}


