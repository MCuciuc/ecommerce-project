"use client"

import { useEffect, useState } from "react";
import { Button } from "./button";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (url: string) => void;
    value: string[];
}

const ImageUpload = ({ disabled, onChange, onRemove, value }: ImageUploadProps) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const onUpload = (result: any) => {
        const url = result?.info?.secure_url as string | undefined;
        if (url) onChange(url);
    };
    if (!isMounted) {
        return null;
    }


    return (
        <div>
            <div className="mb-4 flex items-center gap-4">
                {value.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
                        <div className="z-10 absolute top-2 right-2">
                            <Button variant="destructive" size="icon" onClick={() => onRemove(url)} disabled={disabled}>
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                        <Image src={url} alt="Image" fill sizes="(max-width: 768px) 100vw, 200px" className="object-cover" />
                    </div>
                ))}
            </div>
            <CldUploadWidget
                uploadPreset="ecommerce"
                onError={(err) => console.error("Cloudinary upload error", err)}
                onSuccess={onUpload}
                options={{ multiple: false, cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string }}
            >
                {({ open }) => {
                    return (
                        <Button variant="secondary" onClick={() => open?.()} disabled={disabled}>
                            <ImagePlus className="h-4 w-4 mr-2" />
                            Add image
                        </Button>
                    )
                }}
            </CldUploadWidget>
        </div>
    )
}

export default ImageUpload;