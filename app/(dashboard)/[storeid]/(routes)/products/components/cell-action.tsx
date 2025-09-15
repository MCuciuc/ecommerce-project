"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ProductColumn } from "./columns"
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Trash } from "lucide-react"
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import toast from "react-hot-toast"
import { useRouter, useParams } from "next/navigation"
import { useState } from "react"
import axios from "axios"
import { AlertModal } from "@/components/ui/modals/alert-modal"

interface CellActionProps {
    data: ProductColumn
}

export const CellAction = ({ data }: CellActionProps) => {

    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    
    const onDelete = async () => {
        try {
            setLoading(true);
            const storeid = params.storeid as string;
            if (!data) return;
            await axios.delete(`/api/${storeid}/products/${data.id}`);
            toast.success("Product deleted.");
            router.push(`/${storeid}/products`);
            router.refresh();
        } catch (error) {
            toast.error("Make sure you removed all dependencies first.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }
    
    const router = useRouter();
    const params = useParams();
    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Product Id copied to clipboard");
    }
    return (
        <>
        <AlertModal 
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">   
            <DropdownMenuLabel>
                Actions
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onCopy(data.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Copy Id
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/${params.storeid}/products/${data.id}`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setOpen(true)}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            
        </DropdownMenuContent>
      </DropdownMenu>
      </>

    )
}