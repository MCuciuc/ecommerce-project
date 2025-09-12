import prismadb from "@/lib/prismadb";
import { ColorForm } from "./components/color-form";

const ColorPage = async ({ params }: { params: Promise<{ colorid: string }> }) => {
    const { colorid } = await params;
    const isNew = colorid === "new";

    let color: any = null;
    if (!isNew) {
        const db = prismadb as any;
        const model = db.color ?? db.colors;
        if (model && typeof model.findUnique === "function") {
            color = await model.findUnique({
                where: { id: colorid },
            });
        }
    }
    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ColorForm initialData={color} />
            </div>
        </div>
    )
}

export default ColorPage;