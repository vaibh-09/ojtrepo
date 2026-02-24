import { motion } from "framer-motion";
import clsx from "clsx";
import useMediaQuery from "../../hooks/useMediaQuery";

interface DiagonalGalleryProps {
  className?: string;
  speed?: number;
  reverse?: boolean;
  lane1?: string[];
  lane2?: string[];
}

const ScrollColumn = ({ speed = 20, reverse = false, images: baseImages = [] }: { speed?: number; reverse?: boolean; images?: string[] }) => {
  if (!baseImages || baseImages.length === 0) return null;
  
  // Quadruple items for safety and smoothness
  const images = [...baseImages, ...baseImages, ...baseImages, ...baseImages];
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const itemHeight = isDesktop ? 160 : 120; 
  const itemWidth = isDesktop ? 220 : 150;
  const gap = isDesktop ? 24 : 16; 

const totalHeight = (itemHeight + gap) * baseImages.length;
  return (
    <div className="flex flex-col relative">
      <motion.div
        className="flex flex-col"
        style={{ gap: `${gap}px` }}
        animate={{
          y: reverse ? [-totalHeight, 0] : [0, -totalHeight],
        }}
        transition={{
          y: {
            repeat: Infinity,
            repeatType: "loop",
            duration: speed,
            ease: "linear",
          },
        }}
      >
        {images.map((src, index) => (
          <div
            key={index}
            style={{ width: `${itemWidth}px`, height: `${itemHeight}px` }}
            className="flex-shrink-0 rounded-[24px] md:rounded-[32px] overflow-hidden border border-white/10 shadow-xl relative group"
          >
            <img
              src={src}
              alt={`Cinema still ${index}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const DiagonalGallery = ({ className, lane1, lane2 }: DiagonalGalleryProps) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  return (
    <div className={clsx("relative w-full h-[120vh] overflow-hidden flex justify-center items-center gap-10 md:gap-[32px]", className)}>
      <div className="flex gap-10 md:gap-[32px] transform rotate-[25deg] scale-[1.6] origin-center">
        <ScrollColumn speed={120} images={lane1} />
        {isDesktop && <ScrollColumn speed={100} reverse images={lane2} />}
        {isDesktop && <ScrollColumn speed={140} images={lane1} />}
      </div>
    </div>
  );
};

export default DiagonalGallery;
