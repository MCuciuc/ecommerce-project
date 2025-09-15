"use client";
import { ApiAlert } from "./api-alert";
import { Separator } from "./separator";
import { Heading } from "./heading";
import { useOrigin } from "@/hooks/use-origin";
import { useParams } from "next/navigation";

interface ApiListProps {
    entityName: string; // e.g. "billboards"
    entityIdName: string; // e.g. "billboardid"
}

export const ApiList = ({ entityName, entityIdName }: ApiListProps) => {
    const origin = useOrigin();
    const params = useParams() as { storeid: string };

    const baseUrl = `${origin}/api/${params.storeid}/${entityName}`;
    const entityUrl = `${baseUrl}/:${entityIdName}`;

    return (
        <div className="space-y-4">
            <Separator />
            <Heading title="API" description="API endpoints for this resource" />
            <ApiAlert title="GET" description={baseUrl} variant="public" />
            <ApiAlert title="POST" description={baseUrl} variant="admin" />
            <ApiAlert title="GET" description={entityUrl} variant="public" />
            <ApiAlert title="PATCH" description={entityUrl} variant="admin" />
            <ApiAlert title="DELETE" description={entityUrl} variant="admin" />
        </div>
    );
};


