"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { ProductColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface ProductsClientProps {
    data: ProductColumn[]
}

export const ProductsClient = ({ data }: ProductsClientProps) => {
    
    const params = useParams()
    const router = useRouter()
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Products (Total: ${data.length})`}
            description="Manage products"
            />
            <Button aria-label="Create product" onClick={() => router.push(`/${params.storeid}/products/new`)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data} />
        <Heading
            title="API"
            description="API calls for Products"
            />
        <Separator />
        <ApiList entityName="products" entityIdName="productId" />
        </>
    )
}