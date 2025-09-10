import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { storeid: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { storeid } = params;
        if (!storeid) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const body = await req.json();
        const { name } = body as { name?: string };
        if (!name || name.trim().length === 0) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const result = await prismadb.store.updateMany({
            where: { id: storeid, userId },
            data: { name: name.trim() },
        });

        if (result.count === 0) {
            return new NextResponse("Not found", { status: 404 });
        }

        const updated = await prismadb.store.findUnique({ where: { id: storeid } });
        return NextResponse.json(updated);
    } catch (error) {
        console.log('[STORE_PATCH]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { storeid: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { storeid } = params;
        if (!storeid) {
            return new NextResponse("Store id is required", { status: 400 });
        }

        const result = await prismadb.store.deleteMany({
            where: { id: storeid, userId },
        });

        if (result.count === 0) {
            return new NextResponse("Not found", { status: 404 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.log('[STORE_DELETE]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

 
