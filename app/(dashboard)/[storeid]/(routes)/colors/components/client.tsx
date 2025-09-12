"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { ColorColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface ColorsClientProps {
    data: ColorColumn[]
}

export const ColorsClient = ({ data }: ColorsClientProps) => {
    
    const params = useParams()
    const router = useRouter()
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Colors (Total: ${data.length})`}
            description="Manage colors"
            />
            <Button aria-label="Create color" onClick={() => router.push(`/${params.storeid}/colors/new`)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data} />
        <Heading
            title="API"
            description="API calls for Colors"
            />
        <Separator />
        <ApiList entityName="colors" entityIdName="colorId" />
        </>
    )
}