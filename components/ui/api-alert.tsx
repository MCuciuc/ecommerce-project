import { Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Badge } from "./badge";

interface ApiAlertProps {
    title: string;
    description: string;
    variant: "public" | "admin";
}

const textMap: Record<ApiAlertProps["variant"], string> = {
    public: "Public",
    admin: "Admin",
}

const variantMap: Record<ApiAlertProps["variant"], "default" | "destructive"> = {
    public: "default",
    admin: "destructive",
}

export const ApiAlert = ({
    title,
    description,
    variant = "public"
}: ApiAlertProps) => {
    return (

        
        <Alert variant={variantMap[variant]}>
            <Server className="h-4 w-4" />
            <AlertTitle>
                {title}
                <Badge variant={variantMap[variant]}>{textMap[variant]}</Badge>
                </AlertTitle>
            <AlertDescription>{description}</AlertDescription>
        </Alert>
    )
}