"use client";

import { motion } from "framer-motion";
import heroImage from "../../../public/hero-books.jpg";
import logo from "../../../public/logo-horizontal.svg";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Hero Image"
          className="h-full w-full object-cover"
          priority
          placeholder="blur"
          sizes="100vw"
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
          <Image
            src={logo}
            alt="Entre Livros Logo"
            className="mx-auto brightness-0 invert drop-shadow-2xl"
            width={300}
            height={300}

          />
          <p className="mt-4 font-body text-lg text-primary-foreground/80 text-justify">
            Recomendações e opiniões de livros para apaixonados por leitura. <br />Descobre novas histórias e autores através das minhas leituras.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;