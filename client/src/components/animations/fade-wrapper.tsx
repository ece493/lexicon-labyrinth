import { AnimatePresence, motion, usePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FadeWrapperProps {
    children: React.ReactNode,
}

export const FadeWrapper: React.FC<FadeWrapperProps> = ({ children }) => {
    return <AnimatePresence mode="wait">
        <motion.div
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
        >
            {children}
        </motion.div>
    </AnimatePresence>
}
