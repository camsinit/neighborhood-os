
"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

/**
 * ContainerScroll Component
 * 
 * Creates a smooth scroll-triggered animation where content scales and rotates
 * as the user scrolls. Perfect for hero sections and feature showcases.
 */
export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  // Reference to the container element for scroll tracking
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress within this container
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  
  // State to track if we're on mobile for responsive animations
  const [isMobile, setIsMobile] = React.useState(false);

  // Effect to detect mobile screen size and add resize listener
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Different scale dimensions for mobile vs desktop
  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  // Transform values that change based on scroll progress
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]); // Rotate from 20deg to 0deg
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions()); // Scale animation
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]); // Move upward

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px", // 3D perspective for the rotation effect
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

/**
 * Header Component
 * 
 * Animated header that moves with scroll progress
 */
export const Header = ({ translate, titleComponent }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div max-w-5xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

/**
 * Card Component
 * 
 * The main content card that rotates and scales based on scroll
 */
export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate, // 3D rotation on X-axis
        scale, // Scale transformation
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      <div className=" h-full w-full  overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4 ">
        {children}
      </div>
    </motion.div>
  );
};
