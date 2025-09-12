"use client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { CategoryColumn, columns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { ApiList } from "@/components/ui/api-list"

interface CategoriesClientProps {
    data: CategoryColumn[]
}

export const CategoriesClient = ({ data }: CategoriesClientProps) => {
    const params = useParams()
    const router = useRouter()
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading
            title={`Categories (Total: ${data.length})`}
            description="Manage categories"
            />
            <Button aria-label="Create category" onClick={() => router.push(`/${params.storeid}/categories/new`)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        <DataTable searchKey="name" columns={columns} data={data} />
        <Heading
            title="API"
            description="API calls for Categories"
            />
        <Separator />
        <ApiList entityName="categories" entityIdName="categoryId" />
        </>
    )
}