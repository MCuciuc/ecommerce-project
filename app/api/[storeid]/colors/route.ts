import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { reportError } from "@/lib/rollbar";

// Create a color for a store
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
        const { name, value } = body as { name?: string; value?: string };

        if (!name || name.trim().length === 0) {
            return new NextResponse("Name is required", { status: 400 });
        }
        if (!value || value.trim().length === 0) {
            return new NextResponse("Value is required", { status: 400 });
        }

        // Verify the store belongs to the authenticated user
        const store = await prismadb.store.findFirst({
            where: { id: storeid, userId },
        });
        if (!store) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const color = await (prismadb as any).color.create({
            data: {
                name: name.trim(),
                value: value.trim(),
                storeId: storeid,
            },
        });

        return NextResponse.json(color, { status: 201 });
    } catch (error) {
        console.log('[COLORS_POST]', error);
        reportError(error, { route: 'COLORS_POST' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

// List all colors for a store
export async function GET(
    _req: Request,
    ctx: { params: Promise<{ storeid: string }> }
) {
    try {
        const { storeid } = await ctx.params;
        if (!storeid) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const colors = await (prismadb as any).color.findMany({
            where: { storeId: storeid },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(colors);
    } catch (error) {
        console.log('[COLORS_GET]', error);
        reportError(error, { route: 'COLORS_GET' });
        return new NextResponse("Internal error", { status: 500 });
    }
}

