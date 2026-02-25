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

const ScrollColumn = ({
  speed = 10,
  reverse = false,
  images: baseImages = [],
}: {
  speed?: number;
  reverse?: boolean;
  images?: string[];
}) => {
  if (!baseImages || baseImages.length === 0) return null;

  // Quadruple items for safety and smoothness
  const images = [...baseImages, ...baseImages, ...baseImages, ...baseImages];
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const itemHeight = isDesktop ? 110 : 80;
  const itemWidth = isDesktop ? 160 : 110;
  const gap = isDesktop ? 16 : 12;

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
            className="flex-shrink-0 rounded-[35px] md:rounded-[50px] overflow-hidden shadow-xl relative group"
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
    <div
      className={clsx(
        "relative w-full h-full flex justify-center items-center gap-20 md:gap-32 overflow-visible",
        className,
      )}
      style={{
        WebkitMaskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)",
        maskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 95%)",
      }}
    >
      <div className="flex gap-[0.5em] md:gap-[0.8em] transform rotate-[15deg] scale-[1.7] translate-x-[10%] origin-center overflow-visible">
        <ScrollColumn speed={55} images={lane1} />
        <ScrollColumn speed={50} reverse images={lane2} />
      </div>
    </div>
  );
};

export default DiagonalGallery;