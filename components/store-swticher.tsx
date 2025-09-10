"use client"

import React, { useState } from "react"
import type { Store } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { useStoreModal } from "@/hooks/use-store-modal"
import { Check, ChevronsUpDown, PlusCircle, StoreIcon } from "lucide-react"
import { Popover, PopoverContent } from "@radix-ui/react-popover"
import { PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<'button'>

interface StoreSwitcherProps extends PopoverTriggerProps {
    items?: Store[]
}

export default function StoreSwitcher({
    className,
    items = [],
    ...props
}: StoreSwitcherProps) {
    const storeModal = useStoreModal();
    const params = useParams<{ storeid?: string }>();
    const router = useRouter();

    const formattedItems = items.map((item) => ({
        label: item.name,
        value: item.id,
    }));


    const currentStore = formattedItems.find((item) => item.value === params.storeid)
    const [open, setOpen] = useState(false)
    const onStoreSelect = (store: { value: string, label: string}) => {
        setOpen(false);
        router.push(`/${store.value}`);
    }
    

    return (
       <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            size="sm"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a store"
            className={cn("w-[200px] justify-between", className)}>
                {currentStore ? currentStore.label : "Select store"}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                <StoreIcon />
            </Button>

        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
            <Command>
                <CommandList>
                    <CommandInput placeholder="Search store..."/>
                    <CommandEmpty>No store found.</CommandEmpty>
                    <CommandGroup heading="Stores">
                        {formattedItems.map((store) => (
                            <CommandItem
                            key={store.value}
                            onSelect={() => onStoreSelect(store)}
                            className="text-sm"
                            >
                                <StoreIcon className="mr-2 h-4 w-4" />
                                {store.label}
                                <Check 
                                className={cn(
                                    "ml-auto h-4 w-4",
                                    currentStore?.value === store.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                                />
                            </CommandItem>
                        ))}

                    </CommandGroup>
                </CommandList>
                <CommandGroup>
                    <CommandItem
                    onSelect={() => {
                        setOpen(false);
                        storeModal.onOpen();
                    }}
                    >
                        <PlusCircle className=" mr-2 h-5 w-5" />
                        Create Store

                    </CommandItem>
                </CommandGroup>
            </Command>

        </PopoverContent>

       </Popover>
    );
}