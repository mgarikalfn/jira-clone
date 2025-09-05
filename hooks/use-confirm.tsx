import {JSX, useState} from "react";

import {Button , type ButtonProps } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { CardContent, CardDescription, CardHeader, CardTitle ,Card} from "@/components/ui/card";




export const useConfirm = ( 
    title:string,
    message:string,
    Variant:ButtonProps["variant"] = "primary"
 ) :[() => JSX.Element,() => Promise<unknown>]=> {
    const  [promise , setPromise] = useState<{resolve:(value:boolean) => void} | null>(null)

    const confirm = () => {
       return new Promise((resolve) => {
            setPromise({resolve});
        })
    };

    const handleClose = () => {
        setPromise(null);
    };

    const handleConfirm = () => {
        promise?.resolve(false);
        handleClose();
    };

    const handleCancel = () => {
        promise?.resolve(false);
        handleClose();
    }
    const ConfirmationDialog = () => ( 
        <ResponsiveModal open={promise != null} onOpenChange={handleClose}>
            <Card className="w-full h-full border-none shadow-null">
                <CardContent className="pt-8">
                    <CardHeader className="p-0">
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{message}</CardDescription>
                    </CardHeader>
                    <div className=" pt-4 w-full flex flex-col gap-y-2 lg:flex-row gap-x-2 items-center justify-end">
                        <Button onClick={handleCancel} variant="outline" className="w-full lg:w-auto">
                            Cancel
                        </Button>

                         <Button onClick={handleConfirm} variant={Variant} className="w-full lg:w-auto">
                            confirm
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </ResponsiveModal>
    )

    return [ConfirmationDialog , confirm]
};