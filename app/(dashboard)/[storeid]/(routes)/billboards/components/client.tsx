"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { BillboardColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface BillboardsClientProps {
    data: BillboardColumn[]
}

export const BillboardsClient = ({ data }: BillboardsClientProps) => {
    
    const params = useParams()
    const router = useRouter()
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Billboards (Total: ${data.length})`}
            description="Manage billboards"
            />
            <Button aria-label="Create billboard" onClick={() => router.push(`/${params.storeid}/billboards/new`)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="label" columns={columns} data={data} />
        <Heading
            title="API"
            description="API calls for Billboards"
            />
        <Separator />
        <ApiList entityName="billboards" entityIdName="billboardId" />
        </>
    )
}