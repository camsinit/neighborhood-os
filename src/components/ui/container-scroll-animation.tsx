"use client";

import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

/**
 * ContainerScroll - A scroll-triggered animation component
 * 
 * This component creates a 3D perspective effect where content scales and rotates
 * based on scroll position. It's responsive and adapts to mobile vs desktop viewing.
 */
export const ContainerScroll = ({
  titleComponent,
  children
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  // Reference to the container element for scroll tracking
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within this specific container
  const {
    scrollYProgress
  } = useScroll({
    target: containerRef
  });

  // State to handle responsive behavior
  const [isMobile, setIsMobile] = React.useState(false);

  // Effect to detect mobile vs desktop screen sizes
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

  // Different scale values for mobile and desktop
  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  // Transform scroll progress into animation values
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]); // Rotate from 20deg to 0deg
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions()); // Scale animation
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]); // Translate upward

  return <div ref={containerRef} className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20 py-0">
      <div className="py-10 md:py-40 w-full relative" style={{
      perspective: "1000px" // CSS 3D perspective for the rotation effect
    }}>
        {/* Header section with title that moves with scroll */}
        <Header translate={translate} titleComponent={titleComponent} />
        {/* Card section with the main content that rotates and scales */}
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>;
};

/**
 * Header component that translates vertically based on scroll
 */
export const Header = ({
  translate,
  titleComponent
}: any) => {
  return <motion.div style={{
    translateY: translate
  }} className="div max-w-5xl mx-auto text-center">
      {titleComponent}
    </motion.div>;
};

/**
 * Card component that contains the main content with 3D transform effects
 */
export const Card = ({
  rotate,
  scale,
  children
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return <motion.div style={{
    rotateX: rotate,
    // 3D rotation on X-axis
    scale,
    // Scale transformation
    // Complex box shadow for depth effect
    boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003"
  }} className="max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full border-4 border-[#6C6C6C] p-2 md:p-6 bg-[#222222] rounded-[30px] shadow-2xl">
      <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-900 md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>;
};