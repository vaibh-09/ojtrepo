import { motion } from "framer-motion";
import clsx from "clsx";

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
  const itemHeight = 300; // base height
  const gap = 128; // gap-32 (128px)
  const totalHeight = (itemHeight + gap) * baseImages.length;

  return (
    <div className="flex flex-col gap-32 relative">
      <motion.div
        className="flex flex-col gap-32"
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
            className="w-[180px] h-[260px] md:w-[220px] md:h-[300px] flex-shrink-0 rounded-[1.25rem] overflow-hidden border border-white/5 shadow-2xl relative group"
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
  return (
    <div className={clsx("relative w-full h-[120vh] overflow-hidden flex justify-center gap-16", className)}>
      <div className="flex gap-16 transform rotate-[25deg] scale-125 origin-center">
        <ScrollColumn speed={160} images={lane1} />
        <ScrollColumn speed={140} reverse images={lane2} />
      </div>
    </div>
  );
};

export default DiagonalGallery;
