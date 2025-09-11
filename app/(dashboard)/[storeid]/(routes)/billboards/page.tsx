import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { BillboardsClient } from "./components/client";
import { BillboardColumn } from "./components/columns";

const BillboardsPage = async ({ params }: { params: Promise<{ storeid: string }> }) => {
    const { storeid } = await params;
    const billboards = await prismadb.billboards.findMany({
        where: {
            storeId: storeid,
        },
    });

    const formattedBillboards: BillboardColumn[] = billboards.map((item) => ({
        id: item.id,
        label: item.label,
        createdAt: (format(item.createdAt, "MMMM do, yyyy")),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardsClient data={formattedBillboards} />
            </div>
        </div>
    )

}

export default BillboardsPage;