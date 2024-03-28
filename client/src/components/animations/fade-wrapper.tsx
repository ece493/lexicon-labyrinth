import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface FadeWrapperProps {
    children: React.ReactNode,
}

export const FadeWrapper: React.FC<FadeWrapperProps> = ({ children }) => {
    const [key, setKey] = useState(0);
    useEffect(() => setKey(Math.floor(Math.random() * 100)), []);
    return <AnimatePresence>
        <motion.div key={key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-auto w-auto"
        >
            {children}
        </motion.div>;
    </AnimatePresence>
}
