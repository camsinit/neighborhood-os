
"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

/**
 * ContainerScroll - A scroll-based animation component
 * 
 * This component creates a 3D perspective effect where content scales and rotates
 * based on scroll position. Perfect for hero sections and feature showcases.
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
  
  // Track scroll progress within this specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  
  // State to track if we're on mobile for responsive scaling
  const [isMobile, setIsMobile] = React.useState(false);

  // Set up responsive breakpoint detection
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

  // Define different scale ranges for mobile vs desktop
  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  // Transform scroll progress into animation values
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]); // Starts tilted, becomes flat
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions()); // Scales from large to normal
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]); // Moves up as user scrolls

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px", // Enables 3D perspective for the rotation effect
        }}
      >
        {/* Header section that moves with scroll */}
        <Header translate={translate} titleComponent={titleComponent} />
        
        {/* Main card that rotates and scales with scroll */}
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

/**
 * Header component that translates vertically with scroll
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
 * Card component that applies 3D transformations based on scroll
 * Creates a device mockup appearance with shadows and borders
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
        rotateX: rotate, // 3D rotation on X axis
        scale, // Overall scaling
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl"
    >
      {/* Inner container that holds the actual content */}
      <div className=" h-full w-full  overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4 ">
        {children}
      </div>
    </motion.div>
  );
};
