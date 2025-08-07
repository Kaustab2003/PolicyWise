'use client';
import { useEffect, useRef } from 'react';

interface SplineViewerProps {
  url: string;
  className?: string;
}

const SplineViewer = ({ url, className = "" }: SplineViewerProps) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewerRef.current) return;
    let viewer: HTMLElement;

    const loadSpline = async () => {
      // Dynamically import the Spline Viewer
      const { Application } = await import('@splinetool/runtime');
      
      // Ensure the container is empty
      if (viewerRef.current) {
        viewerRef.current.innerHTML = '';
      }

      const canvas = document.createElement('canvas');
      viewerRef.current?.appendChild(canvas);
      
      const spline = new Application(canvas);
      await spline.load(url);
      viewer = canvas;
    };

    loadSpline();

    return () => {
      if (viewer && viewer.parentElement) {
        viewer.parentElement.removeChild(viewer);
      }
    };
  }, [url]);

  return <div ref={viewerRef} className={className} />;
};

export default SplineViewer;
