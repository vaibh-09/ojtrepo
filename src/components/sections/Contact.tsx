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
  "w-full h-[50px] md:h-[64px] bg-white/50 rounded-full px-4 md:px-6 text-[15px] md:text-lg text-text placeholder:text-muted/60 focus:outline-none backdrop-blur-sm transition-all duration-200";

const Contact = ({ id = "contact", className }: ContactProps) => {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "submitting">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    message: ""
  });
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    
    try {
      const { error } = await supabase
        .from('contact_form')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            project_type: formData.projectType,
            message: formData.message,
          }
        ]);

      if (error) throw error;

      setStatus("success");
      setFormData({ name: "", email: "", projectType: "", message: "" });
      
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      console.error('Error submitting form:', err);
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong.");
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
        setErrorMessage("");
      }, 6000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
        "h-[100dvh] w-screen flex items-center justify-start md:justify-end bg-background flex-shrink-0 relative overflow-hidden",
        className,
      )}
    >
      {/* Glassy Background Decoration - Reverted to right-biased layout */}
      <div className="absolute top-0 right-[-10%] md:right-[-35%] w-[65%] h-full pointer-events-none z-0 opacity-40 overflow-hidden flex items-center justify-center">
        <DiagonalGallery 
          lane1={lane1Images} 
          lane2={lane2Images} 
          className="!h-[150%] !w-full" 
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent pointer-events-none z-1" />

      <div className="w-full md:w-auto px-8 md:px-0 md:mr-[4%] lg:mr-[6%] relative z-10 md:translate-x-[200px]">
        <div className="w-full max-w-[500px] md:max-w-[800px]">

          {/* Eyebrow + Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 md:mb-12"
          >
            <span className="text-accent text-[15px] md:text-[18px] uppercase tracking-[0.4em] font-mono mb-4 md:mb-6 block">
              Get in Touch
            </span>
            <h2 className="font-black text-text uppercase tracking-[0.2em] leading-[1.1]" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)' }}>
              Let's Create<br />
              <span className="text-accent">Together</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 md:p-8 shadow-xl"
          >
            <form id="contactForm" onSubmit={handleSubmit} className="contact-form">

              {/* Name */}
              <div style={{ marginBottom: "6px" }}>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Name"
                  className={inputClass}
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: "6px" }}>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  className={inputClass}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Project Type */}
              <div style={{ marginBottom: "6px" }}>
                <input
                  id="projectType"
                  type="text"
                  name="projectType"
                  placeholder="Project Type"
                  className={inputClass}
                  value={formData.projectType}
                  onChange={handleInputChange}
                />
              </div>

              {/* Message */}
              <div style={{ marginBottom: "6px" }}>
                <textarea
                  id="message"
                  name="message"
                  rows={1}
                  placeholder="Message"
                  className="w-full bg-white/50 rounded-[2rem] px-4 md:px-6 py-3 md:py-4 text-[15px] md:text-lg text-text placeholder:text-muted/60 focus:outline-none backdrop-blur-sm transition-all duration-200 resize-none leading-relaxed min-h-[50px] md:min-h-[120px]"
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className={clsx(
                  "group flex items-center gap-3 md:gap-4 px-8 md:px-14 h-14 md:h-20 bg-white/20 backdrop-blur-xl text-text font-black uppercase tracking-[0.2em] text-[13px] md:text-[18px] rounded-full transition-all duration-300 hover:scale-[1.02] mb-6 md:mb-8 shadow-lg",
                  status === "submitting" ? "opacity-70 cursor-not-allowed" : "hover:bg-white/30 hover:shadow-[0_10px_40px_rgba(0,0,0,0.1)]"
                )}
              >
                <span>{status === "submitting" ? "SENDING..." : "SEND MESSAGE"}</span>
                <ArrowRight className={clsx("w-5 h-5 transition-transform duration-300", status !== "submitting" && "group-hover:translate-x-1")} />
              </button>

              {/* Contact Details (Large) */}
              <div className="flex flex-col gap-1 mt-4 md:mt-6 px-2">
                <div className="flex items-center gap-3 md:gap-4 text-lg md:text-2xl font-bold text-text">
                  <span className="text-2xl md:text-3xl">📍</span>
                  <span>Chembur</span>
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-lg md:text-2xl font-bold text-text">
                  <span className="text-2xl md:text-3xl">📲</span>
                  <a 
                    href="https://wa.me/919819886633" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-accent transition-colors"
                  >
                    +91 98198 86633
                  </a>
                </div>
                <div className="flex items-center gap-3 md:gap-4 text-lg md:text-2xl font-bold text-text">
                  <span className="text-2xl md:text-3xl">✉️</span>
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

              {/* Error message */}
              {status === "error" && (
                <div className="mt-4">
                  <p className="text-red-500 text-xs uppercase tracking-[0.25em] font-bold">
                    Error: {errorMessage}
                  </p>
                  <p className="text-red-400/60 text-[10px] uppercase tracking-[0.1em] mt-1">
                    Please ensure the table exists and RLS policy allows inserts.
                  </p>
                </div>
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
