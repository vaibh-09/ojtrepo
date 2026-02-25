import { motion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import DiagonalGallery from "./DiagonalGallery";
import { supabase } from "../../lib/supabaseClient";

interface ContactProps {
  id?: string;
  className?: string;
}

const Contact = ({ id = "contact", className }: ContactProps) => {
  const [status, setStatus] = useState<"idle" | "success" | "error" | "submitting">("idle");
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
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
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
      {/* Gallery - right side background */}
      <div className="pointer-events-none z-0 opacity-35" style={{ position: 'absolute', right: '0', top: '0', width: '55%', height: '100%', overflow: 'visible' }}>
        <DiagonalGallery 
          lane1={lane1Images} 
          lane2={lane2Images} 
          className="!h-full !w-full" 
        />
      </div>

      {/* Gradient fade from left */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-transparent pointer-events-none z-1" />

      {/* Centered Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-[60px] md:top-[80px] left-0 w-full z-20 text-center px-4"
      >
        <h1 
          className="text-white text-[32px] md:text-[72px] font-[800] tracking-[-1px] leading-tight lowercase mb-[15px] md:mb-[25px]"
          style={{ 
            color: '#ffffff',
            textShadow: "3px 3px 0px rgba(255, 165, 0, 0.6), 0 8px 20px rgba(255, 165, 0, 0.35)" 
          }}
        >
          get in touch.
        </h1>
        <div 
          className="w-[65%] max-w-[800px] h-[0.8px] bg-white/50 mx-auto" 
        />
      </motion.div>

      {/* Left content: form (Restored absolute positioning) */}
      <div className="absolute left-[5%] md:left-[8%] top-[170px] md:top-[22dvh] z-10 w-[90%] md:w-full max-w-[450px] md:max-w-[550px]">
        <motion.form
          id="contactForm"
          onSubmit={handleSubmit}
          className="flex flex-col gap-[12px]"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex flex-col gap-[18px]">
            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              className="w-full bg-[rgba(255,255,255,0.25)] backdrop-blur-[12px] border border-[rgba(255,180,0,0.35)] rounded-[20px] px-[20px] h-[44px] md:h-[50px] text-[#333] placeholder:text-[#333]/40 focus:outline-none focus:border-[rgba(255,150,0,0.7)] focus:bg-[rgba(255,255,255,0.35)] focus:shadow-[0_0_12px_rgba(255,180,0,0.3)] transition-all duration-300 text-[14px] md:text-[16px]"
              value={formData.name}
              onChange={handleInputChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full bg-[rgba(255,255,255,0.25)] backdrop-blur-[12px] border border-[rgba(255,180,0,0.35)] rounded-[20px] px-[20px] h-[44px] md:h-[50px] text-black placeholder:text-black/40 focus:outline-none focus:border-[rgba(255,150,0,0.7)] focus:bg-[rgba(255,255,255,0.35)] focus:shadow-[0_0_12px_rgba(255,180,0,0.3)] transition-all duration-300 text-[14px] md:text-[16px]"
              value={formData.email}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="projectType"
              placeholder="Project Type"
              className="w-full bg-[rgba(255,255,255,0.25)] backdrop-blur-[12px] border border-[rgba(255,180,0,0.35)] rounded-[20px] px-[20px] h-[44px] md:h-[50px] text-[#333] placeholder:text-[#333]/40 focus:outline-none focus:border-[rgba(255,150,0,0.7)] focus:bg-[rgba(255,255,255,0.35)] focus:shadow-[0_0_12px_rgba(255,180,0,0.3)] transition-all duration-300 text-[14px] md:text-[16px]"
              value={formData.projectType}
              onChange={handleInputChange}
            />
            <textarea
              name="message"
              placeholder="Message"
              rows={3}
              required
              className="w-full bg-[rgba(255,255,255,0.25)] backdrop-blur-[12px] border border-[rgba(255,180,0,0.35)] rounded-[20px] px-[20px] py-[12px] md:py-[14px] text-[#333] placeholder:text-[#333]/40 focus:outline-none focus:border-[rgba(255,150,0,0.7)] focus:bg-[rgba(255,255,255,0.35)] focus:shadow-[0_0_12px_rgba(255,180,0,0.3)] transition-all duration-300 text-[14px] md:text-[16px] resize-none min-h-[80px] md:min-h-[100px]"
              value={formData.message}
              onChange={handleInputChange}
            />
          </div>

          <motion.button
            type="submit"
            disabled={status === 'submitting'}
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(255, 180, 0, 0.32)",
              boxShadow: "0 4px 12px rgba(255, 170, 0, 0.35)"
            }}
            whileTap={{ scale: 0.98 }}
            className="submit-btn w-[100px] h-[32px] flex items-center justify-center bg-[rgba(255,190,0,0.22)] backdrop-blur-[12px] border border-[rgba(255,160,0,0.6)] text-black font-semibold rounded-[24px] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[1.2px] text-[11px] shadow-sm"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit'}
          </motion.button>
        </motion.form>

        {/* Success Message UI */}
        {status === 'success' && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-[#FFB400] font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-[#FFB400] rounded-full animate-pulse" />
            Thank you! We'll get back to you soon.
          </motion.p>
        )}

        {/* Error Message UI */}
        {status === 'error' && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-500 font-medium"
          >
            Something went wrong. Please try again.
          </motion.p>
        )}

        {/* Contact Information */}
        <div className="mt-12 md:mt-16 w-full pb-10 md:pb-20">
          <div className="flex flex-col gap-[24px] md:gap-[32px] p-4 md:p-6 bg-[rgba(255,240,200,0.35)] backdrop-blur-[18px] border-none rounded-[24px] md:rounded-[32px] max-w-[600px] shadow-sm leading-[1.6]">
            <div className="flex flex-col gap-[2px] group">
              <span className="text-[10px] uppercase tracking-[3px] text-black font-bold opacity-60">Call Us</span>
              <span className="text-black font-semibold text-[14px]">98198 86633</span>
            </div>

            <div className="flex flex-col gap-[2px] group">
              <span className="text-[10px] uppercase tracking-[3px] text-black font-bold opacity-60">Email Us</span>
              <a href="mailto:studio@aakritcinematic.in" className="text-black font-semibold text-[14px] hover:underline transition-all">
                studio@aakritcinematic.in
              </a>
            </div>

            <div className="flex flex-col gap-[2px] group">
              <span className="text-[10px] uppercase tracking-[3px] text-black font-bold opacity-60">Visit Us</span>
              <p className="text-black text-[14px] font-semibold leading-relaxed">
                15-2, Vishwa Niwas, Third Floor, Chandrodaya CHS, Thakkar Bappa Colony Rd, Near Swastik Park, Chembur, Mumbai, Maharashtra 400071
              </p>
            </div>
          </div>
        </div>
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
