import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Experience } from "@/components/sections/Experience";
import { Skills } from "@/components/sections/Skills";
import { Certifications } from "@/components/sections/Certifications";
import { Connect } from "@/components/sections/Connect";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Projects />
      <Experience />
      <Skills />
      <Certifications />
      <Connect />
    </>
  );
}
