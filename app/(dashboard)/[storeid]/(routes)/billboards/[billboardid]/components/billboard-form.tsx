"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// Using a lightweight local type to avoid coupling to Prisma types at build time
type Billboard = { id: string; label: string };
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
import ImageUpload from "@/components/ui/image-upload";

interface BillboardFormProps {
    initialData: Billboard | null;
}

const formSchema = z.object({
    label: z.string().min(1, "Label is required"),
    imageUrl: z.string().min(1, "Background image is required"),
});

type BillboardFormValues = z.infer<typeof formSchema>;

export const BillboardForm = ({ initialData }: BillboardFormProps) => {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams() as { storeid: string };
    const origin = useOrigin();
    const form = useForm<BillboardFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            label: initialData?.label ?? "",
            imageUrl: "",
        },
    });

    const onSubmit = async (values: BillboardFormValues) => {
        try {
            setLoading(true);
            const storeid = params.storeid;
            if (initialData) {
                await axios.patch(`/api/${storeid}/billboards/${initialData.id}`, values);
            } else {
                await axios.post(`/api/${storeid}/billboards`, values);
            }
            router.refresh();
            toast.success(initialData ? "Billboard updated." : "Billboard created.");
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
            await axios.delete(`/api/${storeid}/billboards/${initialData.id}`);
            toast.success("Billboard deleted.");
            router.push(`/${storeid}/billboards`);
            router.refresh();
        } catch (error) {
            toast.error("Make sure you removed all products and categories first.");
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
            title={initialData ? "Edit billboard" : "Create billboard"}
            description={initialData ? "Edit an existing billboard" : "Add a new billboard"}
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
        <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Background Image</FormLabel>
                        <FormControl>
                            <ImageUpload
                                disabled={loading}
                                onChange={(url: string) => field.onChange(url)}
                                onRemove={(_url: string) => field.onChange("")}
                                value={field.value ? [field.value] : []}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                            <Input
                                disabled={loading}
                                placeholder="Billboard label"
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
            <ApiAlert title="NEXT_PUBLIC_API_URL" description={`${origin}/api/${initialData.id}`} variant="public" />
        )}
        </>
    )
}