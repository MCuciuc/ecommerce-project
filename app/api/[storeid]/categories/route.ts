import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";

// Create a category for a store
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
        const { name, billboardId } = body as { name?: string; billboardId?: string };

        if (!name || name.trim().length === 0) {
            return new NextResponse("Name is required", { status: 400 });
        }
        if (!billboardId || billboardId.trim().length === 0) {
            return new NextResponse("Billboard id is required", { status: 400 });
        }

        // Verify the store belongs to the authenticated user
        const store = await prismadb.store.findFirst({
            where: { id: storeid, userId },
        });
        if (!store) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Create the category
        const category = await prismadb.category.create({
            data: {
                name: name.trim(),
                billboardId: billboardId.trim(),
                storeId: storeid,
            },
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        console.log('[CATEGORIES_POST]', error);
        reportError(error, { route: 'CATEGORIES_POST' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

// List all categories for a store
export async function GET(
    _req: Request,
    ctx: { params: Promise<{ storeid: string }> }
) {
    try {
        const { storeid } = await ctx.params;
        if (!storeid) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const categories = await prismadb.category.findMany({
            where: { storeId: storeid },
            include: { billboard: true },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(categories);
    } catch (error) {
        console.log('[CATEGORIES_GET]', error);
        reportError(error, { route: 'CATEGORIES_GET' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

