"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// Using a lightweight local type to avoid coupling to Prisma types at build time
type CategoryData = { id: string; billboardId: string; name?: string };
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { AlertModal } from "@/components/ui/modals/alert-modal";
import { ApiAlert } from "@/components/ui/api-alert";
import { useOrigin } from "@/hooks/use-origin";

interface CategoryFormProps {
    initialData: CategoryData | null;
    billboards: { id: string; label: string }[];
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    billboardId: z.string().min(1, "Billboard is required"),
});

type CategoryFormValues = z.infer<typeof formSchema>;

export const CategoryForm = ({ initialData, billboards }: CategoryFormProps) => {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams() as { storeid: string };
    const origin = useOrigin();
    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            billboardId: initialData?.billboardId ?? "",
        },
    });

    const onSubmit = async (values: CategoryFormValues) => {
        try {
            setLoading(true);
            const storeid = params.storeid;
            if (initialData) {
                await axios.patch(`/api/${storeid}/categories/${initialData.id}`, values);
            } else {
                await axios.post(`/api/${storeid}/categories`, values);
            }
            router.refresh();
            router.push(`/${storeid}/categories`);
            toast.success(initialData ? "Category updated." : "Category created.");
        } catch (error) {
            toast.error("Something went wrong.");
            setLoading(false);
        }
       
    }
    const onDelete = async () => {
        try {
            setLoading(true);
            const storeid = params.storeid;
            if (!initialData) return;
            await axios.delete(`/api/${storeid}/categories/${initialData.id}`);
            toast.success("Category deleted.");
            router.push(`/${storeid}/categories`);
            router.refresh();
        } catch (error) {
            toast.error("Make sure you removed all products first.");
        } finally {
            setLoading(false);
            setOpen(false);
        }
    }
    return (
        <>
        <AlertModal 
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
        />
        <div className="flex items-center justify-between">
            <Heading
            title={initialData ? "Edit category" : "Create category"}
            description={initialData ? "Edit an existing category" : "Add a new category"}
            />
            {initialData && (
            <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
            >
                <Trash className="h-4 w-4" />
            </Button>
            )}
        </div>
        <Separator />
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input
                                disabled={loading}
                                placeholder="Enter category name"
                                className="max-w-sm"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="billboardId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Billboard</FormLabel>
                        <FormControl>
                            <select
                                disabled={loading}
                                className="max-w-sm border rounded px-3 py-2"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                            >
                                <option value="" disabled>Select a billboard</option>
                                {billboards.map(b => (
                                    <option key={b.id} value={b.id}>{b.label}</option>
                                ))}
                            </select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <Button disabled={loading} type="submit">
                    {initialData ? "Save changes" : "Create"}
                </Button>
            </form>
        </Form>
        <Separator />
        {initialData && (
            <ApiAlert title="NEXT_PUBLIC_API_URL" description={`${origin}/api/${params.storeid}/categories/${initialData.id}`} variant="public" />
        )}
        </>
    )
}