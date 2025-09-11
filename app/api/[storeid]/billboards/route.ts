import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";

// Create a billboard for a store
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
        const { label, imageUrl } = body as { label?: string; imageUrl?: string };

        if (!label || label.trim().length === 0) {
            return new NextResponse("Label is required", { status: 400 });
        }
        if (!imageUrl || imageUrl.trim().length === 0) {
            return new NextResponse("Image URL is required", { status: 400 });
        }

        // Verify the store belongs to the authenticated user
        const store = await prismadb.store.findFirst({
            where: { id: storeid, userId },
        });
        if (!store) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const client: any = prismadb as any;
        const model = client.billboards ?? client.billboard;
        if (!model) {
            console.error('[BILLBOARDS_POST] Prisma model not found');
            reportError(new Error('Prisma model not found'), { route: 'BILLBOARDS_POST' });
            return new NextResponse("Internal error", { status: 500 });
        }
        const billboard = await model.create({
            data: {
                label: label.trim(),
                imageUrl: imageUrl.trim(),
                storeId: storeid,
            },
        });

        return NextResponse.json(billboard, { status: 201 });
    } catch (error) {
        console.log('[BILLBOARDS_POST]', error);
        reportError(error, { route: 'BILLBOARDS_POST' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

// List all billboards for a store
export async function GET(
    _req: Request,
    ctx: { params: Promise<{ storeid: string }> }
) {
    try {
        const { storeid } = await ctx.params;
        if (!storeid) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const client: any = prismadb as any;
        const model = client.billboards ?? client.billboard;
        if (!model) {
            console.error('[BILLBOARDS_GET] Prisma model not found');
            reportError(new Error('Prisma model not found'), { route: 'BILLBOARDS_GET' });
            return new NextResponse("Internal error", { status: 500 });
        }
        const billboards = await model.findMany({
            where: { storeId: storeid },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(billboards);
    } catch (error) {
        console.log('[BILLBOARDS_GET]', error);
        reportError(error, { route: 'BILLBOARDS_GET' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

