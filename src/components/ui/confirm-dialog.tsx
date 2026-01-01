"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "default";
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "default",
    isLoading = false,
}: ConfirmDialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: "bg-red-500/10 text-red-500",
            button: "bg-red-500 hover:bg-red-600 text-white",
        },
        warning: {
            icon: "bg-yellow-500/10 text-yellow-500",
            button: "bg-yellow-500 hover:bg-yellow-400 text-black",
        },
        default: {
            icon: "bg-neutral-800 text-neutral-400",
            button: "bg-yellow-500 hover:bg-yellow-400 text-black",
        },
    };

    const styles = variantStyles[variant];

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === overlayRef.current && onClose()}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Dialog */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-1 text-neutral-500 hover:bg-neutral-800 hover:text-white"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Icon */}
                <div className={cn("mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full", styles.icon)}>
                    <AlertTriangle className="h-6 w-6" />
                </div>

                {/* Content */}
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm text-neutral-400">{message}</p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 rounded-full border border-neutral-700 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
                            styles.button
                        )}
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Processing...
                            </span>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Hook for easier usage
export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<Omit<ConfirmDialogProps, "isOpen" | "onClose" | "onConfirm">>({
        title: "",
        message: "",
    });
    const resolveRef = useRef<(value: boolean) => void>();

    const confirm = (options: Omit<ConfirmDialogProps, "isOpen" | "onClose" | "onConfirm">): Promise<boolean> => {
        setConfig(options);
        setIsOpen(true);
        return new Promise((resolve) => {
            resolveRef.current = resolve;
        });
    };

    const handleClose = () => {
        setIsOpen(false);
        resolveRef.current?.(false);
    };

    const handleConfirm = () => {
        setIsOpen(false);
        resolveRef.current?.(true);
    };

    const Dialog = () => (
        <ConfirmDialog
            isOpen={isOpen}
            onClose={handleClose}
            onConfirm={handleConfirm}
            {...config}
        />
    );

    return { confirm, Dialog };
}
