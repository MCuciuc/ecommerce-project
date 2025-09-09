import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { storeid: string }
}) {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
        redirect('/sign-in');
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: params.storeid,
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