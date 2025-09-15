import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";
import { Prisma } from "@prisma/client";

// Read a single product
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; productid: string }> }
) {
  try {
    const { storeid, productid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!productid) return new NextResponse("Product id is required", { status: 400 });

    const product = await prismadb.product.findUnique({
      where: { id: productid },
      include: { images: true, category: true, size: true, color: true },
    });

    if (!product || product.storeId !== storeid) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    reportError(error, { route: "PRODUCT_GET" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Update a product
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ storeid: string; productid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, productid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!productid) return new NextResponse("Product id is required", { status: 400 });

    const body = await req.json();
    const { name, price, categoryId, colorId, sizeId, images, isFeatured, isArchived } = body as {
      name?: string; price?: number; categoryId?: string; colorId?: string; sizeId?: string; images?: { url: string }[]; isFeatured?: boolean; isArchived?: boolean
    };

    if (!name || name.trim().length === 0) return new NextResponse("Name is required", { status: 400 });
    if (!price || Number(price) <= 0) return new NextResponse("Price must be greater than 0", { status: 400 });
    if (!categoryId) return new NextResponse("Category id is required", { status: 400 });
    if (!sizeId) return new NextResponse("Size id is required", { status: 400 });
    if (!colorId) return new NextResponse("Color id is required", { status: 400 });
    if (!images || images.length === 0) return new NextResponse("At least one image is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    // Update product and replace images atomically
    const updated = await prismadb.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id: productid },
        data: {
          name: name.trim(),
          price: new Prisma.Decimal(Number(price)),
          categoryId,
          sizeId,
          colorId,
          isFeatured: Boolean(isFeatured),
          isArchived: Boolean(isArchived),
        },
      });
      await tx.image.deleteMany({ where: { productId: productid } });
      await tx.image.createMany({ data: images.map((img) => ({ url: img.url, productId: productid })) });
      return prod;
    });

    const productWithImages = await prismadb.product.findUnique({ where: { id: productid }, include: { images: true } });
    return NextResponse.json(productWithImages);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    reportError(error, { route: "PRODUCT_PATCH" });
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete a product
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ storeid: string; productid: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { storeid, productid } = await ctx.params;
    if (!storeid) return new NextResponse("Store id is required", { status: 400 });
    if (!productid) return new NextResponse("Product id is required", { status: 400 });

    // Ensure store belongs to user
    const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
    if (!store) return new NextResponse("Forbidden", { status: 403 });

    await prismadb.product.delete({ where: { id: productid } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    reportError(error, { route: "PRODUCT_DELETE" });
    return new NextResponse("Internal error", { status: 500 });
  }
}


