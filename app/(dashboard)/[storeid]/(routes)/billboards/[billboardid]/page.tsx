import prismadb from "@/lib/prismadb";

const BillboardPage = async ({ params }: { params: { billboardid: string } }) => {
    const billboard = await prismadb.billboards.findUnique({
        where: {
            id: params.billboardid,
        },
    });
    return (
        <div>
            existing billboard:{billboard?.label}
        </div>
    )
}

export default BillboardPage;