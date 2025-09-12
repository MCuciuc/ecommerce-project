"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
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
import { Size } from "@prisma/client";

interface SizeFormProps {
    initialData: Size | null;
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    value: z.string().min(1, "Value is required"),
});

type SizeFormValues = z.infer<typeof formSchema>;

export const SizeForm = ({ initialData }: SizeFormProps) => {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams() as { storeid: string };
    const origin = useOrigin();
    const form = useForm<SizeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name ?? "",
            value: initialData?.value ?? "",
        },
    });

    const onSubmit = async (values: SizeFormValues) => {
        try {
            setLoading(true);
            const storeid = params.storeid;
            if (initialData) {
                await axios.patch(`/api/${storeid}/sizes/${initialData.id}`, values);
            } else {
                await axios.post(`/api/${storeid}/sizes`, values);
            }
            router.refresh();
            router.push(`/${storeid}/sizes`);
            toast.success(initialData ? "Size updated." : "Size created.");
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
            await axios.delete(`/api/${storeid}/sizes/${initialData.id}`);
            toast.success("Size deleted.");
            router.push(`/${storeid}/sizes`);
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
            title={initialData ? "Edit size" : "Create size"}
            description={initialData ? "Edit an existing size" : "Add a new size"}
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
                                placeholder="Size name"
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
                name="value"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                            <Input
                                disabled={loading}
                                placeholder="Size value (e.g. M, L, 42)"
                                className="max-w-sm"
                                {...field}
                            />
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
            <ApiAlert title="NEXT_PUBLIC_API_URL" description={`${origin}/api/${params.storeid}/sizes/${initialData.id}`} variant="public" />
        )}
        </>
    )
}