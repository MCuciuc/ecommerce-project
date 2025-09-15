"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { OrderColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"

interface OrdersClientProps {
    data: OrderColumn[]
}

export const OrdersClient = ({ data }: OrdersClientProps) => {
    
    const params = useParams()
    const router = useRouter()
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Orders (Total: ${data.length})`}
            description="Manage orders"
            />
            <Button aria-label="Create product" onClick={() => router.push(`/${params.storeid}/products/new`)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="products" columns={columns} data={data} />
        </>
    )
}