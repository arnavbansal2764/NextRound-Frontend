'use client';

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import Button from "./ModalInputs/Button";

interface ModalProps {
    isOpen?: boolean;
    onClose: () => void;
    onSubmit: () => void;
    title?: string;
    body?: React.ReactElement;
    footer?: React.ReactElement;
    actionLabel: string | null;
    disabled?: boolean;
    secondaryAction?: () => void;
    secondaryActionLabel?: string;
}

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

const modalVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0, y: 50 },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 30
        }
    },
    exit: {
        scale: 0.95,
        opacity: 0,
        y: 50,
        transition: {
            duration: 0.2
        }
    },
};

const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.3 } },
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    title,
    body,
    footer,
    actionLabel,
    disabled,
    secondaryAction,
    secondaryActionLabel
}) => {
    const [showModal, setShowModal] = useState(isOpen);

    useEffect(() => {
        setShowModal(isOpen);
    }, [isOpen]);

    const handleClose = useCallback(() => {
        if (disabled) return;
        setShowModal(false);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [disabled, onClose]);

    const handleSubmit = useCallback(() => {
        if (disabled) return;
        onSubmit();
    }, [disabled, onSubmit]);

    const handleSecondaryAction = useCallback(() => {
        if (disabled || !secondaryAction) return;
        secondaryAction();
    }, [disabled, secondaryAction]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {showModal && (
                <motion.div
                    key="modal-overlay"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-60 backdrop-blur-sm"
                >
                    <motion.div
                        key="modal-container"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="relative w-full md:w-4/6 lg:w-3/6 xl:w-2/5 my-6 mx-auto h-full lg:h-auto md:h-auto"
                    >
                        <div className="h-full lg:h-auto md:h-auto">
                            <motion.div
                                className="relative flex flex-col w-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl rounded-2xl overflow-hidden"
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <motion.div
                                    className="flex items-center p-6 rounded-t-2xl justify-center relative border-b-[1px] border-blue-400"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1, duration: 0.3 }}
                                >
                                    <motion.button
                                        onClick={handleClose}
                                        className="absolute left-4 p-2 transition-colors duration-200 rounded-full text-white hover:bg-blue-600 focus:outline-none"
                                    >
                                        <IoMdClose size={20} />
                                    </motion.button>
                                    <motion.h2
                                        className="text-2xl font-bold text-white"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2, duration: 0.3 }}
                                    >
                                        {title}
                                    </motion.h2>
                                </motion.div>
                                <motion.div
                                    className="relative p-6 bg-white rounded-b-2xl"
                                    variants={contentVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <motion.div
                                        className="mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.3 }}
                                    >
                                        {body}
                                    </motion.div>
                                    <motion.div
                                        className="flex flex-col gap-4"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.3 }}
                                    >
                                        <div className="flex flex-row items-center gap-4 w-full">
                                            {secondaryAction && secondaryActionLabel && (
                                                <Button
                                                    outline
                                                    disabled={disabled}
                                                    label={secondaryActionLabel}
                                                    onClick={handleSecondaryAction}
                                                />
                                            )}
                                            {actionLabel && (
                                                <Button
                                                    disabled={disabled}
                                                    label={actionLabel}
                                                    onClick={handleSubmit}
                                                />
                                            )}
                                        </div>
                                        {footer}
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;

