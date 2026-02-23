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
  
  // Triple items for extremely smooth infinite scroll
  const images = [...baseImages, ...baseImages, ...baseImages];
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const itemHeight = isDesktop ? 400 : 300; // itemHeight must match actual rendered height for smooth looping
  const gap = isDesktop ? 256 : 128; // gap must match gap-64 (256px) for desktop, gap-32 (128px) for mobile
  const totalHeight = (itemHeight + gap) * baseImages.length;

  return (
    <div className={clsx("flex flex-col relative", isDesktop ? "gap-64" : "gap-32")}>
      <motion.div
        className={clsx("flex flex-col", isDesktop ? "gap-64" : "gap-32")}
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
            className="w-[220px] h-[300px] md:w-[500px] md:h-[400px] flex-shrink-0 rounded-[1.25rem] overflow-hidden border border-white/5 shadow-2xl relative group"
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
    <div className={clsx("relative w-full h-[120vh] overflow-hidden flex justify-center gap-16 md:gap-48", className)}>
      <div className="flex gap-16 md:gap-48 transform rotate-[25deg] scale-125 origin-center">
        <ScrollColumn speed={160} images={lane1} />
        {isDesktop && <ScrollColumn speed={140} reverse images={lane2} />}
      </div>
    </div>
  );
};

export default DiagonalGallery;
