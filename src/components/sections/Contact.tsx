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
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "submitting"
  >("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    projectType: "",
    message: "",
  });
  const [lane1Images, setLane1Images] = useState<string[]>([]);
  const [lane2Images, setLane2Images] = useState<string[]>([]);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase
          .from("contact_images")
          .select("image_url, lane");

        if (data && !error) {
          // Process images to get public URLs if they are just paths or contain placeholders
          const processedImages = data.map((item) => {
            let url = item.image_url;

            // 1. Fix placeholder project ID if present
            if (url.includes("YOUR_PROJECT_ID.supabase.co")) {
              try {
                const actualHost = new URL(import.meta.env.VITE_SUPABASE_URL)
                  .host;
                url = url.replace("YOUR_PROJECT_ID.supabase.co", actualHost);
              } catch (e) {
                console.error(
                  "Invalid VITE_SUPABASE_URL for placeholder replacement",
                );
              }
            }

            // 2. Resolve relative storage paths
            if (!url.startsWith("http")) {
              const {
                data: { publicUrl },
              } = supabase.storage.from("contact_images").getPublicUrl(url);
              url = publicUrl;
            }

            return { ...item, image_url: url };
          });

          const l1 = processedImages
            .filter((item) => item.lane === "1")
            .map((item) => item.image_url);
          const l2 = processedImages
            .filter((item) => item.lane === "2")
            .map((item) => item.image_url);

          // Fallback: If no lanes are defined, just split the data
          if (l1.length === 0 && l2.length === 0) {
            const halfway = Math.ceil(processedImages.length / 2);
            setLane1Images(
              processedImages.slice(0, halfway).map((item) => item.image_url),
            );
            setLane2Images(
              processedImages.slice(halfway).map((item) => item.image_url),
            );
          } else {
            setLane1Images(l1);
            setLane2Images(l2);
          }
        }
      } catch (err) {
        console.error("Error fetching contact images:", err);
      }
    };
    fetchImages();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");

    try {
      const { error } = await supabase.from("contact_form").insert([
        {
          name: formData.name,
          email: formData.email,
          project_type: formData.projectType,
          message: formData.message,
        },
      ]);

      if (error) throw error;

      setStatus("success");
      setFormData({ name: "", email: "", projectType: "", message: "" });

      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setStatus("idle"), 4000);
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setStatus("error");
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setStatus("idle");
      }, 6000);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      {/* Gallery - right side background (tablet/desktop) */}
      <div
        className="pointer-events-none z-0 opacity-65 hidden md:block"
        style={{
          position: "absolute",
          right: "0",
          top: "0",
          width: "55%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <DiagonalGallery
          lane1={lane1Images}
          lane2={lane2Images}
          className="!h-full !w-full"
        />
      </div>

      {/* Gallery behind content (phone only) */}
      <div
        className="pointer-events-none z-0 opacity-40 md:hidden"
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          top: "0",
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <DiagonalGallery
          lane1={lane1Images}
          lane2={lane2Images}
          className="!h-full !w-full"
        />
      </div>

      {/* Gradient fade from left */}
      <div className="absolute inset-0 md:bg-gradient-to-r from-background via-background/95 to-transparent pointer-events-none z-1" />

      {/* Radial gradient overlay for phone to fade gallery behind form */}
      <div className="absolute inset-0 md:hidden bg-radial-fade-from-center pointer-events-none z-[5]" />

      {/* Centered Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-[5em] md:top-[7.5em] left-0 w-full z-20 text-center px-4"
      >
        <h1
          className="text-white text-[2em] md:text-[5.125em] font-[900] tracking-[-0.125em] leading-tight lowercase mb-[0.75em] md:mb-[1.5em]"
          style={{
            color: "#ffffff",
            textShadow:
              "0 0 15px rgba(255, 120, 0, 0.8), 0 0 30px rgba(255, 165, 0, 0.4)",
          }}
        >
          get in touch.
        </h1>
        <div className="w-[65%] max-w-[800px] h-[1px] bg-white/50 mx-auto" />
      </motion.div>

      {/* Left content: form (Glass-tuned replacement) */}
      <div
        className="
    absolute
    left-1/2
    -translate-x-1/2
    md:left-[5%]
    lg:left-[6%]
    md:translate-x-0
    top-[10em]
    md:top-[22dvh]
    z-10
    w-[90%]
    md:w-full
    max-w-[28em]
    md:max-w-[34em]
    lg:max-w-[37.5em]
    flex
    flex-col
    gap-[3.75em]
    md:gap-[6.25em]
  "
      >
        <motion.form
          id="contactForm"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col gap-[0.75em]"
        >
          <div className="flex flex-col gap-[0.875em] md:gap-[1.125em]">
            {/* Name */}
            <input
              type="text"
              name="name"
              placeholder="Name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="
          w-full
          bg-[rgba(255,255,255,0.4)]
          backdrop-blur-[2.4em]
          border border-[rgba(255,255,255,0.5)]
          rounded-[1.25em]
          px-[1.25em]
          h-[2.75em] md:h-[3.125em]
          text-[#333]
          placeholder:text-[#333]/40
          focus:outline-none
          focus:bg-[rgba(255,255,255,0.5)]
          focus:backdrop-blur-[2.6em]
          focus:border-[rgba(255,180,0,0.55)]
          focus:shadow-[0_0_1.2em_rgba(255,180,0,0.28)]
          transition-all duration-300
          text-[0.875em] md:text-[1em]
        "
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="
          w-full
          bg-[rgba(255,255,255,0.4)]
          backdrop-blur-[2.4em]
          border border-[rgba(255,255,255,0.5)]
          rounded-[1.25em]
          px-[1.25em]
          h-[2.75em] md:h-[3.125em]
          text-[#333]
          placeholder:text-[#333]/40
          focus:outline-none
          focus:bg-[rgba(255,255,255,0.5)]
          focus:backdrop-blur-[2.6em]
          focus:border-[rgba(255,180,0,0.55)]
          focus:shadow-[0_0_1.2em_rgba(255,180,0,0.28)]
          transition-all duration-300
          text-[0.875em] md:text-[1em]
        "
            />

            {/* Project Type */}
            <input
              type="text"
              name="projectType"
              placeholder="Project Type"
              value={formData.projectType}
              onChange={handleInputChange}
              className="
          w-full
          bg-[rgba(255,255,255,0.4)]
          backdrop-blur-[2.4em]
          border border-[rgba(255,255,255,0.5)]
          rounded-[1.25em]
          px-[1.25em]
          h-[2.75em] md:h-[3.125em]
          text-[#333]
          placeholder:text-[#333]/40
          focus:outline-none
          focus:bg-[rgba(255,255,255,0.5)]
          focus:backdrop-blur-[2.6em]
          focus:border-[rgba(255,180,0,0.55)]
          focus:shadow-[0_0_1.2em_rgba(255,180,0,0.28)]
          transition-all duration-300
          text-[0.875em] md:text-[1em]
        "
            />

            {/* Message */}
            <textarea
              name="message"
              placeholder="Message"
              rows={3}
              required
              value={formData.message}
              onChange={handleInputChange}
              className="
          w-full
          bg-[rgba(255,255,255,0.4)]
          backdrop-blur-[2.4em]
          border border-[rgba(255,255,255,0.5)]
          rounded-[1.25em]
          px-[1.25em]
          py-[0.75em] md:py-[0.875em]
          text-[#333]
          placeholder:text-[#333]/40
          focus:outline-none
          focus:bg-[rgba(255,255,255,0.5)]
          focus:backdrop-blur-[2.6em]
          focus:border-[rgba(255,180,0,0.55)]
          focus:shadow-[0_0_1.2em_rgba(255,180,0,0.28)]
          transition-all duration-300
          text-[0.875em] md:text-[1em]
          resize-none
          min-h-[4.375em] md:min-h-[6.25em]
        "
            />
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={status === "submitting"}
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(255,190,0,0.22)",
              boxShadow: "0 0.8em 1.8em rgba(255,170,0,0.3)",
            }}
            whileTap={{ scale: 0.98 }}
            style={{
              width: "7em",
              height: "2.5em",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffffff",
              backdropFilter: "blur(2.2em)",
              WebkitBackdropFilter: "blur(2.2em)",
              border: "1px solid rgba(255,255,255,0.6)",
              color: "#000000",
              fontWeight: "700",
              fontSize: "0.75em",
              borderRadius: "1.25em",
              textTransform: "uppercase",
              letterSpacing: "0.075em",
              boxShadow: "0 0.8em 2em rgba(255,255,255,0.4)",
              transition: "all 0.3s",
              cursor: "pointer",
            }}
          >
            {status === "submitting" ? "Submitting..." : "Submit"}
          </motion.button>
        </motion.form>

        {/* Success Message */}
        {status === "success" && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-[#FFB400] font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-[#FFB400] rounded-full animate-pulse" />
            Thank you! We’ll get back to you soon.
          </motion.p>
        )}

        {/* Error Message */}
        {status === "error" && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-red-500 font-medium"
          >
            Something went wrong. Please try again.
          </motion.p>
        )}

        <div
          style={{
            width: "100%",
            paddingBottom: "6em",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              zIndex: 100,
              isolation: "isolate",

              display: "flex",
              flexDirection: "column",
              gap: "1.5em",

              padding: "2.5em",
              maxWidth: "40em",
              width: "100%",
              borderRadius: "1.4em",

              /* 🔥 refined glass */
              background: "rgba(255, 255, 255, 0.45)",
              backdropFilter: "blur(2.5em) saturate(135%)",
              WebkitBackdropFilter: "blur(2.5em) saturate(135%)",

              border: "1px solid rgba(255,255,255,0.55)",

              boxShadow:
                "0 0.9em 2.2em -1em rgba(0,0,0,0.22), inset 0 0.08em 0 rgba(255,255,255,0.55)",

              overflow: "hidden",
              color: "#000",
              fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                borderRadius: "inherit",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,255,255,0.05) 60%)",
                opacity: 0.5,
              }}
            />
            {/* soft highlight */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.8), transparent 60%, rgba(255,255,255,0.3)) !important",
                opacity: 0.6,
              }}
            />

            {/* content */}
            <div
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "1.5em",
              }}
            >
              {/* Call */}
              <div>
                <div
                  style={{
                    fontSize: "0.7em",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    opacity: 0.6,
                    marginBottom: "0.3em",
                  }}
                >
                  Call Us
                </div>
                <div
                  style={{
                    fontSize: "0.95em",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                  }}
                >
                  98198&nbsp;86633
                </div>
              </div>

              {/* Email */}
              <div className="email-link">
                <div
                  style={{
                    fontSize: "0.7em",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    opacity: 0.6,
                    marginBottom: "0.3em",
                  }}
                >
                  Email Us
                </div>
                <a
                  href="mailto:studio@aakritcinematic.in"
                  style={{
                    fontSize: "0.95em",
                    fontWeight: 600,
                    color: "#000",
                    textDecoration: "none",
                    position: "relative",
                  }}
                >
                  studio@aakritcinematic.in
                </a>
              </div>

              {/* Address */}
              <div>
                <div
                  style={{
                    fontSize: "0.7em",
                    letterSpacing: "0.35em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    opacity: 0.6,
                    marginBottom: "0.3em",
                  }}
                >
                  Visit Us
                </div>
                <p
                  style={{
                    fontSize: "0.95em",
                    fontWeight: 500,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  15-2, Vishwa Niwas, Third Floor, Chandrodaya CHS, Thakkar
                  Bappa Colony Rd, Near Swastik Park, Chembur, Mumbai,
                  Maharashtra 400071
                </p>
              </div>
            </div>

            {/* scoped styles for underline */}
            <style>
              {`
        .email-link a::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: -0.15em;
          height: 0.08em;
          width: 0;
          background: #000;
          transition: width 0.3s ease;
        }

        .email-link a:hover::after {
          width: 100%;
        }
      `}
            </style>
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="
    absolute
    bottom-[2em] md:bottom-10
    left-1/2 -translate-x-1/2
    z-[50]
    px-[1.2em] py-[0.6em]
    text-black
    text-[0.5625em] md:text-[0.6875em]
    uppercase
    tracking-[0.35em]
    whitespace-nowrap
    font-extrabold
    bg-[rgba(255,255,255,0.35)]
    backdrop-blur-[1.2em]
    rounded-full
    shadow-[0_0.4em_1.2em_rgba(0,0,0,0.18)]
  "
      >
        © 2025 AAKRIT CINEMATIC SOLUTIONS. ALL RIGHTS RESERVED.
      </motion.p>
    </section>
  );
};

export default Contact;
