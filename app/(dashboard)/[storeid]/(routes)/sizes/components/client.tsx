"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { SizeColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface SizesClientProps {
    data: SizeColumn[]
}

export const SizesClient = ({ data }: SizesClientProps) => {
    
    const params = useParams()
    const router = useRouter()
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Sizes (Total: ${data.length})`}
            description="Manage sizes"
            />
            <Button aria-label="Create size" onClick={() => router.push(`/${params.storeid}/sizes/new`)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data} />
        <Heading
            title="API"
            description="API calls for Sizes"
            />
        <Separator />
        <ApiList entityName="sizes" entityIdName="sizeId" />
        </>
    )
}