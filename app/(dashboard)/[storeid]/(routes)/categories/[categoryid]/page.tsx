import prismadb from "@/lib/prismadb";
import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({ params }: { params: Promise<{ categoryid: string, storeid: string }> }) => {
    const { categoryid, storeid } = await params;
    const isNew = categoryid === "new";

    let category: any = null;
    if (!isNew) {
        category = await prismadb.category.findUnique({
            where: { id: categoryid },
        });
    }

    const billboards = await prismadb.billboards.findMany({
        where: {
            storeId: storeid,
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, label: true },
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoryForm initialData={category} billboards={billboards} />
            </div>
        </div>
    )
}

export default CategoryPage;