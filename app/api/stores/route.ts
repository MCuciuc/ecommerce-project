import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name } = body as { name?: string };

        if (!name || name.trim().length === 0) {
            return new NextResponse("Name is required", { status: 400 });
        }

        const created = await prismadb.store.create({
            data: {
                name: name.trim(),
                userId,
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}


