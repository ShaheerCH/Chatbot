'use client';
import React from 'react';
import { SparklesCore } from './ui/sparkles';

export default function SparklesPreview() {
  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-none">
      <div className="w-full h-40 relative">
        {/* Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />

        {/* Radial Gradient to prevent sharp edges */}
        <div className="absolute inset-0 w-full h-full bg-black [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
      </div>
    </div>
  );
}
