import prismadb from "@/lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({ params }: { params: Promise<{ productid: string; storeid: string }> }) => {
    const { productid, storeid } = await params;
    const isNew = productid === "new";

    let product: any = null;
    if (!isNew) {
        const dbProduct = await prismadb.product.findUnique({
            where: {
                id: productid,
            },
            include: {
                images: true,
            },
        });
        if (dbProduct) {
            product = {
                id: dbProduct.id,
                name: dbProduct.name,
                price: Number((dbProduct as any).price),
                categoryId: dbProduct.categoryId,
                sizeId: dbProduct.sizeId,
                colorId: dbProduct.colorId,
                isFeatured: dbProduct.isFeatured,
                isArchived: dbProduct.isArchived,
                images: dbProduct.images.map((img) => ({ id: img.id, url: img.url })),
            };
        }
    }

    const [categories, sizes, colors] = await Promise.all([
        prismadb.category.findMany({ where: { storeId: storeid }, orderBy: { createdAt: 'desc' } }),
        prismadb.size.findMany({ where: { storeId: storeid }, orderBy: { createdAt: 'desc' } }),
        prismadb.color.findMany({ where: { storeId: storeid }, orderBy: { createdAt: 'desc' } }),
    ]);

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ProductForm initialData={product} categories={categories} sizes={sizes} colors={colors} />
            </div>
        </div>
    )
}

export default ProductPage;