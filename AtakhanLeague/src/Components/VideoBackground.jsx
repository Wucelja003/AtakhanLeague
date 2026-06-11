import { useState } from 'react';

export default function VideoBackground() {
  const [ready, setReady] = useState(false);

  return (
    <div className="absolute top-0 left-0 w-full h-[110vh] sm:h-[115vh] z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setReady(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/AtakhanMovie.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/70" />
    </div>
  );
}
