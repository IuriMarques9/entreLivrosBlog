import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import heroImage from "@/assets/hero-books.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Books and coffee on a wooden table"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>
      <div className="relative flex min-h-[420px] items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl text-center"
        >
          <div className="mb-4 flex items-center justify-center gap-2">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl md:text-6xl">
            Between the Pages
          </h1>
          <p className="mt-4 font-body text-lg text-primary-foreground/80">
            Honest reviews & heartfelt recommendations from my reading journey
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
