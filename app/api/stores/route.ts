import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, userId } = body as { name?: string; userId?: string };

        if (!name || name.trim().length === 0) {
            return new NextResponse("Name is required", { status: 400 });
        }

        // If you have auth in place (e.g., Clerk), derive userId from the session instead.
        // For now, accept optional userId and default to empty string.
        const created = await prismadb.store.create({
            data: {
                name: name.trim(),
                userId: userId ?? "",
            },
        });

        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}


