import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { OrdersClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({ params }: { params: { storeid: string } }) => {
    const { storeid } = params;

    const orders = await prismadb.order.findMany({
        where: {
            storeId: storeid,
        },
        include: {
            orderItems: {
                include: {
                    product: true,
                },
            },
        },
    });

    const formattedOrders: OrderColumn[] = orders.map((order) => ({
        id: order.id,
        phone: order.phone,
        address: order.address,
        isPaid: order.isPaid,
        products: order.orderItems.map((orderItem) => orderItem.product.name).join(", "),
        totalPrice: formatter.format(
            order.orderItems.reduce(
                (total, orderItem) => total + orderItem.product.price.toNumber(),
                0
            )
        ),
        orderItems: order.orderItems.map((orderItem) => orderItem.product.name),
        createdAt: format(order.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <OrdersClient data={formattedOrders} />
            </div>
        </div>
    );
};

export default OrdersPage;