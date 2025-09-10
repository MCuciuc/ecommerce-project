import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { SettingsForm } from "./components/settings-form";

interface SettingsPageProps {
    params: Promise<{
        storeid: string;
    }>
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in')
    }
    const { storeid } = await params;

    const store = await prismadb.store.findFirst({
        where: {
            id: storeid,
            userId,
        }
    });

    if (!store) {
        redirect('/')
    }



    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SettingsForm initialData={store} />
            </div>
        </div>
    );
}

export default SettingsPage;