import { AnimatePresence, motion, usePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FadeWrapperProps {
    children: React.ReactNode,
}

export const FadeWrapper: React.FC<FadeWrapperProps> = ({ children }) => {
    const [key, setKey] = useState(Math.floor(Math.random() * 100));
    useEffect(() => setKey(Math.floor(Math.random() * 100)), []);
    const [isPresent, safeToRemove] = usePresence()

    useEffect(() => {
        !isPresent && setTimeout(safeToRemove, 2000)
    }, [isPresent]);

    return <AnimatePresence mode="wait">
        <motion.div key={key}
            initial={{ opacity: 0}}
            animate={{ opacity: 1}}
        >
            {children}
        </motion.div>
    </AnimatePresence>
}
