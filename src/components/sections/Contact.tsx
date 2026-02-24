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
  "w-full h-[48px] md:h-[54px] bg-white/30 backdrop-blur-md border border-white/20 rounded-[12px] px-5 text-[14px] text-black placeholder:text-black/50 focus:outline-none transition-all duration-300";

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
        "h-[100dvh] w-screen bg-background flex-shrink-0 relative overflow-hidden",
        className,
      )}
    >
      {/* Gallery - right side */}
      <div className="pointer-events-none z-0 opacity-60 overflow-hidden" style={{ position: 'absolute', right: '5%', top: '10%', width: '40%', height: '80vh', clipPath: 'inset(0)' }}>
        <DiagonalGallery 
          lane1={lane1Images} 
          lane2={lane2Images} 
          className="!h-[150%] !w-full" 
        />
      </div>

      {/* Gradient fade from left */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent pointer-events-none z-1" />

      {/* Left content: heading + form */}
      <div className="absolute left-[5%] md:left-[8%] top-[12dvh] z-10 w-full max-w-[450px] md:max-w-[520px]">

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-3xl md:text-5xl font-black text-black leading-tight mb-6 md:mb-8"
        >
          Let's Create<br />Together
        </motion.h2>

        {/* Form */}
        <motion.form
          id="contactForm"
          onSubmit={handleSubmit}
          className="contact-form flex flex-col gap-5 md:gap-6"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
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
          <input
            id="projectType"
            type="text"
            name="projectType"
            placeholder="Project Type"
            className={inputClass}
            value={formData.projectType}
            onChange={handleInputChange}
          />
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Message"
            className="w-full bg-white/30 backdrop-blur-md border border-white/20 rounded-[12px] px-5 py-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none transition-all duration-300 resize-none leading-relaxed min-h-[120px]"
            value={formData.message}
            onChange={handleInputChange}
          />

          <motion.button
            type="submit"
            disabled={status === "submitting"}
            whileTap={{ 
              scale: 0.96, 
              boxShadow: "0 0 40px rgba(0, 0, 0, 0.1)",
              filter: "brightness(1.15)"
            }}
            className={clsx(
              "group flex items-center justify-center gap-2 px-8 h-11 bg-black/5 backdrop-blur-md border border-black/10 text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-full transition-all duration-300 w-fit shadow-sm mt-4",
              status === "submitting" ? "opacity-70 cursor-not-allowed" : "hover:bg-black/10 hover:scale-[1.02]"
            )}
          >
            <span>{status === "submitting" ? "Submitting..." : "Submit"}</span>
            <ArrowRight className={clsx("w-3.5 h-3.5 transition-transform duration-300", status !== "submitting" && "group-hover:translate-x-1")} />
          </motion.button>

          {/* Contact Information */}
          <div className="mt-32 md:mt-48 w-full">
            <div className="flex flex-col gap-10 p-10 md:p-12 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] max-w-[500px] shadow-2xl">
              <div className="flex flex-col gap-1.5 group">
                <span className="text-[11px] uppercase tracking-[0.25em] text-black/50 font-bold">Call Us</span>
                <span className="text-black font-semibold text-lg">98198 86633</span>
              </div>

              <div className="flex flex-col gap-1.5 group">
                <span className="text-[11px] uppercase tracking-[0.25em] text-black/50 font-bold">Email Us</span>
                <a href="mailto:studio@aakritcinematic.in" className="text-black font-semibold text-lg hover:opacity-70 transition-opacity underline decoration-black/20 underline-offset-8">
                  studio@aakritcinematic.in
                </a>
              </div>

              <div className="flex flex-col gap-1.5 group">
                <span className="text-[11px] uppercase tracking-[0.25em] text-black/50 font-bold">Visit Us</span>
                <p className="text-black/80 text-sm font-medium leading-relaxed">
                  15-2, Vishwa Niwas, Third Floor, Chandrodaya CHS, Thakkar Bappa Colony Rd, Near Swastik Park, Chembur, Mumbai, Maharashtra 400071
                </p>
              </div>
            </div>
          </div>

          {status === "success" && (
            <p className="text-black font-bold text-[9px] uppercase tracking-[0.2em] mt-2">
              Message sent successfully!
            </p>
          )}

          {status === "error" && (
            <p className="text-red-600 text-[9px] uppercase tracking-[0.2em] font-bold mt-2">
              Error: {errorMessage}
            </p>
          )}
        </motion.form>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-black/40 text-[8px] md:text-[9px] uppercase tracking-[0.2em] whitespace-nowrap"
      >
        © 2025 Aakrit Cinematic Solutions. All rights reserved.
      </motion.p>
    </section>
  );
};

export default Contact;
