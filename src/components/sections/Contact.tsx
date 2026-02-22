import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import DiagonalGallery from "./DiagonalGallery";
import { supabase } from "../../lib/supabaseClient";

interface ContactProps {
  id?: string;
  className?: string;
}

const inputClass =
  "w-full h-[42px] md:h-[52px] bg-white/50 rounded-full px-4 md:px-5 text-[13px] md:text-sm text-text placeholder:text-muted/60 focus:outline-none backdrop-blur-sm transition-all duration-200";

const Contact = ({ id = "contact", className }: ContactProps) => {
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const [lane1Images, setLane1Images] = useState<string[]>([]);
  const [lane2Images, setLane2Images] = useState<string[]>([]);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_images')
          .select('image_url, lane');
        
        if (data && !error) {
          // Process images to get public URLs if they are just paths or contain placeholders
          const processedImages = data.map(item => {
            let url = item.image_url;
            
            // 1. Fix placeholder project ID if present
            if (url.includes('YOUR_PROJECT_ID.supabase.co')) {
              try {
                const actualHost = new URL(import.meta.env.VITE_SUPABASE_URL).host;
                url = url.replace('YOUR_PROJECT_ID.supabase.co', actualHost);
              } catch (e) {
                console.error('Invalid VITE_SUPABASE_URL for placeholder replacement');
              }
            }

            // 2. Resolve relative storage paths
            if (!url.startsWith('http')) {
              const { data: { publicUrl } } = supabase.storage
                .from('contact_images')
                .getPublicUrl(url);
              url = publicUrl;
            }

            return { ...item, image_url: url };
          });

          const l1 = processedImages.filter(item => item.lane === '1').map(item => item.image_url);
          const l2 = processedImages.filter(item => item.lane === '2').map(item => item.image_url);
          
          // Fallback: If no lanes are defined, just split the data
          if (l1.length === 0 && l2.length === 0) {
            const halfway = Math.ceil(processedImages.length / 2);
            setLane1Images(processedImages.slice(0, halfway).map(item => item.image_url));
            setLane2Images(processedImages.slice(halfway).map(item => item.image_url));
          } else {
            setLane1Images(l1);
            setLane2Images(l2);
          }
        }
      } catch (err) {
        console.error('Error fetching contact images:', err);
      }
    };
    fetchImages();
  }, []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("success");
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setStatus("idle"), 4000);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <section
      id={id}
      className={clsx(
        "h-[100dvh] w-screen flex items-center justify-start bg-background flex-shrink-0 relative overflow-hidden",
        className,
      )}
    >
      {/* Glassy Background Decoration */}
      <div className="absolute top-0 right-[5%] w-[60%] h-full pointer-events-none z-0 opacity-40 overflow-hidden flex items-center justify-center">
        <DiagonalGallery 
          lane1={lane1Images} 
          lane2={lane2Images} 
          className="!h-[150%] !w-full" 
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none z-1" />

      <div className="w-full px-8 md:px-16 relative z-10">
        <div className="w-full max-w-[450px] md:max-w-[600px]">

          {/* Eyebrow + Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4"
          >
            <span className="text-accent text-[10px] uppercase tracking-[0.3em] font-mono mb-2 block">
              Get in Touch
            </span>
            <h2 className="text-2xl md:text-5xl font-display font-bold text-text leading-[1.1]">
              Let's Create<br />
              <span className="text-accent">Together</span>
            </h2>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 md:p-8 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="contact-form">

              {/* Name */}
              <div style={{ marginBottom: "6px" }}>
                <input
                  type="text"
                  placeholder="Name"
                  className={inputClass}
                  required
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "6px" }}>
                <input
                  type="email"
                  placeholder="Email"
                  className={inputClass}
                  required
                />
              </div>

              {/* Project Type */}
              <div style={{ marginBottom: "6px" }}>
                <input
                  type="text"
                  placeholder="Project Type"
                  className={inputClass}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: "6px" }}>
                <textarea
                  rows={1}
                  placeholder="Message"
                  className="w-full bg-white/50 rounded-full px-4 md:px-5 py-2.5 md:py-3 text-[13px] md:text-sm text-text placeholder:text-muted/60 focus:outline-none backdrop-blur-sm transition-all duration-200 resize-none leading-relaxed min-h-[42px] md:min-h-[52px]"
                />
              </div>

              <button
                type="submit"
                className="group flex items-center gap-3 md:gap-4 px-8 md:px-12 h-11 md:h-16 bg-white/20 backdrop-blur-xl text-text font-black uppercase tracking-[0.2em] text-[11px] md:text-[14px] rounded-full hover:bg-white/30 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)] hover:scale-[1.02] mb-4 md:mb-6 shadow-lg"
              >
                <span>SEND MESSAGE</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>

              {/* Contact Details (Large) */}
              <div className="flex flex-col gap-0.5 mt-2 md:mt-3 px-2">
                <div className="flex items-center gap-2 md:gap-3 text-base md:text-xl font-bold text-text">
                  <span className="text-xl md:text-2xl">📍</span>
                  <span>Chembur</span>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-base md:text-xl font-bold text-text">
                  <span className="text-xl md:text-2xl">📲</span>
                  <a 
                    href="https://wa.me/919819886633" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-accent transition-colors"
                  >
                    +91 98198 86633
                  </a>
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-base md:text-xl font-bold text-text">
                  <span className="text-xl md:text-2xl">✉️</span>
                  <a href="mailto:studio@aakritcinematic.in" className="hover:text-accent transition-colors">
                    studio@aakritcinematic.in
                  </a>
                </div>
              </div>

              {/* Success message */}
              {status === "success" && (
                <p className="mt-4 text-accent text-xs uppercase tracking-[0.25em]">
                  Message sent — we'll reply within 24 hours.
                </p>
              )}
            </form>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-6 text-muted/50 text-xs"
          >
            © 2024 Aakrit Cinematic Solutions. All rights reserved.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
