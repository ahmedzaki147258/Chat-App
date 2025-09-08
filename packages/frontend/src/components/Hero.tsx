'use client';

import { JSX, Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useAuth } from '@/hooks/useAuth';

// 3D Animated Sphere Component
function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.4) * 0.1;
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
      <MeshDistortMaterial
        color="#4f46e5"
        attach="material"
        distort={0.3}
        speed={1.5}
        roughness={0.2}
        metalness={0.8}
      />
    </Sphere>
  );
}

// Fallback gradient background for when 3D doesn't load
function GradientFallback() {
  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl"
      animate={{
        background: [
          "linear-gradient(45deg, rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))",
          "linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2), rgba(79, 70, 229, 0.2))",
          "linear-gradient(225deg, rgba(168, 85, 247, 0.2), rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.2))",
          "linear-gradient(45deg, rgba(79, 70, 229, 0.2), rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))"
        ]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
  );
}

// Floating particles animation
function FloatingParticles() {
  const [particles, setParticles] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 20 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-2 h-2 bg-primary/30 rounded-full"
        initial={{
          x: Math.random() * 800,
          y: Math.random() * 600,
        }}
        animate={{
          x: [
            Math.random() * 800,
            Math.random() * 800,
            Math.random() * 800,
            Math.random() * 800
          ],
          y: [
            Math.random() * 600,
            Math.random() * 600,
            Math.random() * 600,
            Math.random() * 600
          ],
          opacity: [0.3, 0.8, 0.3, 0.8],
          scale: [1, 1.5, 1, 1.5]
        }}
        transition={{
          duration: 10 + Math.random() * 10,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * 5
        }}
      />
    ));
    setParticles(generated);
  }, []);

  return <div className="absolute inset-0 overflow-hidden rounded-3xl">{particles}</div>;
}

interface HeroProps {
  onGetStarted?: () => void;
}

export default function Hero({ onGetStarted }: HeroProps) {
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      // Default behavior - scroll to features or open login
      if (isAuthenticated) {
        window.location.href = '/conversations';
      } else {
        // This would typically trigger the login modal
        console.log('Open login modal');
      }
    }
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4 py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <GradientFallback />
        <FloatingParticles />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            className="text-center lg:text-left space-y-8"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.h1
              className="text-5xl lg:text-7xl font-bold text-base-content leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Welcome to{' '}
              <motion.span
                className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%']
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{
                  backgroundSize: '200% 100%'
                }}
              >
                UltraChat
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl lg:text-2xl text-base-content/80 max-w-2xl mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Experience the future of conversations with our advanced AI-powered chat platform. 
              Intelligent, fast, and beautifully designed.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.button
                className="btn btn-primary btn-lg px-8 text-lg focus-ring"
                onClick={handleGetStarted}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <span className="mr-2">🚀</span>
                {isAuthenticated ? 'Start Chatting' : 'Get Started'}
              </motion.button>

              <motion.button
                className="btn btn-outline btn-lg px-8 text-lg focus-ring"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ 
                    behavior: 'smooth' 
                  });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                Learn More
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">1M+</div>
                <div className="text-sm text-base-content/70">Messages Sent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">50K+</div>
                <div className="text-sm text-base-content/70">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">99.9%</div>
                <div className="text-sm text-base-content/70">Uptime</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 3D Visual */}
          <motion.div
            className="relative h-[500px] w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl backdrop-blur-sm">
              <Suspense fallback={<GradientFallback />}>
                <Canvas
                  camera={{ position: [0, 0, 5], fov: 75 }}
                  className="rounded-3xl"
                >
                  <ambientLight intensity={0.6} />
                  <spotLight 
                    position={[10, 10, 10]} 
                    angle={0.15} 
                    penumbra={1} 
                    intensity={1}
                    castShadow
                  />
                  <pointLight position={[-10, -10, -10]} intensity={0.5} />
                  <AnimatedSphere />
                  <OrbitControls 
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                  />
                </Canvas>
              </Suspense>
            </div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-16 h-16 bg-primary/20 rounded-full blur-xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-8 -left-8 w-24 h-24 bg-secondary/20 rounded-full blur-xl"
              animate={{
                scale: [1.5, 1, 1.5],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-base-content/30 rounded-full flex justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-base-content/50 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}