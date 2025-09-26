import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";
import { Prisma } from "@prisma/client";

// Create a product for a store
export async function POST(
    req: Request,
    ctx: { params: Promise<{ storeid: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { storeid } = await ctx.params;
        if (!storeid) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const body = await req.json();
        const {
            name,
            price,
            categoryId,
            colorId,
            sizeId,
            images,
            isFeatured,
            isArchived,
        } = body as { name?: string; price?: number; categoryId?: string; colorId?: string; sizeId?: string; images?: { url: string }[]; isFeatured?: boolean; isArchived?: boolean };

        if (!name || name.trim().length === 0) return new NextResponse("Name is required", { status: 400 });
        if (!price || Number(price) <= 0) return new NextResponse("Price must be greater than 0", { status: 400 });
        if (!categoryId) return new NextResponse("Category id is required", { status: 400 });
        if (!sizeId) return new NextResponse("Size id is required", { status: 400 });
        if (!colorId) return new NextResponse("Color id is required", { status: 400 });
        if (!images || images.length === 0) return new NextResponse("At least one image is required", { status: 400 });

        // Verify the store belongs to the authenticated user
        const store = await prismadb.store.findFirst({ where: { id: storeid, userId } });
        if (!store) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const product = await prismadb.product.create({
            data: {
                name: name.trim(),
                price: new Prisma.Decimal(Number(price)),
                storeId: storeid,
                categoryId,
                sizeId,
                colorId,
                isFeatured: Boolean(isFeatured),
                isArchived: Boolean(isArchived),
                images: {
                    createMany: {
                        data: images.map((img) => ({ url: img.url })),
                    }
                }
            },
            include: { images: true },
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.log('[PRODUCTS_POST]', error);
        reportError(error, { route: 'PRODUCTS_POST' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

// List all products for a store
export async function GET(
    req: Request,
    ctx: { params: Promise<{ storeid: string }> }
) {
    try {
        const { storeid } = await ctx.params;
        if (!storeid) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId') || undefined;
        const sizeId = searchParams.get('sizeId') || undefined;
        const colorId = searchParams.get('colorId') || undefined;
        const isFeaturedParam = searchParams.get('isFeatured');
        const isArchivedParam = searchParams.get('isArchived');

        const isFeatured = typeof isFeaturedParam === 'string' ? isFeaturedParam === 'true' : undefined;
        const isArchived = typeof isArchivedParam === 'string' ? isArchivedParam === 'true' : undefined;

        const products = await prismadb.product.findMany({
            where: {
                storeId: storeid,
                categoryId,
                sizeId,
                colorId,
                isFeatured,
                isArchived,
            },
            orderBy: { createdAt: 'desc' },
            include: { images: true, category: true, size: true, color: true },
        });
        return NextResponse.json(products);
    } catch (error) {
        console.log('[PRODUCTS_GET]', error);
        reportError(error, { route: 'PRODUCTS_GET' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

