"use client"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Plus } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export const BillboardsClient = () => {
    const params = useParams()
    const router = useRouter()
    return (
        <>
        <div className="flex items-center justify-between">
            <Heading
            title="Billboards"
            description="Manage billboards"
            />
            <Button onClick={() => router.push(`/${params.storeid}/billboards/new`)}>
                <Plus className="h-4 w-4" />
            </Button>
        </div>
        <Separator />
        </>
    )
}