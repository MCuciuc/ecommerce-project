import prismadb from "@/lib/prismadb";
import { BillboardForm } from "./components/billboard-form";

const BillboardPage = async ({ params }: { params: Promise<{ billboardid: string }> }) => {
    const { billboardid } = await params;
    const isNew = billboardid === "new";

    let billboard: any = null;
    if (!isNew) {
        const client: any = prismadb as any;
        const model = client.billboards ?? client.billboard;
        if (model && typeof model.findUnique === "function") {
            billboard = await model.findUnique({
                where: { id: billboardid },
            });
        }
    }
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardForm initialData={billboard} />
            </div>
        </div>
    
    )
}

export default BillboardPage;