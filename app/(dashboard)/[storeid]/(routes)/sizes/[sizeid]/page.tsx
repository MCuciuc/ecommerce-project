import prismadb from "@/lib/prismadb";
import { SizeForm } from "./components/size-form";

const SizePage = async ({ params }: { params: Promise<{ sizeid: string }> }) => {
    const { sizeid } = await params;
    const isNew = sizeid === "new";

    let size: any = null;
    if (!isNew) {
        const db = prismadb as any;
        const model = db.size ?? db.sizes;
        if (model && typeof model.findUnique === "function") {
            size = await model.findUnique({
                where: { id: sizeid },
            });
        }
    }
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SizeForm initialData={size} />
            </div>
        </div>
    )
}

export default SizePage;