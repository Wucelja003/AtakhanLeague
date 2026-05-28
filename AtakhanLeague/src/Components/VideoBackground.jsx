export default function VideoBackground() {
  return (
    <div className="absolute top-0 left-0 w-full h-screen z-0 overflow-hidden pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/AtakhanMovie.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/85" />
    </div>
  );
}
