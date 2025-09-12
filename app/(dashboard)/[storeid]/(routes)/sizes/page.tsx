import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { SizesClient } from "./components/client";
import { SizeColumn } from "./components/columns";

const SizesPage = async ({ params }: { params: Promise<{ storeid: string }> }) => {
    const { storeid } = await params;
    const db = prismadb as any;
    const sizeModel = db?.size ?? db?.sizes;
    const sizes = sizeModel ? await sizeModel.findMany({
        where: {
            storeId: storeid,
        },
        orderBy: { createdAt: 'desc' },
    }) : [];

    const formattedSizes: SizeColumn[] = (sizes as any[]).map((item: any): SizeColumn => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SizesClient data={formattedSizes} />
            </div>
        </div>
    )
}

export default SizesPage;