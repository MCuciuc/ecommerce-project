import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ storeid: string }>
}) {
    const { storeid } = await params;
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
        redirect('/sign-in');
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: storeid,
            userId
        }
    })
    if (!store) {
        redirect('/')
    }

    return (
        <>
            <div>This will be a navbar</div>
            {children}
        </>
    );
}