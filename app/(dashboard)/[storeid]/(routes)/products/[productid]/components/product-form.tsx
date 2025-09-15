"use client";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
// Using lightweight local types to avoid Prisma types in client components
type ProductImageDTO = { id: string; url: string };
type ProductDTO = {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    sizeId: string;
    colorId: string;
    isFeatured: boolean;
    isArchived: boolean;
    images: ProductImageDTO[];
} | null;
import { Trash } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";

interface ProductFormProps {
    initialData: ProductDTO;
    categories: { id: string; name: string }[];
    sizes: { id: string; name: string }[];
    colors: { id: string; name: string; value: string }[];
}

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1, "Price must be at least 1"),
    categoryId: z.string().min(1, "Category is required"),
    colorId: z.string().min(1, "Color is required"),
    sizeId: z.string().min(1, "Size is required"),
    isFeatured: z.boolean().default(false).optional(),
    isArchived: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

export const ProductForm = ({ initialData, categories, sizes, colors }: ProductFormProps) => {

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const params = useParams() as { storeid: string };
    const origin = useOrigin();
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: (initialData ? {
            name: initialData.name,
            images: initialData.images?.map(img => ({ url: img.url })) ?? [],
            price: Number(initialData.price ?? 0),
            categoryId: initialData.categoryId ?? "",
            sizeId: initialData.sizeId ?? "",
            colorId: initialData.colorId ?? "",
            isFeatured: initialData.isFeatured ?? false,
            isArchived: initialData.isArchived ?? false,
        } : {
            name: "",
            images: [],
            price: 0,
            categoryId: "",
            sizeId: "",
            colorId: "",
            isFeatured: false,
            isArchived: false,
        }) as ProductFormValues,
    });

    const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
        try {
            setLoading(true);
            const storeid = params.storeid;
            if (initialData) {
                await axios.patch(`/api/${storeid}/products/${initialData.id}`, values);
            } else {
                await axios.post(`/api/${storeid}/products`, values);
            }
            router.refresh();
            router.push(`/${storeid}/products`);
            toast.success(initialData ? "Product updated." : "Product created.");
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
            await axios.delete(`/api/${storeid}/products/${initialData.id}`);
            toast.success("Product deleted.");
            router.push(`/${storeid}/products`);
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
            title={initialData ? "Edit product" : "Create product"}
            description={initialData ? "Edit an existing product" : "Add a new product"}
            />
            <div className="flex items-center gap-2">
            {initialData && (
            <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
            >
                <Trash className="h-4 w-4" />
            </Button>
            )}
            <Button disabled={loading} type="submit" form="product-form">
                {initialData ? "Save changes" : "Create"}
            </Button>
            </div>
        </div>
        <Separator />
        <Form {...(form as any)}>
        <FormField
                control={form.control as any}
                name="images"
                render={({ field }) => {
                    const imagesValue = (field.value as { url: string }[] | undefined) ?? [];
                    return (
                    <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                            <ImageUpload
                                disabled={loading}
                                onChange={(url: string) => field.onChange([...imagesValue, { url }])}
                                onRemove={(url: string) => field.onChange(imagesValue.filter((img) => img.url !== url))}
                                value={imagesValue.map((img) => img.url)}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}}
                />
            <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8" id="product-form">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control as any}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={loading}
                                        placeholder="Product name"
                                        className="max-w-sm"
                                        value={(field.value as string) ?? ""}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control as any}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        disabled={loading}
                                        placeholder="0"
                                        className="max-w-sm"
                                        value={String(field.value ?? "")}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control as any}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <FormControl>
                                    <select
                                        disabled={loading}
                                        className="max-w-sm border rounded px-3 py-2"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    >
                                        <option value="" disabled>Select a category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control as any}
                        name="sizeId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <FormControl>
                                    <select
                                        disabled={loading}
                                        className="max-w-sm border rounded px-3 py-2"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    >
                                        <option value="" disabled>Select a size</option>
                                        {sizes.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control as any}
                        name="colorId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <FormControl>
                                    <select
                                        disabled={loading}
                                        className="max-w-sm border rounded px-3 py-2"
                                        value={field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                    >
                                        <option value="" disabled>Select a color</option>
                                        {colors.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control as any}
                        name="isFeatured"
                        render={({ field }) => (
                            <FormItem>
                                <div className="rounded-md border p-4 flex items-start gap-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={Boolean(field.value)}
                                            onCheckedChange={(v) => field.onChange(Boolean(v))}
                                            disabled={loading}
                                        />
                                    </FormControl>
                                    <div className="space-y-1">
                                        <FormLabel>Featured</FormLabel>
                                        <p className="text-sm text-muted-foreground">This product will appear on the home page</p>
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control as any}
                        name="isArchived"
                        render={({ field }) => (
                            <FormItem>
                                <div className="rounded-md border p-4 flex items-start gap-3">
                                    <FormControl>
                                        <Checkbox
                                            checked={Boolean(field.value)}
                                            onCheckedChange={(v) => field.onChange(Boolean(v))}
                                            disabled={loading}
                                        />
                                    </FormControl>
                                    <div className="space-y-1">
                                        <FormLabel>Archived</FormLabel>
                                        <p className="text-sm text-muted-foreground">This product will not appear anywhere in the store.</p>
                                    </div>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
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